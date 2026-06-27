'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SynthController } from '@/app/utils/useSynth';
import type { MidiInputController } from '@/app/utils/useMidiInput';
import type { AudioInputController } from '@/app/utils/useAudioInput';
import { DIFFICULTY_LEVELS, type EarTrainingDifficulty } from '@/app/utils/earTrainingData';
import {
    RHYTHM_BPM_BY_DIFFICULTY,
    RHYTHM_TIME_SIGNATURES_BY_DIFFICULTY,
    TIME_SIGNATURES,
    generateRhythmPattern,
    type RhythmEvent,
    type TimeSignatureName,
} from '@/app/utils/rhythmData';
import { RhythmFollowEngine, patternToOnsetsMs, type GradedBeat, type RhythmFollowReport } from '@/app/utils/rhythmFollow';
import {
    loadProgress,
    saveProgress,
    nextCategoryStats,
    totalCorrectAnswers,
    bestStreakAcrossCategories,
    bestCategoryAccuracy,
    type ProgressStore,
} from '@/app/utils/progressStore';
import { applyXpAndAchievements, XP_CORRECT_ANSWER } from '@/app/utils/gamificationStore';
import RhythmNotation from '@/app/components/RhythmNotation';

interface RhythmTapAlongProps {
    synth: SynthController;
    midi: MidiInputController;
    audio: AudioInputController;
}

type RunState = 'idle' | 'demo' | 'counting-in' | 'listening' | 'finished';

// Tighter hit windows at higher difficulty, matching the tighter note
// durations and faster tempos generateRhythmPattern already draws from.
const HIT_WINDOW_MS_BY_DIFFICULTY: Record<EarTrainingDifficulty, number> = {
    easy: 220,
    medium: 180,
    hard: 150,
    expert: 120,
};

const PROGRESS_CATEGORY = 'rhythm-tap';
const ACCURACY_PASS_PCT = 80;

function timingLabel(report: RhythmFollowReport): string | null {
    if (report.averageTimingErrorMs === null) return null;
    const abs = Math.abs(report.averageTimingErrorMs);
    if (abs < 30) return 'Right on time!';
    return report.averageTimingErrorMs < 0 ? 'You’re rushing slightly — try to relax into the beat.' : 'You’re dragging slightly — try to anticipate the beat.';
}

