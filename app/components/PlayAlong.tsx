'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FolderOpen, Trash2 } from 'lucide-react';
import type { MidiInputController } from '@/app/utils/useMidiInput';
import type { AudioInputController } from '@/app/utils/useAudioInput';
import type { SynthController } from '@/app/utils/useSynth';
import { parseMidiFile } from '@/app/utils/midiFileParser';
import { parseGuitarProFile, UnsupportedScoreFormatError } from '@/app/utils/guitarProParser';
import type { NoteTimelineEntry, ParsedScore } from '@/app/utils/scoreTypes';
import type { RhythmEvent } from '@/app/utils/rhythmData';
import { ScoreFollowEngine, earliestPendingChord, type GradedNote, type NoteJudgement } from '@/app/utils/scoreFollow';
import { CHROMATIC_NOTES, noteNameFromMidi, pitchClassFromMidi, midiFromPitchClassAndOctave } from '@/app/utils/notes';
import {
    TUNING_PRESETS,
    STRING_COUNT_OPTIONS,
    defaultInstrumentFor,
    closestStringCount,
    fretForPitch,
    type Instrument,
} from '@/app/utils/tunings';
import PianoKeyboard from '@/app/components/PianoKeyboard';
import ScoreNotation, { type ClefOverride, type NoteLabelMode } from '@/app/components/ScoreNotation';
import NoteHighway from '@/app/components/NoteHighway';
import ShareButton from '@/app/components/ShareButton';
import { useAuth } from '@/app/utils/AuthContext';
import { getSupabaseClient } from '@/app/utils/supabaseClient';
import { listUserFiles, uploadUserFile, downloadUserFile, deleteUserFile, type UserFileRecord } from '@/app/utils/userFiles';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';

interface PlayAlongProps {
    midi: MidiInputController;
    audio: AudioInputController;
    synth: SynthController;
}

type FileKind = 'gp' | 'midi';
type RunState = 'idle' | 'running' | 'paused' | 'finished';
type ViewMode = 'roll' | 'notation' | 'highway';

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

