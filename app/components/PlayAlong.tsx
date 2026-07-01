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
import { listDriveFiles, uploadDriveFile, downloadDriveFile, deleteDriveFile, requestGoogleDriveToken, type DriveFileRecord } from '@/app/utils/googleDriveStore';
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
const PIANO_STRIP_WIDTH = 36;

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
    const [hitWindowMs, setHitWindowMs] = useState(200);
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

    const [myFiles, setMyFiles] = useState<DriveFileRecord[]>([]);
    const [showMyFiles, setShowMyFiles] = useState(false);
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [driveToken, setDriveToken] = useState<string | null>(null);
    const [gisLoaded, setGisLoaded] = useState(false);

    const driveEnabled = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    useEffect(() => {
        if (typeof window === 'undefined' || !driveEnabled) return;
        const existing = document.getElementById('gis-script');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (existing) { setGisLoaded(true); return; }
        const script = document.createElement('script');
        script.id = 'gis-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => setGisLoaded(true);
        document.head.appendChild(script);
    }, [driveEnabled]);

    const refreshMyFiles = useCallback(async () => {
        if (!driveToken) return;
        try {
            setMyFiles(await listDriveFiles(driveToken));
        } catch {
            setDriveToken(null);
        }
    }, [driveToken]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (driveToken) void refreshMyFiles();
    }, [driveToken, refreshMyFiles]);

    const connectGoogleDrive = useCallback(async () => {
        if (!gisLoaded) return;
        try {
            const token = await requestGoogleDriveToken();
            setDriveToken(token);
        } catch { /* user cancelled or error */ }
    }, [gisLoaded]);

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
                throw new Error(t.upload.unsupportedFileType);
            }
            if (result.notes.length === 0) {
                throw new Error(t.upload.noPlayableNotes);
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

            if (!options?.skipSave && driveToken) {
                setSaveState('saving');
                try {
                    await uploadDriveFile(driveToken, file, kind);
                    setSaveState('saved');
                    void refreshMyFiles();
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
                setLoadError(t.upload.couldNotReadGuitarPro(err.message));
            } else {
                setLoadError(err instanceof Error ? err.message : t.upload.failedToLoad);
            }
        } finally {
            setIsLoading(false);
        }
    }, [driveToken, refreshMyFiles, t]);

    const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) void handleFile(file);
        e.target.value = '';
    };

    const openSavedFile = useCallback(
        async (record: DriveFileRecord) => {
            if (!driveToken) return;
            setShowMyFiles(false);
            setIsLoading(true);
            try {
                const file = await downloadDriveFile(driveToken, record);
                await handleFile(file, { skipSave: true });
            } catch {
                setLoadError(t.upload.couldNotLoadSaved);
                setIsLoading(false);
            }
        },
        [driveToken, handleFile, t]
    );

    const removeSavedFile = useCallback(
        async (record: DriveFileRecord, e: React.MouseEvent) => {
            e.stopPropagation();
            if (!driveToken) return;
            await deleteDriveFile(driveToken, record);
            void refreshMyFiles();
        },
        [driveToken, refreshMyFiles]
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
                    {t.transport.start}
                </button>
            )}
            {runState === 'running' && (
                <>
                    <button
                        onClick={pause}
                        className="px-4 py-2 theme-muted-bg theme-secondary-text rounded-lg font-medium hover:opacity-90"
                    >
                        {t.transport.pause}
                    </button>
                    <button
                        onClick={stopEarly}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:opacity-90"
                    >
                        {t.transport.stop}
                    </button>
                </>
            )}
            {runState === 'paused' && (
                <>
                    <button
                        onClick={resume}
                        className="px-4 py-2 theme-btn rounded-lg font-medium hover:opacity-90"
                    >
                        {t.transport.resume}
                    </button>
                    <button
                        onClick={stopEarly}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:opacity-90"
                    >
                        {t.transport.stop}
                    </button>
                </>
            )}

            {(runState === 'running' || runState === 'paused') && (
                <span className="text-sm theme-secondary-text">
                    {t.transport.hit} <span className="text-green-400">{liveCounts.hit}</span> · {t.transport.wrong}{' '}
                    <span className="text-red-400">{liveCounts.wrong}</span> · {t.transport.missed}{' '}
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
                <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: judgementColor('pending') }} /> {t.viz.legendUpcoming}
            </span>
            <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: judgementColor('hit') }} /> {t.viz.legendHit}
            </span>
            <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: judgementColor('wrong') }} /> {t.viz.legendWrong}
            </span>
            <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: judgementColor('missed') }} /> {t.viz.legendMissed}
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
                    className="absolute right-0 border-t border-white/10 pointer-events-none"
                    style={{ top: m.top, left: PIANO_STRIP_WIDTH }}
                />
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
            {/* Vertical piano key strip — overlaid on the left edge, z-20 above the scroll layer */}
            <div
                className="absolute top-0 left-0 overflow-hidden z-20 pointer-events-none rounded-l-lg"
                style={{ width: PIANO_STRIP_WIDTH, height: rollHeight }}
            >
                {Array.from({ length: pitchRange.max - pitchRange.min + 1 }, (_, i) => {
                    const pitch = pitchRange.max - i;
                    const pc = pitch % 12;
                    const isBlack = [1, 3, 6, 8, 10].includes(pc);
                    const isC = pc === 0;
                    return (
                        <div
                            key={pitch}
                            style={{
                                position: 'absolute',
                                top: pitchToTop(pitch),
                                left: 0,
                                right: 0,
                                height: NOTE_ROW_HEIGHT,
                                backgroundColor: isBlack ? '#1a1a2e' : '#2a2a42',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                            }}
                        >
                            {isC && (
                                <span style={{ fontSize: 7, color: '#94a3b8', paddingRight: 2, fontFamily: 'monospace', lineHeight: 1 }}>
                                    {noteNameFromMidi(pitch)}{Math.floor(pitch / 12) - 1}
                                </span>
                            )}
                        </div>
                    );
                })}
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
                {t.viz.pianoRoll}
            </button>
            <button
                onClick={() => selectViewMode('notation')}
                className={`px-3 py-1 rounded-lg text-sm ${
                    effectiveViewMode === 'notation' ? 'theme-btn' : 'theme-muted-bg theme-secondary-text'
                }`}
            >
                {fileKind === 'midi' ? t.viz.staff : t.viz.staffAndTab}
            </button>
            <button
                onClick={() => selectViewMode('highway')}
                className={`px-3 py-1 rounded-lg text-sm ${
                    effectiveViewMode === 'highway' ? 'theme-btn' : 'theme-muted-bg theme-secondary-text'
                }`}
            >
                {t.viz.noteHighway}
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
                        {effectiveViewMode === 'highway' ? t.viz.noteHighway : t.viz.pianoRoll}
                    </span>
                    {/* While full view is open, the regular mode switcher above is
                        covered by this fixed overlay - duplicate it here so the
                        player isn't stuck needing Escape/Exit just to change view. */}
                    {vizFullView && viewModeSwitcher}
                    <button
                        onClick={() => setVizFullView((cur) => !cur)}
                        className="px-3 py-1 rounded-lg text-sm theme-muted-bg theme-secondary-text hover:opacity-90 shrink-0"
                    >
                        {vizFullView ? t.notation.fullViewExit : t.notation.fullViewEnter}
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
            <h2 className="text-2xl font-bold theme-text mb-2">{t.intro.title}</h2>
            <p className="theme-secondary-text text-sm mb-6">
                {t.intro.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-4">
                <label className="px-3 py-1.5 theme-btn rounded-lg text-sm hover:opacity-90 cursor-pointer">
                    {isLoading ? t.upload.loading : t.upload.chooseFile}
                    <input
                        type="file"
                        accept=".gp,.gp3,.gp4,.gp5,.gpx,.mid,.midi"
                        className="hidden"
                        onChange={onFileInputChange}
                        disabled={isLoading}
                    />
                </label>

                {driveEnabled && (
                    <div className="relative">
                        {driveToken ? (
                            <>
                                <button
                                    onClick={() => setShowMyFiles((v) => !v)}
                                    className="flex items-center gap-2 px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90"
                                >
                                    <FolderOpen size={16} /> {t.upload.myFiles}{myFiles.length > 0 ? t.upload.myFilesCount(myFiles.length) : ''}
                                </button>
                                {showMyFiles && (
                                    <div className="absolute left-0 z-20 mt-2 w-72 max-h-80 overflow-y-auto rounded-lg theme-card shadow-xl">
                                        {myFiles.length === 0 ? (
                                            <p className="px-4 py-3 text-sm theme-secondary-text">
                                                {t.upload.noSavedFiles}
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
                                                            ({record.fileKind === 'gp' ? t.upload.guitarPro : t.upload.midi})
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
                            </>
                        ) : (
                            <button
                                onClick={() => void connectGoogleDrive()}
                                disabled={!gisLoaded}
                                className="flex items-center gap-2 px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                            >
                                <FolderOpen size={16} /> {t.upload.myFiles}
                            </button>
                        )}
                    </div>
                )}

                {parsed && (
                    <span className="theme-secondary-text text-sm">
                        {t.upload.fileSummary(parsed.title, fileKind === 'gp' ? t.upload.guitarPro : t.upload.midi, trackNotes.length)}
                    </span>
                )}

                {saveState === 'saving' && <span className="text-xs theme-secondary-text">{t.upload.savingToAccount}</span>}
                {saveState === 'saved' && <span className="text-xs text-green-400">{t.upload.savedToAccount}</span>}
                {saveState === 'error' && <span className="text-xs text-red-400">{t.upload.saveError}</span>}
            </div>

            {!driveToken && driveEnabled && (
                <p className="text-xs theme-secondary-text mb-4">
                    {t.upload.signInHint}
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
                    {metronomeOn ? t.metronome.stop : t.metronome.start}
                </button>
                <label className="flex items-center gap-3 text-sm theme-secondary-text">
                    {t.metronome.tempo(metronomeBpm)}
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
                            {t.controls.track}
                            <select
                                value={selectedTrack}
                                onChange={(e) => setSelectedTrack(Number(e.target.value))}
                                disabled={runState === 'running' || runState === 'paused'}
                                className="theme-muted-bg theme-secondary-text px-2 py-1 rounded-lg text-sm"
                            >
                                {parsed.trackNames.map((name, i) => (
                                    <option key={i} value={i}>
                                        {t.controls.trackOption(name, trackNoteCounts[i] ?? 0)}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex items-center gap-2 text-sm theme-secondary-text">
                            {t.controls.strictness}
                            <select
                                value={hitWindowMs}
                                onChange={(e) => setHitWindowMs(Number(e.target.value))}
                                disabled={runState === 'running' || runState === 'paused'}
                                className="theme-muted-bg theme-secondary-text px-2 py-1 rounded-lg text-sm"
                            >
                                <option value={300}>{t.controls.strictnessRelaxed}</option>
                                <option value={200}>{t.controls.strictnessNormal}</option>
                                <option value={120}>{t.controls.strictnessStrict}</option>
                            </select>
                        </label>

                        <label className="flex items-center gap-2 text-sm theme-secondary-text">
                            {t.controls.transpose}
                            <button
                                onClick={() => setTransposeSemitones((s) => Math.max(-12, s - 1))}
                                disabled={runState === 'running' || runState === 'paused'}
                                className="theme-muted-bg theme-secondary-text px-2 py-1 rounded-lg text-sm disabled:opacity-50"
                            >
                                −
                            </button>
                            <span className="tabular-nums w-12 text-center">
                                {t.controls.semitones(transposeSemitones > 0 ? `+${transposeSemitones}` : String(transposeSemitones))}
                            </span>
                            <button
                                onClick={() => setTransposeSemitones((s) => Math.min(12, s + 1))}
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
                                {t.controls.tuning}{activeTuning ? ' •' : ''}
                            </button>
                        )}

                        <label className="flex items-center gap-2 text-sm theme-secondary-text">
                            {t.controls.speed(Math.round(speed * 100))}
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
                            title={t.controls.waitModeTooltip}
                        >
                            <input
                                type="checkbox"
                                checked={waitMode}
                                onChange={(e) => setWaitMode(e.target.checked)}
                                className="accent-indigo-500"
                            />
                            {t.controls.waitModeLabel}
                        </label>

                        <label className="flex items-center gap-2 text-sm theme-secondary-text">
                            <input
                                type="checkbox"
                                checked={loopEnabled}
                                onChange={(e) => setLoopEnabled(e.target.checked)}
                                disabled={runState === 'running' || runState === 'paused'}
                                className="accent-indigo-500"
                            />
                            {t.controls.loopLabel}
                        </label>
                        {loopEnabled && (
                            <>
                                <label className="flex items-center gap-1 text-sm theme-secondary-text">
                                    {t.controls.loopFrom}
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
                                    {t.controls.seconds}
                                </label>
                                <label className="flex items-center gap-1 text-sm theme-secondary-text">
                                    {t.controls.loopTo}
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
                                    {t.controls.seconds}
                                </label>
                            </>
                        )}

                    </div>

                    {vizHeader}

                    {parsed.notation && effectiveViewMode === 'notation' && (
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="text-sm theme-secondary-text">{t.notation.clef}</span>
                            {(['auto', 'treble', 'bass'] as ClefOverride[]).map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setClefOverride(option)}
                                    className={`px-3 py-1 rounded-lg text-sm capitalize ${
                                        clefOverride === option ? 'theme-btn' : 'theme-muted-bg theme-secondary-text'
                                    }`}
                                >
                                    {option === 'auto' ? t.notation.clefAuto : option === 'treble' ? t.notation.clefTreble : t.notation.clefBass}
                                </button>
                            ))}

                            {fileKind === 'gp' && (
                                <button
                                    onClick={() => setShowTab((cur) => !cur)}
                                    className="px-3 py-1 rounded-lg text-sm theme-muted-bg theme-secondary-text ml-2"
                                >
                                    {showTab ? t.notation.hideTab : t.notation.showTab}
                                </button>
                            )}

                            <span className="text-sm theme-secondary-text ml-2">{t.notation.noteLabels}</span>
                            {(['off', 'names', 'solfege'] as NoteLabelMode[]).map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setNoteLabelMode(option)}
                                    className={`px-3 py-1 rounded-lg text-sm capitalize ${
                                        noteLabelMode === option ? 'theme-btn' : 'theme-muted-bg theme-secondary-text'
                                    }`}
                                >
                                    {option === 'off' ? t.notation.noteLabelsOff : option === 'names' ? t.notation.noteLabelsNames : t.notation.noteLabelsSolfege}
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
                                        {t.tuningPanel.resetToFileTuning}
                                    </button>
                                )}
                            </div>
                        );
                    })()}

                    {parsed.notation && activeTuning && (
                        <p className="text-xs theme-secondary-text mb-3">
                            {t.notation.customTuningNotice}
                        </p>
                    )}

                    {fileKind === 'midi' && parsed.notation && effectiveViewMode === 'notation' && (
                        <p className="text-xs theme-secondary-text mb-3">
                            {t.notation.midiNotationNotice}
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
                            {t.viz.connectDevicePrompt}
                        </p>
                    )}

                    {report && runState === 'finished' && (
                        <div className="mt-6 p-4 rounded-lg theme-secondary-bg">
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <h3 className="theme-text font-semibold">{t.report.title}</h3>
                                <ShareButton
                                    title="Music Theory Cheatsheet"
                                    text={t.report.shareText(report.accuracyPct, report.hit, report.wrong, report.missed)}
                                    label={t.report.shareLabel}
                                />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                <div>
                                    <p className="theme-secondary-text">{t.report.accuracy}</p>
                                    <p className="theme-text text-xl font-bold">{report.accuracyPct}%</p>
                                </div>
                                <div>
                                    <p className="theme-secondary-text">{t.report.hit}</p>
                                    <p className="text-green-400 text-xl font-bold">{report.hit}</p>
                                </div>
                                <div>
                                    <p className="theme-secondary-text">{t.report.wrong}</p>
                                    <p className="text-red-400 text-xl font-bold">{report.wrong}</p>
                                </div>
                                <div>
                                    <p className="theme-secondary-text">{t.report.missed}</p>
                                    <p className="text-slate-400 text-xl font-bold">{report.missed}</p>
                                </div>
                            </div>
                            <p className="theme-secondary-text text-sm mt-3">
                                {t.report.extraNotes(report.extraNotes)}
                                {report.averageTimingErrorMs !== null && (
                                    <>
                                        {' · '}
                                        {Math.abs(report.averageTimingErrorMs) < 15
                                            ? t.report.timingOnTime
                                            : report.averageTimingErrorMs < 0
                                                ? t.report.timingEarly(Math.abs(report.averageTimingErrorMs))
                                                : t.report.timingLate(Math.abs(report.averageTimingErrorMs))}
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
