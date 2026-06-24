'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MidiInputController } from '@/app/utils/useMidiInput';
import type { SynthController } from '@/app/utils/useSynth';
import { parseMidiFile } from '@/app/utils/midiFileParser';
import { parseGuitarProFile, UnsupportedScoreFormatError } from '@/app/utils/guitarProParser';
import type { NoteTimelineEntry, ParsedScore } from '@/app/utils/scoreTypes';
import { ScoreFollowEngine, type GradedNote, type NoteJudgement } from '@/app/utils/scoreFollow';
import { noteNameFromMidi } from '@/app/utils/notes';
import PianoKeyboard from '@/app/components/PianoKeyboard';

interface PlayAlongProps {
    midi: MidiInputController;
    synth: SynthController;
}

type FileKind = 'gp' | 'midi';
type RunState = 'idle' | 'running' | 'paused' | 'finished';

const GUITAR_PRO_EXTENSIONS = new Set(['gp', 'gp3', 'gp4', 'gp5', 'gpx']);
const STRICTNESS_OPTIONS: { label: string; hitWindowMs: number }[] = [
    { label: 'Relaxed (±300ms)', hitWindowMs: 300 },
    { label: 'Normal (±200ms)', hitWindowMs: 200 },
    { label: 'Strict (±120ms)', hitWindowMs: 120 },
];

const PIXELS_PER_MS = 0.15;
const PLAYHEAD_FRACTION = 0.18;
const NOTE_ROW_HEIGHT = 7;
const MIN_ROLL_HEIGHT = 140;
const MAX_ROLL_HEIGHT = 360;