const PlayAlong: React.FC<PlayAlongProps> = ({ midi, audio, synth }) => {
    const t = useTranslations('playAlong');
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
    const [viewMode, setViewMode] = useState<ViewMode>('notation');
    const [waitMode, setWaitMode] = useState(false);
    const [loopEnabled, setLoopEnabled] = useState(false);
    const [loopStartMs, setLoopStartMs] = useState(0);
    const [loopEndMs, setLoopEndMs] = useState(0);
    const [transposeSemitones, setTransposeSemitones] = useState(0);
    const [customTunings, setCustomTunings] = useState<Record<number, { instrument: Instrument; notes: number[] } | null>>({});
    const [showTuningPanel, setShowTuningPanel] = useState(false);
    const [clefOverride, setClefOverride] = useState<ClefOverride>('auto');
    const [showTab, setShowTab] = useState(true);
    const [noteLabelMode, setNoteLabelMode] = useState<NoteLabelMode>('off');
    const [vizFullView, setVizFullView] = useState(false);
    const [vizPortalSlot, setVizPortalSlot] = useState<HTMLDivElement | null>(null);
    const [metronomeOn, setMetronomeOn] = useState(false);
    const [metronomeBpm, setMetronomeBpm] = useState(120);

    const { user } = useAuth();
    const supabase = useMemo(() => getSupabaseClient(), []);
    const [myFiles, setMyFiles] = useState<UserFileRecord[]>([]);
    const [showMyFiles, setShowMyFiles] = useState(false);
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    const refreshMyFiles = useCallback(() => {
        if (!supabase || !user) return;
        void listUserFiles(supabase, user.id).then(setMyFiles);
    }, [supabase, user]);

    useEffect(() => {
        if (user) refreshMyFiles();
    }, [user, refreshMyFiles]);

    const engineRef = useRef<ScoreFollowEngine | null>(null);
    const elapsedAtPauseRef = useRef(0);
    const runStartPerfRef = useRef(0);
    const prevActiveNotesRef = useRef<Set<number>>(new Set());
    const rollContainerRef = useRef<HTMLDivElement | null>(null);
    const containerWidthRef = useRef(0);
    const scrollLayerRef = useRef<HTMLDivElement | null>(null);
    const timeLabelRef = useRef<HTMLSpanElement | null>(null);

    const combinedActiveNotes = useMemo(
        () => new Set<number>([...midi.activeNotes, ...audio.activeNotes, ...heldClickNotes]),
        [midi.activeNotes, audio.activeNotes, heldClickNotes]
    );

    const trackNotes = useMemo<NoteTimelineEntry[]>(() => {
        if (!parsed) return [];
        return parsed.notes.filter((n) => n.track === selectedTrack);
    }, [parsed, selectedTrack]);

    const trackNoteCounts = useMemo(() => {
        if (!parsed) return [] as number[];
        return parsed.trackNames.map((_, i) => parsed.notes.filter((n) => n.track === i).length);
    }, [parsed]);

    // The song's original open-string MIDI pitches for the selected track
    // (null for non-fretted tracks like piano/drums), and any player-chosen
    // override for it. Re-fretting (below) prefers the override, falling
    // back to the original tuning only when transposing needs to re-derive
    // fret positions on the song's own strings.
    const originalTuningMidi = parsed?.trackTuningMidi?.[selectedTrack] ?? null;
    const activeTuning = customTunings[selectedTrack] ?? null;

    // Transpose and/or custom-tuning re-fretting, applied as a derivation
    // over the parsed notes rather than mutating them - pitch shifts what the
    // player must actually play, and a tuning override changes which
    // string/fret displays that pitch without altering the pitch itself.
    const effectiveTrackNotes = useMemo<NoteTimelineEntry[]>(() => {
        if (transposeSemitones === 0 && !activeTuning) return trackNotes;
        const tuningMidi = activeTuning?.notes ?? originalTuningMidi;
        return trackNotes.map((n) => {
            const pitch = n.pitch + transposeSemitones;
            if (!tuningMidi) return { ...n, pitch };
            const pos = fretForPitch(pitch, tuningMidi);
            return { ...n, pitch, string: pos?.string, fret: pos?.fret };
        });
    }, [trackNotes, transposeSemitones, activeTuning, originalTuningMidi]);

    const effectiveTuningNames = useMemo(() => {
        if (activeTuning) return activeTuning.notes.map((midi) => noteNameFromMidi(midi));
        return parsed?.trackTunings?.[selectedTrack] ?? null;
    }, [activeTuning, parsed, selectedTrack]);

    const pitchRange = useMemo(() => {
        if (effectiveTrackNotes.length === 0) return { min: 48, max: 72 };
        let min = Infinity;
        let max = -Infinity;
        effectiveTrackNotes.forEach((n) => {
            if (n.pitch < min) min = n.pitch;
            if (n.pitch > max) max = n.pitch;
        });
        return { min: Math.max(0, min - 2), max: Math.min(127, max + 2) };
    }, [effectiveTrackNotes]);

    const rollHeight = Math.min(
        MAX_ROLL_HEIGHT,
        Math.max(MIN_ROLL_HEIGHT, (pitchRange.max - pitchRange.min + 1) * NOTE_ROW_HEIGHT)
    );

    const pitchToTop = useCallback(
        (pitch: number) => (pitchRange.max - pitch) * NOTE_ROW_HEIGHT,
        [pitchRange]
    );

    // A C-note gridline + label per visible octave, since the roll otherwise
    // has no pitch axis at all - the only way to tell what a note is today is
    // a non-touch-friendly hover tooltip.
    const octaveMarkers = useMemo(() => {
        const markers: { pitch: number; top: number; label: string }[] = [];
        const startPitch = Math.ceil(pitchRange.min / 12) * 12;
        for (let pitch = startPitch; pitch <= pitchRange.max; pitch += 12) {
            markers.push({ pitch, top: pitchToTop(pitch), label: `C${Math.floor(pitch / 12) - 1}` });
        }
        return markers;
    }, [pitchRange, pitchToTop]);

    // Rebuild the grading engine whenever the active note set changes (new
    // file, different track, or a strictness change while idle). Reset is done
    // during render (React's documented pattern for "adjust state when inputs
    // change") rather than in an effect, since it's a pure derivation of
    // trackNotes/hitWindowMs and doesn't need to run as a separate commit.
    const engine = useMemo(
        () => (effectiveTrackNotes.length > 0 ? new ScoreFollowEngine(effectiveTrackNotes, hitWindowMs) : null),
        [effectiveTrackNotes, hitWindowMs]
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

    useEffect(() => {
        if (!vizFullView) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setVizFullView(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [vizFullView]);

    // The Piano Roll/Note Highway full-view toggle only makes sense for those
    // two modes - if the player switches to Staff+Tab while it's open, drop
    // it so an empty fixed-fullscreen overlay doesn't get stranded on screen
    // (Staff+Tab has its own, independent full-view inside ScoreNotation).
    const selectViewMode = useCallback((mode: ViewMode) => {
        setViewMode(mode);
        if (mode === 'notation') setVizFullView(false);
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
        let rafId = 0;

        const tick = () => {
            let nowMs = elapsedAtPauseRef.current + (performance.now() - runStartPerfRef.current) * speed;
            let stateDirty = false;

            // Loop practice: once the playhead reaches the section's end,
            // wrap back to its start and re-grade that range from scratch.
            const validLoop = loopEnabled && loopEndMs > loopStartMs;
            if (validLoop && nowMs >= loopEndMs) {
                engine.resetRange(loopStartMs, loopEndMs);
                nowMs = loopStartMs;
                elapsedAtPauseRef.current = loopStartMs;
                runStartPerfRef.current = performance.now();
                stateDirty = true;
            }

            // Wait mode: freeze the clock at the start of the earliest
            // still-pending note/chord until the correct pitch is played,
            // mirroring Piano Marvel's "wait for the correct note" mode.
            if (waitMode) {
                const gate = earliestPendingChord(engine.notes);
                if (gate.length > 0 && nowMs >= gate[0].startMs) {
                    nowMs = gate[0].startMs;
                    elapsedAtPauseRef.current = nowMs;
                    runStartPerfRef.current = performance.now();
                }
            }

            const changed = engine.update(nowMs);
            if (changed.length > 0 || stateDirty) setGradedNotes(engine.notes.slice());

            const playheadX = containerWidthRef.current * PLAYHEAD_FRACTION;
            if (scrollLayerRef.current) {
                scrollLayerRef.current.style.transform = `translateX(${playheadX - nowMs * PIXELS_PER_MS}px)`;
            }
            if (timeLabelRef.current) {
                timeLabelRef.current.textContent = `${formatTime(nowMs)} / ${formatTime(parsed.durationMs)}`;
            }

            if (!validLoop && nowMs > parsed.durationMs + hitWindowMs + 500) {
                setReport(engine.getReport());
                setRunState('finished');
                return;
            }
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [runState, speed, parsed, hitWindowMs, waitMode, loopEnabled, loopStartMs, loopEndMs]);

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
                    engine.noteOn(note, nowMs, { exactOnly: waitMode });
                    matched = true;
                }
            });
            if (matched) setGradedNotes(engine.notes.slice());
        }
        prevActiveNotesRef.current = combinedActiveNotes;
    }, [combinedActiveNotes, runState, getSongMs, waitMode]);

    // An independent click track, available with or without a loaded file -
    // mirrors RhythmSection.tsx's Reference-tab metronome (synth.playRhythm
    // re-triggered on a setInterval timed to the click batch's duration)
    // rather than coupling to the playhead rAF loop above, which would make
    // it unusable as a pre-roll before pressing Start.
    useEffect(() => {
        if (!metronomeOn) return;
        const clickPattern: RhythmEvent[] = Array.from({ length: 4 }, () => ({
            type: 'note', duration: 'quarter', beats: 1,
        }));
        const measureSeconds = 4 * (60 / metronomeBpm);
        synth.playRhythm(clickPattern, metronomeBpm);
        const interval = setInterval(() => synth.playRhythm(clickPattern, metronomeBpm), measureSeconds * 1000);
        return () => clearInterval(interval);
    }, [metronomeOn, metronomeBpm, synth]);

    const handleFile = useCallback(async (file: File, options?: { skipSave?: boolean }) => {
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
                result = await parseMidiFile(buffer, file.name);
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
            setMetronomeBpm(Math.round(result.notation?.tempoBpm[0] ?? 120));
            setSelectedTrack(0);
            setLoopEnabled(false);
            setLoopStartMs(0);
            setLoopEndMs(result.durationMs);
            setTransposeSemitones(0);
            setCustomTunings({});
            setShowTuningPanel(false);
            setClefOverride('auto');
            setShowTab(kind !== 'midi');

            if (!options?.skipSave && user && supabase) {
                setSaveState('saving');
                try {
                    await uploadUserFile(supabase, user.id, file, kind);
                    setSaveState('saved');
                    refreshMyFiles();
                } catch {
                    setSaveState('error');
                }
            } else {
                setSaveState('idle');
            }
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
    }, [user, supabase, refreshMyFiles]);

    const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) void handleFile(file);
        e.target.value = '';
    };

    const openSavedFile = useCallback(
        async (record: UserFileRecord) => {
            if (!supabase) return;
            setShowMyFiles(false);
            setIsLoading(true);
            try {
                const file = await downloadUserFile(supabase, record);
                await handleFile(file, { skipSave: true });
            } catch {
                setLoadError('Could not load this saved file.');
                setIsLoading(false);
            }
        },
        [supabase, handleFile]
    );

    const removeSavedFile = useCallback(
        async (record: UserFileRecord, e: React.MouseEvent) => {
            e.stopPropagation();
            if (!supabase) return;
            await deleteUserFile(supabase, record);
            refreshMyFiles();
        },
        [supabase, refreshMyFiles]
    );

    const start = useCallback(() => {
        const engine = engineRef.current;
        if (!engine) return;
        engine.reset();
        elapsedAtPauseRef.current = loopEnabled && loopEndMs > loopStartMs ? loopStartMs : 0;
        runStartPerfRef.current = performance.now();
        prevActiveNotesRef.current = new Set();
        setReport(null);
        setGradedNotes(engine.notes.slice());
        setRunState('running');
    }, [loopEnabled, loopStartMs, loopEndMs]);

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

    // Lazily creates this track's tuning override (seeded from the file's own
    // tuning) the first time the player edits a single string, so dragging
    // one string out of tune doesn't require first picking an instrument/
    // string-count preset.
    const updateTuningString = useCallback(
        (stringNum: number, newMidi: number) => {
            setCustomTunings((cur) => {
                const base = cur[selectedTrack]?.notes ?? originalTuningMidi ?? [];
                const instrument = cur[selectedTrack]?.instrument ?? defaultInstrumentFor(base.length);
                const notes = base.slice();
                notes[stringNum - 1] = newMidi;
                return { ...cur, [selectedTrack]: { instrument, notes } };
            });
        },
        [selectedTrack, originalTuningMidi]
    );

    const setTuningPreset = useCallback(
        (instrument: Instrument, stringCount: number) => {
            setCustomTunings((cur) => ({
                ...cur,
                [selectedTrack]: { instrument, notes: TUNING_PRESETS[instrument][stringCount].slice() },
            }));
        },
        [selectedTrack]
    );

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

    const effectiveViewMode: ViewMode = parsed?.notation ? viewMode : 'roll';

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

    // Rendered both inline (its normal position below the view-mode toggle)
    // and passed into ScoreNotation's `controls` prop, which surfaces it
    // inside the full-view overlay too — full view portals to document.body
    // with its own z-50 stacking context, so without this the transport
    // buttons would be covered and unreachable while full view is open.
    const transportControls = (
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
    );

    // Shared color-key for both the Piano Roll and Note Highway - previously
    // gated to Piano Roll only, so it vanished in Note Highway mode even
    // though that view uses the exact same judgement coloring.
    const vizLegend = (
        <div className="flex items-center gap-4 mb-2 text-xs theme-secondary-text flex-wrap">
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
    );

    const rollPanel = (
        <div
            ref={rollContainerRef}
            className="relative w-full overflow-hidden rounded-lg theme-secondary-bg"
            style={{ height: rollHeight, display: effectiveViewMode === 'roll' ? undefined : 'none' }}
        >
            {octaveMarkers.map((m) => (
                <div
                    key={m.pitch}
                    className="absolute left-0 right-0 border-t border-white/10 pointer-events-none"
                    style={{ top: m.top }}
                >
                    <span className="text-[10px] theme-secondary-text px-1 leading-none bg-black/30 rounded-sm">
                        {m.label}
                    </span>
                </div>
            ))}
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
    );

    const highwayPanel = parsed && parsed.notation && (
        <div style={{ display: effectiveViewMode === 'highway' ? undefined : 'none' }}>
            <NoteHighway
                notes={gradedNotes}
                getSongMs={getSongMs}
                running={runState === 'running'}
                durationMs={parsed.durationMs}
                tuningNames={effectiveTuningNames}
                onSwitchToRoll={() => selectViewMode('roll')}
            />
        </div>
    );

    // Shared by vizHeader (its normal, inline home) and vizContent's full-view
    // header (a second mount point) - plain buttons with no refs, so unlike
    // the time label below it's safe to render in either spot without
    // fighting over a single DOM node.
    const viewModeSwitcher = parsed && parsed.notation && (
        <div className="flex items-center gap-1 ml-auto">
            <button
                onClick={() => selectViewMode('roll')}
                className={`px-3 py-1 rounded-lg text-sm ${
                    effectiveViewMode === 'roll' ? 'theme-btn' : 'theme-muted-bg theme-secondary-text'
                }`}
            >
                Piano Roll
            </button>
            <button
                onClick={() => selectViewMode('notation')}
                className={`px-3 py-1 rounded-lg text-sm ${
                    effectiveViewMode === 'notation' ? 'theme-btn' : 'theme-muted-bg theme-secondary-text'
                }`}
            >
                {fileKind === 'midi' ? 'Staff' : 'Staff + Tab'}
            </button>
            <button
                onClick={() => selectViewMode('highway')}
                className={`px-3 py-1 rounded-lg text-sm ${
                    effectiveViewMode === 'highway' ? 'theme-btn' : 'theme-muted-bg theme-secondary-text'
                }`}
            >
                Note Highway
            </button>
        </div>
    );

    const vizHeader = parsed && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
            <span ref={timeLabelRef} className="theme-secondary-text text-sm tabular-nums">
                0:00 / {formatTime(parsed.durationMs)}
            </span>
            {viewModeSwitcher}
        </div>
    );

    // Piano Roll/Note Highway full view, mirroring ScoreNotation's own
    // createPortal-to-document.body pattern: portaling the *same* element
    // (rather than conditionally rendering two different trees) keeps the
    // roll's scroll/resize refs and the highway's rAF loop alive across the
    // toggle instead of remounting and resetting them.
    const vizContent = (
        <div className={vizFullView ? 'fixed inset-0 z-50 theme-secondary-bg p-2 flex flex-col overflow-auto' : ''}>
            {(effectiveViewMode === 'roll' || effectiveViewMode === 'highway') && (
                <div className="flex items-center justify-between px-1 pb-2 gap-2">
                    <span className="text-sm theme-secondary-text shrink-0">
                        {effectiveViewMode === 'highway' ? 'Note Highway' : 'Piano Roll'}
                    </span>
                    {/* While full view is open, the regular mode switcher above is
                        covered by this fixed overlay - duplicate it here so the
                        player isn't stuck needing Escape/Exit just to change view. */}
                    {vizFullView && viewModeSwitcher}
                    <button
                        onClick={() => setVizFullView((cur) => !cur)}
                        className="px-3 py-1 rounded-lg text-sm theme-muted-bg theme-secondary-text hover:opacity-90 shrink-0"
                    >
                        {vizFullView ? '✕ Exit Full View' : '⤢ Full View'}
                    </button>
                </div>
            )}
            {vizFullView && <div className="px-1 pb-2">{transportControls}</div>}
            <div className="px-1">
                {(effectiveViewMode === 'roll' || effectiveViewMode === 'highway') && vizLegend}
                {rollPanel}
                {highwayPanel}
            </div>
        </div>
    );
    const vizPortalContainer = vizFullView ? (typeof document !== 'undefined' ? document.body : null) : vizPortalSlot;

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

                {user && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMyFiles((v) => !v)}
                            className="flex items-center gap-2 px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90"
                        >
                            <FolderOpen size={16} /> My Files{myFiles.length > 0 ? ` (${myFiles.length})` : ''}
                        </button>
                        {showMyFiles && (
                            <div className="absolute left-0 z-20 mt-2 w-72 max-h-80 overflow-y-auto rounded-lg theme-card shadow-xl">
                                {myFiles.length === 0 ? (
                                    <p className="px-4 py-3 text-sm theme-secondary-text">
                                        Files you upload while signed in are saved here automatically.
                                    </p>
                                ) : (
                                    myFiles.map((record) => (
                                        <button
                                            key={record.id}
                                            onClick={() => openSavedFile(record)}
                                            className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm theme-text hover:theme-muted-bg"
                                        >
                                            <span className="truncate">
                                                {record.fileName}
                                                <span className="ml-1 theme-secondary-text">
                                                    ({record.fileKind === 'gp' ? 'Guitar Pro' : 'MIDI'})
                                                </span>
                                            </span>
                                            <Trash2
                                                size={14}
                                                className="shrink-0 theme-secondary-text hover:text-red-400"
                                                onClick={(e) => removeSavedFile(record, e)}
                                            />
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {parsed && (
                    <span className="theme-secondary-text text-sm">
                        {parsed.title} · {fileKind === 'gp' ? 'Guitar Pro' : 'MIDI'} · {trackNotes.length} notes
                    </span>
                )}

                {saveState === 'saving' && <span className="text-xs theme-secondary-text">Saving to your account…</span>}
                {saveState === 'saved' && <span className="text-xs text-green-400">Saved to your account</span>}
                {saveState === 'error' && <span className="text-xs text-red-400">Couldn&apos;t save to your account</span>}
            </div>

            {!user && (
                <p className="text-xs theme-secondary-text mb-4">
                    Sign in to automatically save files you upload here and reopen them on any device.
                </p>
            )}

            {loadError && (
                <p className="mb-4 text-sm text-red-400 bg-red-950/30 border border-red-500/30 rounded-lg px-3 py-2">
                    {loadError}
                </p>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-lg theme-secondary-bg">
                <button
                    onClick={() => setMetronomeOn((v) => !v)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        metronomeOn ? 'bg-red-500 text-white hover:opacity-90' : 'theme-btn hover:opacity-90'
                    }`}
                >
                    {metronomeOn ? '■ Stop Metronome' : '▶ Metronome'}
                </button>
                <label className="flex items-center gap-3 text-sm theme-secondary-text">
                    Tempo: {metronomeBpm} BPM
                    <input
                        type="range"
                        min={40}
                        max={240}
                        step={2}
                        value={metronomeBpm}
                        onChange={(e) => setMetronomeBpm(Number(e.target.value))}
                        className="w-32 sm:w-48"
                    />
                </label>
            </div>

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
                            Transpose:
                            <button
                                onClick={() => setTransposeSemitones((t) => Math.max(-12, t - 1))}
                                disabled={runState === 'running' || runState === 'paused'}
                                className="theme-muted-bg theme-secondary-text px-2 py-1 rounded-lg text-sm disabled:opacity-50"
                            >
                                −
                            </button>
                            <span className="tabular-nums w-12 text-center">
                                {transposeSemitones > 0 ? `+${transposeSemitones}` : transposeSemitones} st
                            </span>
                            <button
                                onClick={() => setTransposeSemitones((t) => Math.min(12, t + 1))}
                                disabled={runState === 'running' || runState === 'paused'}
                                className="theme-muted-bg theme-secondary-text px-2 py-1 rounded-lg text-sm disabled:opacity-50"
                            >
                                +
                            </button>
                        </label>

                        {originalTuningMidi && (
                            <button
                                onClick={() => setShowTuningPanel((v) => !v)}
                                disabled={runState === 'running' || runState === 'paused'}
                                className="px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                            >
                                Tuning{activeTuning ? ' •' : ''}
                            </button>
                        )}

                        <label className="flex items-center gap-2 text-sm theme-secondary-text">
                            Speed: {Math.round(speed * 100)}%
                            <input
                                type="range"
                                min={0.25}
                                max={1.25}
                                step={0.05}
                                value={speed}
                                onChange={(e) => setSpeed(Number(e.target.value))}
                                className="w-28"
                            />
                        </label>

                        <label
                            className="flex items-center gap-2 text-sm theme-secondary-text"
                            title="Pause on each note until you play the correct pitch, no rhythm penalty."
                        >
                            <input
                                type="checkbox"
                                checked={waitMode}
                                onChange={(e) => setWaitMode(e.target.checked)}
                                className="accent-indigo-500"
                            />
                            Wait Mode
                        </label>

                        <label className="flex items-center gap-2 text-sm theme-secondary-text">
                            <input
                                type="checkbox"
                                checked={loopEnabled}
                                onChange={(e) => setLoopEnabled(e.target.checked)}
                                disabled={runState === 'running' || runState === 'paused'}
                                className="accent-indigo-500"
                            />
                            Loop
                        </label>
                        {loopEnabled && (
                            <>
                                <label className="flex items-center gap-1 text-sm theme-secondary-text">
                                    From
                                    <input
                                        type="number"
                                        min={0}
                                        max={Math.floor(parsed.durationMs / 1000)}
                                        step={1}
                                        value={Math.round(loopStartMs / 1000)}
                                        onChange={(e) => setLoopStartMs(Math.max(0, Number(e.target.value)) * 1000)}
                                        disabled={runState === 'running' || runState === 'paused'}
                                        className="theme-muted-bg theme-secondary-text px-2 py-1 rounded-lg text-sm w-16"
                                    />
                                    s
                                </label>
                                <label className="flex items-center gap-1 text-sm theme-secondary-text">
                                    To
                                    <input
                                        type="number"
                                        min={0}
                                        max={Math.floor(parsed.durationMs / 1000)}
                                        step={1}
                                        value={Math.round(loopEndMs / 1000)}
                                        onChange={(e) => setLoopEndMs(Math.max(0, Number(e.target.value)) * 1000)}
                                        disabled={runState === 'running' || runState === 'paused'}
                                        className="theme-muted-bg theme-secondary-text px-2 py-1 rounded-lg text-sm w-16"
                                    />
                                    s
                                </label>
                            </>
                        )}

                    </div>

                    {vizHeader}

                    {parsed.notation && effectiveViewMode === 'notation' && (
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="text-sm theme-secondary-text">Clef:</span>
                            {(['auto', 'treble', 'bass'] as ClefOverride[]).map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setClefOverride(option)}
                                    className={`px-3 py-1 rounded-lg text-sm capitalize ${
                                        clefOverride === option ? 'theme-btn' : 'theme-muted-bg theme-secondary-text'
                                    }`}
                                >
                                    {option === 'auto' ? 'Auto' : option === 'treble' ? 'Treble (G)' : 'Bass (F)'}
                                </button>
                            ))}

                            {fileKind === 'gp' && (
                                <button
                                    onClick={() => setShowTab((cur) => !cur)}
                                    className="px-3 py-1 rounded-lg text-sm theme-muted-bg theme-secondary-text ml-2"
                                >
                                    {showTab ? 'Hide Tab' : 'Show Tab'}
                                </button>
                            )}

                            <span className="text-sm theme-secondary-text ml-2">Note Labels:</span>
                            {(['off', 'names', 'solfege'] as NoteLabelMode[]).map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setNoteLabelMode(option)}
                                    className={`px-3 py-1 rounded-lg text-sm capitalize ${
                                        noteLabelMode === option ? 'theme-btn' : 'theme-muted-bg theme-secondary-text'
                                    }`}
                                >
                                    {option === 'off' ? 'Off' : option === 'names' ? 'Names' : 'Solfège'}
                                </button>
                            ))}
                        </div>
                    )}

                    {showTuningPanel && originalTuningMidi && (() => {
                        const tuningMidi = activeTuning?.notes ?? originalTuningMidi;
                        const instrument = activeTuning?.instrument ?? defaultInstrumentFor(originalTuningMidi.length);
                        const stringNumbers = Array.from({ length: tuningMidi.length }, (_, i) => tuningMidi.length - i);
                        return (
                            <div className="flex flex-wrap items-end gap-4 mb-4 p-3 rounded-lg theme-secondary-bg">
                                <label className="flex items-center gap-2 text-sm theme-secondary-text">
                                    {t.tuningPanel.instrument}
                                    <select
                                        value={instrument}
                                        onChange={(e) => {
                                            const next = e.target.value as Instrument;
                                            setTuningPreset(next, closestStringCount(next, tuningMidi.length));
                                        }}
                                        disabled={runState === 'running' || runState === 'paused'}
                                        className="theme-muted-bg theme-secondary-text px-2 py-1 rounded-lg text-sm"
                                    >
                                        <option value="guitar">{t.tuningPanel.guitar}</option>
                                        <option value="bass">{t.tuningPanel.bass}</option>
                                    </select>
                                </label>

                                <label className="flex items-center gap-2 text-sm theme-secondary-text">
                                    {t.tuningPanel.strings}
                                    <select
                                        value={tuningMidi.length}
                                        onChange={(e) => setTuningPreset(instrument, Number(e.target.value))}
                                        disabled={runState === 'running' || runState === 'paused'}
                                        className="theme-muted-bg theme-secondary-text px-2 py-1 rounded-lg text-sm"
                                    >
                                        {STRING_COUNT_OPTIONS[instrument].map((n) => (
                                            <option key={n} value={n}>
                                                {n}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <div className="flex items-end gap-2">
                                    {stringNumbers.map((stringNum) => {
                                        const pitch = tuningMidi[stringNum - 1];
                                        return (
                                            <label
                                                key={stringNum}
                                                className="flex flex-col items-center gap-1 text-xs theme-secondary-text"
                                            >
                                                {t.tuningPanel.stringNumber(stringNum)}
                                                <div className="flex items-center gap-1">
                                                    <select
                                                        value={pitchClassFromMidi(pitch)}
                                                        onChange={(e) =>
                                                            updateTuningString(
                                                                stringNum,
                                                                midiFromPitchClassAndOctave(Number(e.target.value), Math.floor(pitch / 12) - 1)
                                                            )
                                                        }
                                                        disabled={runState === 'running' || runState === 'paused'}
                                                        className="theme-muted-bg theme-secondary-text px-1 py-1 rounded text-xs"
                                                    >
                                                        {CHROMATIC_NOTES.map((name, pc) => (
                                                            <option key={pc} value={pc}>
                                                                {name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="number"
                                                        value={Math.floor(pitch / 12) - 1}
                                                        onChange={(e) =>
                                                            updateTuningString(
                                                                stringNum,
                                                                midiFromPitchClassAndOctave(pitchClassFromMidi(pitch), Number(e.target.value))
                                                            )
                                                        }
                                                        disabled={runState === 'running' || runState === 'paused'}
                                                        className="theme-muted-bg theme-secondary-text w-12 px-1 py-1 rounded text-xs"
                                                    />
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>

                                {activeTuning && (
                                    <button
                                        onClick={() => setCustomTunings((cur) => ({ ...cur, [selectedTrack]: null }))}
                                        disabled={runState === 'running' || runState === 'paused'}
                                        className="px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                                    >
                                        Reset to file tuning
                                    </button>
                                )}
                            </div>
                        );
                    })()}

                    {parsed.notation && activeTuning && (
                        <p className="text-xs theme-secondary-text mb-3">
                            Custom tuning changes what you play in the Piano Roll, Note Highway, and live grading,
                            but the Staff + Tab view still shows the file&apos;s original tuning.
                        </p>
                    )}

                    {fileKind === 'midi' && parsed.notation && effectiveViewMode === 'notation' && (
                        <p className="text-xs theme-secondary-text mb-3">
                            MIDI files carry no fret/string data, so only a standard notation staff (no tab) is
                            shown — note positions are quantized to a sixteenth-note grid and may not exactly
                            match the original rhythm.
                        </p>
                    )}

                    {transportControls}

                    <div ref={setVizPortalSlot} />
                    {vizPortalContainer && createPortal(vizContent, vizPortalContainer)}

                    {parsed.notation && (
                        <div style={{ display: effectiveViewMode === 'notation' ? undefined : 'none' }}>
                            <ScoreNotation
                                notation={parsed.notation}
                                trackIndex={selectedTrack}
                                getSongMs={getSongMs}
                                running={runState === 'running'}
                                gradedNotes={gradedNotes}
                                transposeSemitones={transposeSemitones}
                                clef={clefOverride}
                                showTab={showTab}
                                noteLabelMode={noteLabelMode}
                                controls={transportControls}
                                loopStartMs={loopEnabled ? loopStartMs : 0}
                                loopEndMs={loopEnabled ? loopEndMs : 0}
                                onLoopRangeSelect={
                                    runState === 'running' || runState === 'paused'
                                        ? undefined
                                        : (startMs, endMs) => {
                                              setLoopStartMs(startMs);
                                              setLoopEndMs(endMs);
                                              setLoopEnabled(true);
                                          }
                                }
                            />
                        </div>
                    )}

                    <div className="mt-4">
                        <PianoKeyboard
                            activeNotes={combinedActiveNotes}
                            onNoteOn={handleKeyboardNoteOn}
                            onNoteOff={handleKeyboardNoteOff}
                            startMidi={Math.max(0, pitchRange.min - 3)}
                            endMidi={Math.min(127, pitchRange.max + 3)}
                        />
                    </div>

                    {midi.permission !== 'granted' && audio.permission !== 'granted' && (
                        <p className="mt-3 text-sm theme-warning-text">
                            Connect a MIDI device or microphone from the panel above for hands-on grading, or use the
                            on-screen keyboard.
                        </p>
                    )}

                    {report && runState === 'finished' && (
                        <div className="mt-6 p-4 rounded-lg theme-secondary-bg">
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <h3 className="theme-text font-semibold">Session Report</h3>
                                <ShareButton
                                    title="Music Theory Cheatsheet"
                                    text={`I just scored ${report.accuracyPct}% accuracy (${report.hit} hit, ${report.wrong} wrong, ${report.missed} missed) on my Play Along session in Music Theory Cheatsheet! 🎸`}
                                    label="Share results"
                                />
                            </div>
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