const RhythmTapAlong: React.FC<RhythmTapAlongProps> = ({ synth, midi, audio }) => {
    const [difficulty, setDifficulty] = useState<EarTrainingDifficulty>('easy');
    const [timeSig, setTimeSig] = useState<TimeSignatureName>('4/4');
    const [pattern, setPattern] = useState<RhythmEvent[]>(() => generateRhythmPattern('4/4', 'easy'));
    const [runState, setRunState] = useState<RunState>('idle');
    const [countInBeat, setCountInBeat] = useState(0);
    const [gradedBeats, setGradedBeats] = useState<GradedBeat[]>([]);
    const [playheadBeats, setPlayheadBeats] = useState(0);
    const [report, setReport] = useState<RhythmFollowReport | null>(null);
    const [progress, setProgress] = useState<ProgressStore>(() => loadProgress());

    const runStateRef = useRef<RunState>('idle');
    const engineRef = useRef<RhythmFollowEngine | null>(null);
    const phaseStartRef = useRef(0);
    const demoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const countInTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        runStateRef.current = runState;
    }, [runState]);

    useEffect(() => {
        saveProgress(progress);
    }, [progress]);

    const bpm = RHYTHM_BPM_BY_DIFFICULTY[difficulty];
    const msPerBeat = 60000 / bpm;
    const hitWindowMs = HIT_WINDOW_MS_BY_DIFFICULTY[difficulty];
    const beatsPerMeasure = TIME_SIGNATURES[timeSig].beatsPerMeasure;
    const totalBeats = useMemo(() => pattern.reduce((sum, event) => sum + event.beats, 0), [pattern]);

    const clearTimers = useCallback(() => {
        if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
        if (countInTimeoutRef.current) clearTimeout(countInTimeoutRef.current);
        demoTimeoutRef.current = null;
        countInTimeoutRef.current = null;
    }, []);
    useEffect(() => clearTimers, [clearTimers]);

    const stop = useCallback(() => {
        clearTimers();
        engineRef.current = null;
        setRunState('idle');
        setCountInBeat(0);
        setPlayheadBeats(0);
        setGradedBeats([]);
        setReport(null);
    }, [clearTimers]);

    const regenerate = useCallback((nextTimeSig: TimeSignatureName, nextDifficulty: EarTrainingDifficulty) => {
        stop();
        setPattern(generateRhythmPattern(nextTimeSig, nextDifficulty));
    }, [stop]);

    const finish = useCallback(() => {
        const engine = engineRef.current;
        if (!engine) return;
        engine.update(Infinity);
        const rep = engine.getReport();
        setGradedBeats(engine.beats.slice());
        setReport(rep);
        setRunState('finished');

        const correct = rep.total > 0 && rep.accuracyPct >= ACCURACY_PASS_PCT;
        const stats = progress[PROGRESS_CATEGORY] ?? { correct: 0, total: 0, currentStreak: 0, bestStreak: 0, lastPracticed: null };
        const nextProgress: ProgressStore = { ...progress, [PROGRESS_CATEGORY]: nextCategoryStats(stats, correct) };
        setProgress(nextProgress);
        if (correct) {
            applyXpAndAchievements(XP_CORRECT_ANSWER, {
                totalCorrect: totalCorrectAnswers(nextProgress),
                bestStreak: bestStreakAcrossCategories(nextProgress),
                bestCategoryAccuracy: bestCategoryAccuracy(nextProgress),
            });
        }
    }, [progress]);

    // Drives the moving playhead during the demo (listen-only) and listening
    // (graded) phases, and live-grades against the engine while listening.
    // Phase transitions themselves are scheduled by start() via setTimeout,
    // matched to the pattern's musical duration - this loop only animates and,
    // once listening overruns the pattern's length by a hit window, finishes.
    useEffect(() => {
        if (runState !== 'demo' && runState !== 'listening') return;
        let rafId = 0;
        const phaseDurationMs = totalBeats * msPerBeat;

        const tick = () => {
            const nowMs = performance.now() - phaseStartRef.current;
            setPlayheadBeats(Math.min(nowMs / msPerBeat, totalBeats));

            if (runState === 'listening' && engineRef.current) {
                const changed = engineRef.current.update(nowMs);
                if (changed.length > 0) setGradedBeats(engineRef.current.beats.slice());
                if (nowMs > phaseDurationMs + hitWindowMs + 300) {
                    finish();
                    return;
                }
            } else if (runState === 'demo' && nowMs > phaseDurationMs) {
                return;
            }
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [runState, totalBeats, msPerBeat, hitWindowMs, finish]);

    const start = useCallback(() => {
        clearTimers();
        setReport(null);
        setRunState('demo');
        phaseStartRef.current = performance.now();
        synth.playRhythm(pattern, bpm);

        const demoDurationMs = totalBeats * msPerBeat;
        demoTimeoutRef.current = setTimeout(() => {
            setRunState('counting-in');
            setCountInBeat(1);
            const countInPattern: RhythmEvent[] = Array.from({ length: beatsPerMeasure }, () => ({
                type: 'note', duration: 'quarter', beats: 1,
            }));
            synth.playRhythm(countInPattern, bpm);

            let beat = 1;
            const scheduleNextBeat = () => {
                countInTimeoutRef.current = setTimeout(() => {
                    beat += 1;
                    if (beat <= beatsPerMeasure) {
                        setCountInBeat(beat);
                        scheduleNextBeat();
                        return;
                    }
                    const onsetsMs = patternToOnsetsMs(pattern, bpm);
                    engineRef.current = new RhythmFollowEngine(onsetsMs, hitWindowMs);
                    setGradedBeats(engineRef.current.beats.slice());
                    setPlayheadBeats(0);
                    phaseStartRef.current = performance.now();
                    setRunState('listening');
                }, msPerBeat);
            };
            scheduleNextBeat();
        }, demoDurationMs);
    }, [clearTimers, synth, pattern, bpm, totalBeats, msPerBeat, beatsPerMeasure, hitWindowMs]);

    const handleTap = useCallback((nowMsAbsolute: number) => {
        if (runStateRef.current !== 'listening' || !engineRef.current) return;
        engineRef.current.tap(nowMsAbsolute - phaseStartRef.current);
        setGradedBeats(engineRef.current.beats.slice());
    }, []);

    useEffect(() => midi.subscribeNoteOn((event) => handleTap(event.timestamp)), [midi, handleTap]);
    useEffect(() => audio.subscribeOnset((event) => handleTap(event.timestamp)), [audio, handleTap]);

    useEffect(() => {
        if (runState !== 'listening') return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.code !== 'Space' || e.repeat) return;
            e.preventDefault();
            handleTap(performance.now());
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [runState, handleTap]);

    const judgements = useMemo(() => {
        return pattern.reduce<{ beatIdx: number; result: (GradedBeat['judgement'] | undefined)[] }>(
            (acc, event) => {
                if (event.type !== 'note') {
                    acc.result.push(undefined);
                    return acc;
                }
                acc.result.push(gradedBeats[acc.beatIdx]?.judgement);
                acc.beatIdx += 1;
                return acc;
            },
            { beatIdx: 0, result: [] }
        ).result;
    }, [pattern, gradedBeats]);

    const liveCounts = useMemo(() => {
        let hit = 0;
        let missed = 0;
        gradedBeats.forEach((b) => {
            if (b.judgement === 'hit') hit++;
            else if (b.judgement === 'missed') missed++;
        });
        return { hit, missed };
    }, [gradedBeats]);

    const inputHints: string[] = [];
    if (midi.permission === 'granted') inputHints.push('MIDI connected — tap any pad/key');
    if (audio.permission === 'granted') inputHints.push('microphone connected — tap, clap, or play a note near it');
    const midiHint = inputHints.length > 0
        ? `${inputHints.join(', or ')}, or use the button or spacebar below.`
        : 'No MIDI device or microphone connected — use the button or spacebar below, or connect one via Display & Audio Settings above.';

    return (
        <div className="space-y-4">
            <p className="theme-secondary-text text-sm">
                Listen to a one-measure pattern, then tap it back in time — on your MIDI device, the button, or the spacebar.
                Graded on timing only; pitch doesn&apos;t matter.
            </p>

            <div className="flex flex-wrap items-center gap-2">
                <span className="theme-secondary-text text-sm">Difficulty:</span>
                {DIFFICULTY_LEVELS.map((level) => (
                    <button
                        key={level}
                        onClick={() => {
                            setDifficulty(level);
                            const validTimeSig = RHYTHM_TIME_SIGNATURES_BY_DIFFICULTY[level].includes(timeSig) ? timeSig : RHYTHM_TIME_SIGNATURES_BY_DIFFICULTY[level][0];
                            setTimeSig(validTimeSig);
                            regenerate(validTimeSig, level);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors
                            ${difficulty === level ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                    >
                        {level}
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="theme-secondary-text text-sm">Time Signature:</span>
                {RHYTHM_TIME_SIGNATURES_BY_DIFFICULTY[difficulty].map((name) => (
                    <button
                        key={name}
                        onClick={() => { setTimeSig(name); regenerate(name, difficulty); }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                            ${timeSig === name ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                    >
                        {TIME_SIGNATURES[name].label}
                    </button>
                ))}
                <button
                    onClick={() => regenerate(timeSig, difficulty)}
                    disabled={runState !== 'idle' && runState !== 'finished'}
                    className="px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                >
                    New Pattern
                </button>
                <span className="theme-secondary-text text-sm">{bpm} BPM</span>
            </div>

            <div className="p-3 md:p-4 rounded-lg theme-secondary-bg">
                <RhythmNotation
                    events={pattern}
                    judgements={runState === 'listening' || runState === 'finished' ? judgements : undefined}
                    playheadBeats={runState === 'demo' || runState === 'listening' ? playheadBeats : undefined}
                />
            </div>

            <p className="theme-secondary-text text-xs">{midiHint}</p>

            <div className="flex flex-wrap items-center gap-3">
                {(runState === 'idle' || runState === 'finished') && (
                    <button onClick={start} className="px-4 py-2 theme-btn rounded-lg font-medium hover:opacity-90">
                        ▶ {runState === 'finished' ? 'Try Again' : 'Start'}
                    </button>
                )}
                {runState === 'demo' && <p className="theme-secondary-text text-sm font-medium">Listen…</p>}
                {runState === 'counting-in' && (
                    <p className="theme-text text-lg font-bold">{countInBeat} / {beatsPerMeasure}</p>
                )}
                {runState === 'listening' && (
                    <>
                        <button
                            onPointerDown={() => handleTap(performance.now())}
                            className="px-8 py-4 theme-btn rounded-lg font-bold text-lg hover:opacity-90 active:opacity-75 select-none"
                        >
                            TAP
                        </button>
                        <p className="theme-secondary-text text-sm">
                            Hit: {liveCounts.hit} · Missed: {liveCounts.missed} / {gradedBeats.length}
                        </p>
                    </>
                )}
                {(runState === 'demo' || runState === 'counting-in' || runState === 'listening') && (
                    <button onClick={stop} className="px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90">
                        Cancel
                    </button>
                )}
            </div>

            {report && (
                <div className="p-3 md:p-4 rounded-lg theme-secondary-bg space-y-1">
                    <p className="theme-text font-semibold">
                        {report.accuracyPct}% accuracy ({report.hit}/{report.total} hit, {report.missed} missed{report.extraTaps > 0 ? `, ${report.extraTaps} extra taps` : ''})
                    </p>
                    {timingLabel(report) && <p className="theme-secondary-text text-sm">{timingLabel(report)}</p>}
                </div>
            )}
        </div>
    );
};

export default RhythmTapAlong;