function formatTime(ms: number): string {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function judgementColor(judgement: NoteJudgement): string {
    switch (judgement) {
        case 'hit':
            return '#22c55e';
        case 'wrong':
            return '#ef4444';
        case 'missed':
            return '#64748b';
        default:
            return '#818cf8';
    }
}

const PlayAlong: React.FC<PlayAlongProps> = ({ midi, synth }) => {
    const [parsed, setParsed] = useState<ParsedScore | null>(null);
    const [fileKind, setFileKind] = useState<FileKind | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedTrack, setSelectedTrack] = useState(0);
    const [speed, setSpeed] = useState(1);
    const [hitWindowMs, setHitWindowMs] = useState(STRICTNESS_OPTIONS[1].hitWindowMs);
    const [runState, setRunState] = useState<RunState>('idle');
    const [report, setReport] = useState<ReturnType<ScoreFollowEngine['getReport']> | null>(null);
    const [gradedNotes, setGradedNotes] = useState<GradedNote[]>([]);
    const [heldClickNotes, setHeldClickNotes] = useState<Set<number>>(new Set());

    const engineRef = useRef<ScoreFollowEngine | null>(null);
    const elapsedAtPauseRef = useRef(0);
    const runStartPerfRef = useRef(0);
    const prevActiveNotesRef = useRef<Set<number>>(new Set());
    const rollContainerRef = useRef<HTMLDivElement | null>(null);
    const containerWidthRef = useRef(0);
    const scrollLayerRef = useRef<HTMLDivElement | null>(null);
    const timeLabelRef = useRef<HTMLSpanElement | null>(null);

    const combinedActiveNotes = useMemo(
        () => new Set<number>([...midi.activeNotes, ...heldClickNotes]),
        [midi.activeNotes, heldClickNotes]
    );

    const trackNotes = useMemo<NoteTimelineEntry[]>(() => {
        if (!parsed) return [];
        return parsed.notes.filter((n) => n.track === selectedTrack);
    }, [parsed, selectedTrack]);

    const trackNoteCounts = useMemo(() => {
        if (!parsed) return [] as number[];
        return parsed.trackNames.map((_, i) => parsed.notes.filter((n) => n.track === i).length);
    }, [parsed]);

    const pitchRange = useMemo(() => {
        if (trackNotes.length === 0) return { min: 48, max: 72 };
        let min = Infinity;
        let max = -Infinity;
        trackNotes.forEach((n) => {
            if (n.pitch < min) min = n.pitch;
            if (n.pitch > max) max = n.pitch;
        });
        return { min: Math.max(0, min - 2), max: Math.min(127, max + 2) };
    }, [trackNotes]);

    const rollHeight = Math.min(
        MAX_ROLL_HEIGHT,
        Math.max(MIN_ROLL_HEIGHT, (pitchRange.max - pitchRange.min + 1) * NOTE_ROW_HEIGHT)
    );

    const pitchToTop = useCallback(
        (pitch: number) => (pitchRange.max - pitch) * NOTE_ROW_HEIGHT,
        [pitchRange]
    );

    // Rebuild the grading engine whenever the active note set changes (new
    // file, different track, or a strictness change while idle). Reset is done
    // during render (React's documented pattern for "adjust state when inputs
    // change") rather than in an effect, since it's a pure derivation of
    // trackNotes/hitWindowMs and doesn't need to run as a separate commit.
    const engine = useMemo(
        () => (trackNotes.length > 0 ? new ScoreFollowEngine(trackNotes, hitWindowMs) : null),
        [trackNotes, hitWindowMs]
    );
    const [prevEngine, setPrevEngine] = useState(engine);
    if (engine !== prevEngine) {
        setPrevEngine(engine);
        setGradedNotes(engine ? engine.notes.slice() : []);
        setReport(null);
        setRunState('idle');
    }

    // Refs are only for imperative access from event handlers/the rAF loop, so
    // their synchronization belongs in an effect rather than the render body.
    useEffect(() => {
        engineRef.current = engine;
        prevActiveNotesRef.current = new Set();
        elapsedAtPauseRef.current = 0;
    }, [engine]);

    useEffect(() => {
        const el = rollContainerRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return;
        const update = () => {
            containerWidthRef.current = el.clientWidth;
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const getSongMs = useCallback((): number => {
        if (runState !== 'running') return elapsedAtPauseRef.current;
        return elapsedAtPauseRef.current + (performance.now() - runStartPerfRef.current) * speed;
    }, [runState, speed]);

    // The follow-mode playhead/grading clock — drives DOM mutations directly
    // (scroll transform, time label) rather than React state so the 60fps loop
    // doesn't force a full re-render; only note judgement changes bump state.
    useEffect(() => {
        if (runState !== 'running' || !engineRef.current || !parsed) return;
        const engine = engineRef.current;
        const baseElapsed = elapsedAtPauseRef.current;
        const startPerf = runStartPerfRef.current;
        let rafId = 0;

        const tick = () => {
            const nowMs = baseElapsed + (performance.now() - startPerf) * speed;
            const changed = engine.update(nowMs);
            if (changed.length > 0) setGradedNotes(engine.notes.slice());

            const playheadX = containerWidthRef.current * PLAYHEAD_FRACTION;
            if (scrollLayerRef.current) {
                scrollLayerRef.current.style.transform = `translateX(${playheadX - nowMs * PIXELS_PER_MS}px)`;
            }
            if (timeLabelRef.current) {
                timeLabelRef.current.textContent = `${formatTime(nowMs)} / ${formatTime(parsed.durationMs)}`;
            }

            if (nowMs > parsed.durationMs + hitWindowMs + 500) {
                setReport(engine.getReport());
                setRunState('finished');
                return;
            }
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [runState, speed, parsed, hitWindowMs]);

    // Mirrors the activeNotes-diffing pattern used elsewhere (page.tsx,
    // EarTraining.tsx): the MIDI hook only exposes a live Set, so newly
    // appeared notes are detected by diffing against the previous render.
    useEffect(() => {
        const prev = prevActiveNotesRef.current;
        const engine = engineRef.current;
        if (runState === 'running' && engine) {
            const nowMs = getSongMs();
            let matched = false;
            combinedActiveNotes.forEach((note) => {
                if (!prev.has(note)) {
                    engine.noteOn(note, nowMs);
                    matched = true;
                }
            });
            if (matched) setGradedNotes(engine.notes.slice());
        }
        prevActiveNotesRef.current = combinedActiveNotes;
    }, [combinedActiveNotes, runState, getSongMs]);

    const handleFile = useCallback(async (file: File) => {
        setIsLoading(true);
        setLoadError(null);
        setRunState('idle');
        setReport(null);
        try {
            const buffer = await file.arrayBuffer();
            const ext = file.name.toLowerCase().split('.').pop() ?? '';
            let result: ParsedScore;
            let kind: FileKind;
            if (ext === 'mid' || ext === 'midi') {
                result = parseMidiFile(buffer, file.name);
                kind = 'midi';
            } else if (GUITAR_PRO_EXTENSIONS.has(ext)) {
                result = await parseGuitarProFile(buffer, file.name);
                kind = 'gp';
            } else {
                throw new Error('Unsupported file type. Use .gp, .gp3, .gp4, .gp5, .gpx, .mid, or .midi.');
            }
            if (result.notes.length === 0) {
                throw new Error('No playable notes were found in this file.');
            }
            setParsed(result);
            setFileKind(kind);
            setSelectedTrack(0);
        } catch (err) {
            setParsed(null);
            setFileKind(null);
            if (err instanceof UnsupportedScoreFormatError) {
                setLoadError(`Could not read this Guitar Pro file: ${err.message}`);
            } else {
                setLoadError(err instanceof Error ? err.message : 'Failed to load this file.');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) void handleFile(file);
        e.target.value = '';
    };

    const start = useCallback(() => {
        const engine = engineRef.current;
        if (!engine) return;
        engine.reset();
        elapsedAtPauseRef.current = 0;
        runStartPerfRef.current = performance.now();
        prevActiveNotesRef.current = new Set();
        setReport(null);
        setGradedNotes(engine.notes.slice());
        setRunState('running');
    }, []);

    const pause = useCallback(() => {
        elapsedAtPauseRef.current = elapsedAtPauseRef.current + (performance.now() - runStartPerfRef.current) * speed;
        setRunState('paused');
    }, [speed]);

    const resume = useCallback(() => {
        runStartPerfRef.current = performance.now();
        setRunState('running');
    }, []);

    const stopEarly = useCallback(() => {
        const engine = engineRef.current;
        if (!engine) return;
        engine.update(Infinity);
        setReport(engine.getReport());
        setRunState('finished');
    }, []);

    const handleKeyboardNoteOn = useCallback(
        (note: number) => {
            setHeldClickNotes((current) => new Set(current).add(note));
            synth.noteOn(note);
        },
        [synth]
    );
    const handleKeyboardNoteOff = useCallback(
        (note: number) => {
            setHeldClickNotes((current) => {
                const next = new Set(current);
                next.delete(note);
                return next;
            });
            synth.noteOff(note);
        },
        [synth]
    );

    const liveCounts = useMemo(() => {
        let hit = 0;
        let wrong = 0;
        let missed = 0;
        gradedNotes.forEach((n) => {
            if (n.judgement === 'hit') hit++;
            else if (n.judgement === 'wrong') wrong++;
            else if (n.judgement === 'missed') missed++;
        });
        return { hit, wrong, missed };
    }, [gradedNotes]);

    return (
        <div className="theme-card rounded-lg p-4 md:p-6 shadow-lg">
            <h2 className="text-2xl font-bold theme-text mb-2">Play Along</h2>
            <p className="theme-secondary-text text-sm mb-6">
                Import a Guitar Pro or MIDI file, then play it back on your MIDI keyboard (or the on-screen
                keyboard) in real time. Notes are graded live for pitch and rhythm accuracy as the playhead scrolls.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-4">
                <label className="px-3 py-1.5 theme-btn rounded-lg text-sm hover:opacity-90 cursor-pointer">
                    {isLoading ? 'Loading…' : 'Choose File'}
                    <input
                        type="file"
                        accept=".gp,.gp3,.gp4,.gp5,.gpx,.mid,.midi"
                        className="hidden"
                        onChange={onFileInputChange}
                        disabled={isLoading}
                    />
                </label>
                {parsed && (
                    <span className="theme-secondary-text text-sm">
                        {parsed.title} · {fileKind === 'gp' ? 'Guitar Pro' : 'MIDI'} · {trackNotes.length} notes
                    </span>
                )}
            </div>

            {loadError && (
                <p className="mb-4 text-sm text-red-400 bg-red-950/30 border border-red-500/30 rounded-lg px-3 py-2">
                    {loadError}
                </p>
            )}

            {parsed && (
                <>
                    <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-lg theme-secondary-bg">
                        <label className="flex items-center gap-2 text-sm theme-secondary-text">
                            Track:
                            <select
                                value={selectedTrack}
                                onChange={(e) => setSelectedTrack(Number(e.target.value))}
                                disabled={runState === 'running' || runState === 'paused'}
                                className="theme-muted-bg theme-secondary-text px-2 py-1 rounded-lg text-sm"
                            >
                                {parsed.trackNames.map((name, i) => (
                                    <option key={i} value={i}>
                                        {name} ({trackNoteCounts[i] ?? 0} notes)
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex items-center gap-2 text-sm theme-secondary-text">
                            Strictness:
                            <select
                                value={hitWindowMs}
                                onChange={(e) => setHitWindowMs(Number(e.target.value))}
                                disabled={runState === 'running' || runState === 'paused'}
                                className="theme-muted-bg theme-secondary-text px-2 py-1 rounded-lg text-sm"
                            >
                                {STRICTNESS_OPTIONS.map((opt) => (
                                    <option key={opt.hitWindowMs} value={opt.hitWindowMs}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex items-center gap-2 text-sm theme-secondary-text">
                            Speed: {Math.round(speed * 100)}%
                            <input
                                type="range"
                                min={0.5}
                                max={1.25}
                                step={0.05}
                                value={speed}
                                onChange={(e) => setSpeed(Number(e.target.value))}
                                className="w-28"
                            />
                        </label>

                        <span ref={timeLabelRef} className="theme-secondary-text text-sm tabular-nums">
                            0:00 / {formatTime(parsed.durationMs)}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        {(runState === 'idle' || runState === 'finished') && (
                            <button
                                onClick={start}
                                disabled={trackNotes.length === 0}
                                className="px-4 py-2 theme-btn rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                            >
                                ▶ Start
                            </button>
                        )}
                        {runState === 'running' && (
                            <>
                                <button
                                    onClick={pause}
                                    className="px-4 py-2 theme-muted-bg theme-secondary-text rounded-lg font-medium hover:opacity-90"
                                >
                                    ⏸ Pause
                                </button>
                                <button
                                    onClick={stopEarly}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:opacity-90"
                                >
                                    ■ Stop
                                </button>
                            </>
                        )}
                        {runState === 'paused' && (
                            <>
                                <button
                                    onClick={resume}
                                    className="px-4 py-2 theme-btn rounded-lg font-medium hover:opacity-90"
                                >
                                    ▶ Resume
                                </button>
                                <button
                                    onClick={stopEarly}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:opacity-90"
                                >
                                    ■ Stop
                                </button>
                            </>
                        )}

                        {(runState === 'running' || runState === 'paused') && (
                            <span className="text-sm theme-secondary-text">
                                Hit: <span className="text-green-400">{liveCounts.hit}</span> · Wrong:{' '}
                                <span className="text-red-400">{liveCounts.wrong}</span> · Missed:{' '}
                                <span className="text-slate-400">{liveCounts.missed}</span>
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-4 mb-2 text-xs theme-secondary-text">
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: judgementColor('pending') }} /> Upcoming
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: judgementColor('hit') }} /> Hit
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: judgementColor('wrong') }} /> Wrong note
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: judgementColor('missed') }} /> Missed
                        </span>
                    </div>

                    <div
                        ref={rollContainerRef}
                        className="relative w-full overflow-hidden rounded-lg theme-secondary-bg"
                        style={{ height: rollHeight }}
                    >
                        <div
                            className="absolute top-0 bottom-0 w-px bg-yellow-400 z-10"
                            style={{ left: `${PLAYHEAD_FRACTION * 100}%` }}
                        />
                        <div ref={scrollLayerRef} className="absolute top-0 left-0" style={{ willChange: 'transform' }}>
                            {gradedNotes.map((note) => (
                                <div
                                    key={note.id}
                                    title={`${noteNameFromMidi(note.pitch)}${Math.floor(note.pitch / 12) - 1}`}
                                    style={{
                                        position: 'absolute',
                                        left: note.startMs * PIXELS_PER_MS,
                                        top: pitchToTop(note.pitch),
                                        width: Math.max(note.durationMs * PIXELS_PER_MS, 3),
                                        height: NOTE_ROW_HEIGHT - 1,
                                        backgroundColor: judgementColor(note.judgement),
                                        opacity: note.judgement === 'missed' ? 0.5 : 0.95,
                                        borderRadius: 2,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="mt-4">
                        <PianoKeyboard
                            activeNotes={combinedActiveNotes}
                            onNoteOn={handleKeyboardNoteOn}
                            onNoteOff={handleKeyboardNoteOff}
                            startMidi={Math.max(0, pitchRange.min - 3)}
                            endMidi={Math.min(127, pitchRange.max + 3)}
                        />
                    </div>

                    {midi.permission !== 'granted' && (
                        <p className="mt-3 text-sm text-yellow-400">
                            Connect a MIDI device from the panel above for hands-on grading, or use the on-screen
                            keyboard.
                        </p>
                    )}

                    {report && runState === 'finished' && (
                        <div className="mt-6 p-4 rounded-lg theme-secondary-bg">
                            <h3 className="theme-text font-semibold mb-3">Session Report</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                <div>
                                    <p className="theme-secondary-text">Accuracy</p>
                                    <p className="theme-text text-xl font-bold">{report.accuracyPct}%</p>
                                </div>
                                <div>
                                    <p className="theme-secondary-text">Hit</p>
                                    <p className="text-green-400 text-xl font-bold">{report.hit}</p>
                                </div>
                                <div>
                                    <p className="theme-secondary-text">Wrong</p>
                                    <p className="text-red-400 text-xl font-bold">{report.wrong}</p>
                                </div>
                                <div>
                                    <p className="theme-secondary-text">Missed</p>
                                    <p className="text-slate-400 text-xl font-bold">{report.missed}</p>
                                </div>
                            </div>
                            <p className="theme-secondary-text text-sm mt-3">
                                Extra notes played: {report.extraNotes}
                                {report.averageTimingErrorMs !== null && (
                                    <>
                                        {' · '}
                                        Timing: {Math.abs(report.averageTimingErrorMs) < 15
                                            ? 'right on time, on average'
                                            : `${Math.abs(report.averageTimingErrorMs)}ms ${
                                                  report.averageTimingErrorMs < 0 ? 'early on average (rushing)' : 'late on average (dragging)'
                                              }`}
                                    </>
                                )}
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PlayAlong;
