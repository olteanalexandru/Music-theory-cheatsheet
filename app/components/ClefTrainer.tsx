'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import NoteStaffPrompt from '@/app/components/NoteStaffPrompt';
import GrandStaffPrompt from '@/app/components/GrandStaffPrompt';
import ClefTrainerStats from '@/app/components/ClefTrainerStats';
import PianoKeyboard from '@/app/components/PianoKeyboard';
import { generateNoteQuestion, type ClefId, type NoteQuestion, type RangePreset } from '@/app/utils/staffLayout';
import { KEY_NAMES } from '@/app/utils/keySignatures';
import {
    loadClefTrainerData,
    noteAccuracy,
    noteStatKey,
    recordNoteAttempt,
    recordSprintResult,
    saveClefTrainerData,
    type ClefMode,
    type ClefTrainerData,
} from '@/app/utils/clefTrainerStore';
import type { SynthController } from '@/app/utils/useSynth';
import type { MidiInputController } from '@/app/utils/useMidiInput';

interface ClefTrainerProps {
    synth: SynthController;
    midi: MidiInputController;
}

type AnswerMode = 'choices' | 'midi';
type AnswerStatus = 'idle' | 'correct' | 'incorrect';
type TrainerMode = 'practice' | 'sprint';

const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const CLEF_MODE_OPTIONS: { value: ClefMode; label: string }[] = [
    { value: 'treble', label: 'Treble' },
    { value: 'bass', label: 'Bass' },
    { value: 'grand', label: 'Grand Staff' },
];

const RANGE_OPTIONS: { value: RangePreset; label: string }[] = [
    { value: 'staff', label: 'Staff Only' },
    { value: 'extended', label: '+ Ledger Lines' },
    { value: 'wide', label: 'Wide Range' },
];

const SPRINT_DURATIONS = [30, 60, 120];
const KEYBOARD_PADDING_SEMITONES = 12;

function shuffle<T>(items: T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

// Grand Staff mode isn't a real ClefId - generateNoteQuestion only knows about
// 'treble'/'bass', so a grand-staff question is built by drawing one of those
// per question and letting GrandStaffPrompt place it on the combined staff.
function drawClefForMode(mode: ClefMode): ClefId {
    if (mode === 'grand') return Math.random() < 0.5 ? 'treble' : 'bass';
    return mode;
}

function buildQuestion(mode: ClefMode, keys: string[], range: RangePreset): NoteQuestion {
    return generateNoteQuestion(drawClefForMode(mode), keys, range);
}

const ClefTrainer: React.FC<ClefTrainerProps> = ({ synth, midi }) => {
    const [data, setData] = useState<ClefTrainerData>(() => loadClefTrainerData());
    const [mode, setMode] = useState<TrainerMode>('practice');
    const [clefMode, setClefMode] = useState<ClefMode>('treble');
    const [range, setRange] = useState<RangePreset>('staff');
    const [selectedKeys, setSelectedKeys] = useState<string[]>(['C']);
    const [answerMode, setAnswerMode] = useState<AnswerMode>('choices');
    const [question, setQuestion] = useState<NoteQuestion | null>(null);
    const [choices, setChoices] = useState<string[]>(NOTE_LETTERS);
    const [status, setStatus] = useState<AnswerStatus>('idle');
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [heldClickNotes, setHeldClickNotes] = useState<Set<number>>(new Set());

    const [sprintDuration, setSprintDuration] = useState(60);
    const [sprintActive, setSprintActive] = useState(false);
    const [sprintRemainingMs, setSprintRemainingMs] = useState(0);
    const [sprintResult, setSprintResult] = useState<{ correct: number; total: number; isNewBest: boolean } | null>(null);

    // Refs mirror the state above so timeouts, intervals and the MIDI note-on
    // subscription can always read the latest value at call time, even though
    // those callbacks were created (and captured a stale closure) on an earlier
    // render - this is what lets a single low-latency MIDI listener stay
    // subscribed across renders instead of resubscribing on every keystroke.
    const questionRef = useRef<NoteQuestion | null>(null);
    const answeredRef = useRef(false);
    const questionStartRef = useRef(0);
    const sprintActiveRef = useRef(false);
    const sprintEndAtRef = useRef(0);
    const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dataRef = useRef(data);
    const scoreRef = useRef(score);
    const settingsRef = useRef({ clefMode, selectedKeys, range });

    useEffect(() => {
        dataRef.current = data;
    }, [data]);
    useEffect(() => {
        scoreRef.current = score;
    }, [score]);
    useEffect(() => {
        settingsRef.current = { clefMode, selectedKeys, range };
    }, [clefMode, selectedKeys, range]);

    const applyNewQuestion = useCallback((q: NoteQuestion) => {
        questionRef.current = q;
        answeredRef.current = false;
        questionStartRef.current = performance.now();
        setQuestion(q);
        setChoices(shuffle(NOTE_LETTERS));
        setStatus('idle');
    }, []);

    const regenerate = useCallback((nextMode: ClefMode, nextKeys: string[], nextRange: RangePreset) => {
        if (advanceTimeoutRef.current) {
            clearTimeout(advanceTimeoutRef.current);
            advanceTimeoutRef.current = null;
        }
        applyNewQuestion(buildQuestion(nextMode, nextKeys, nextRange));
    }, [applyNewQuestion]);

    const advanceQuestion = useCallback(() => {
        const { clefMode: m, selectedKeys: k, range: r } = settingsRef.current;
        applyNewQuestion(buildQuestion(m, k, r));
    }, [applyNewQuestion]);

    // Swaps in the actual randomized first question after mount, once the
    // server-matching deterministic initial render (question === null) has committed.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        applyNewQuestion(buildQuestion(clefMode, selectedKeys, range));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAnswer = useCallback((correct: boolean, elapsedMs: number) => {
        if (answeredRef.current) return;
        const q = questionRef.current;
        if (!q) return;
        answeredRef.current = true;
        setStatus(correct ? 'correct' : 'incorrect');

        const key = noteStatKey(q.clef, q.letter, q.accidental, q.octave);
        setData((current) => {
            const next = recordNoteAttempt(current, key, correct, Math.max(0, elapsedMs));
            saveClefTrainerData(next);
            return next;
        });
        setScore((current) => ({ correct: current.correct + (correct ? 1 : 0), total: current.total + 1 }));

        advanceTimeoutRef.current = setTimeout(advanceQuestion, correct ? 450 : 1100);
    }, [advanceQuestion]);

    const gradeMidiAnswer = useCallback((pitch: number, timestamp: number) => {
        if (answeredRef.current) return;
        const q = questionRef.current;
        if (!q) return;
        handleAnswer(pitch === q.midi, timestamp - questionStartRef.current);
    }, [handleAnswer]);

    // Low-latency note-on subscription (bypasses React state diffing) so a
    // played note is graded the instant it sounds, like a real flashcard drill -
    // safe to leave subscribed across renders since gradeMidiAnswer/handleAnswer
    // only ever read fresh values via refs and functional state updates above.
    useEffect(() => {
        if (answerMode !== 'midi') return;
        return midi.subscribeNoteOn((event) => gradeMidiAnswer(event.pitch, event.timestamp));
    }, [answerMode, midi, gradeMidiAnswer]);

    const handleChoiceClick = useCallback((letter: string) => {
        if (answeredRef.current) return;
        const q = questionRef.current;
        if (!q) return;
        handleAnswer(letter === q.letter, performance.now() - questionStartRef.current);
    }, [handleAnswer]);

    const handleKeyboardNoteOn = (note: number) => {
        setHeldClickNotes((current) => new Set(current).add(note));
        synth.noteOn(note);
        gradeMidiAnswer(note, performance.now());
    };

    const handleKeyboardNoteOff = (note: number) => {
        setHeldClickNotes((current) => {
            const next = new Set(current);
            next.delete(note);
            return next;
        });
        synth.noteOff(note);
    };

    const displayActiveNotes = useMemo(
        () => new Set([...midi.activeNotes, ...heldClickNotes]),
        [midi.activeNotes, heldClickNotes]
    );

    const startSprint = () => {
        if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
        setSprintResult(null);
        setScore({ correct: 0, total: 0 });
        sprintActiveRef.current = true;
        setSprintActive(true);
        sprintEndAtRef.current = Date.now() + sprintDuration * 1000;
        setSprintRemainingMs(sprintDuration * 1000);
        advanceQuestion();
    };

    const finishSprint = () => {
        sprintActiveRef.current = false;
        setSprintActive(false);
        if (advanceTimeoutRef.current) {
            clearTimeout(advanceTimeoutRef.current);
            advanceTimeoutRef.current = null;
        }
        const finalScore = scoreRef.current;
        const { data: nextData, isNewBest } = recordSprintResult(
            dataRef.current,
            settingsRef.current.clefMode,
            sprintDuration,
            finalScore.correct,
            finalScore.total
        );
        saveClefTrainerData(nextData);
        setData(nextData);
        setSprintResult({ correct: finalScore.correct, total: finalScore.total, isNewBest });
    };

    useEffect(() => {
        if (!sprintActive) return;
        const interval = setInterval(() => {
            const remaining = sprintEndAtRef.current - Date.now();
            if (remaining <= 0) {
                setSprintRemainingMs(0);
                finishSprint();
            } else {
                setSprintRemainingMs(remaining);
            }
        }, 200);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sprintActive]);

    const handleSetMode = (next: TrainerMode) => {
        if (sprintActive) return;
        setMode(next);
    };

    const handleSetClefMode = (next: ClefMode) => {
        if (sprintActive) return;
        setClefMode(next);
        regenerate(next, selectedKeys, range);
    };

    const handleSetRange = (next: RangePreset) => {
        if (sprintActive) return;
        setRange(next);
        regenerate(clefMode, selectedKeys, next);
    };

    const handleToggleKey = (key: string) => {
        if (sprintActive) return;
        const isSelected = selectedKeys.includes(key);
        if (isSelected && selectedKeys.length === 1) return;
        const next = isSelected ? selectedKeys.filter((k) => k !== key) : [...selectedKeys, key];
        setSelectedKeys(next);
        regenerate(clefMode, next, range);
    };

    const handleSelectKeyPreset = (keys: string[]) => {
        if (sprintActive) return;
        setSelectedKeys(keys);
        regenerate(clefMode, keys, range);
    };

    const handleResetStats = () => {
        const empty: ClefTrainerData = { notes: {}, bestSprint: {} };
        setData(empty);
        saveClefTrainerData(empty);
    };

    const showFlashcard = mode === 'practice' || sprintActive;
    const keyboardRange = question
        ? { startMidi: question.midi - KEYBOARD_PADDING_SEMITONES, endMidi: question.midi + KEYBOARD_PADDING_SEMITONES }
        : { startMidi: 48, endMidi: 72 };
    const weakNoteCount = Object.values(data.notes).filter((entry) => entry.attempts >= 2 && noteAccuracy(entry) < 0.7).length;

    return (
        <div id="clef-trainer-section" className="theme-card rounded-lg p-4 md:p-6 shadow-lg">
            <h3 className="text-lg md:text-xl font-bold theme-text mb-4">Clef Trainer</h3>

            <div className="flex flex-wrap items-center gap-2 mb-4">
                <button
                    onClick={() => handleSetMode('practice')}
                    disabled={sprintActive}
                    className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${mode === 'practice' ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                >
                    Practice
                </button>
                <button
                    onClick={() => handleSetMode('sprint')}
                    disabled={sprintActive}
                    className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${mode === 'sprint' ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                >
                    Speed Run
                </button>
                {mode === 'practice' && (
                    <span className="theme-secondary-text text-sm ml-auto">
                        Score: {score.correct} / {score.total}
                    </span>
                )}
            </div>

            <ClefTrainerStats data={data} onReset={handleResetStats} />
            {weakNoteCount > 0 && (
                <p className="theme-secondary-text text-xs mb-4 -mt-2">
                    You have {weakNoteCount} note{weakNoteCount === 1 ? '' : 's'} under 70% accuracy - see Note Reading Stats above.
                </p>
            )}

            <div className="mb-6 p-4 rounded-lg theme-secondary-bg space-y-3">
                <div>
                    <p className="theme-secondary-text text-xs font-semibold uppercase tracking-wide mb-1.5">Clef</p>
                    <div className="flex flex-wrap gap-1.5">
                        {CLEF_MODE_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSetClefMode(option.value)}
                                disabled={sprintActive}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 ${clefMode === option.value ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="theme-secondary-text text-xs font-semibold uppercase tracking-wide mb-1.5">Range</p>
                    <div className="flex flex-wrap gap-1.5">
                        {RANGE_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSetRange(option.value)}
                                disabled={sprintActive}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 ${range === option.value ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="theme-secondary-text text-xs font-semibold uppercase tracking-wide">Key Signatures</p>
                        <div className="flex gap-2">
                            <button onClick={() => handleSelectKeyPreset(['C'])} disabled={sprintActive} className="text-xs theme-secondary-text underline disabled:opacity-50">
                                Just C
                            </button>
                            <button onClick={() => handleSelectKeyPreset(KEY_NAMES)} disabled={sprintActive} className="text-xs theme-secondary-text underline disabled:opacity-50">
                                All 12 Keys
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {KEY_NAMES.map((k) => {
                            const isOn = selectedKeys.includes(k);
                            return (
                                <button
                                    key={k}
                                    onClick={() => handleToggleKey(k)}
                                    disabled={sprintActive}
                                    className={`px-2.5 py-1 rounded-md text-xs font-medium disabled:opacity-50 ${isOn ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                                >
                                    {k}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <p className="theme-secondary-text text-xs font-semibold uppercase tracking-wide mb-1.5">Answer With</p>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setAnswerMode('choices')}
                            disabled={sprintActive}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 ${answerMode === 'choices' ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                        >
                            Multiple Choice
                        </button>
                        {midi.permission === 'granted' ? (
                            <button
                                onClick={() => setAnswerMode('midi')}
                                disabled={sprintActive}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 ${answerMode === 'midi' ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                            >
                                Play the Note
                            </button>
                        ) : (
                            <button onClick={midi.connect} className="px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90">
                                {midi.permission === 'pending' ? 'Connecting…' : 'Connect MIDI Keyboard'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {mode === 'sprint' && !sprintActive && !sprintResult && (
                <div className="mb-6 p-4 rounded-lg theme-secondary-bg text-center">
                    <p className="theme-text font-semibold mb-3">Speed Run</p>
                    <div className="flex justify-center gap-2 mb-4">
                        {SPRINT_DURATIONS.map((d) => (
                            <button
                                key={d}
                                onClick={() => setSprintDuration(d)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${sprintDuration === d ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                            >
                                {d}s
                            </button>
                        ))}
                    </div>
                    <button onClick={startSprint} className="px-5 py-2 theme-accent-bg rounded-lg font-semibold hover:opacity-90">
                        Start Speed Run
                    </button>
                </div>
            )}

            {mode === 'sprint' && sprintActive && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg theme-secondary-bg">
                    <span className="theme-text font-semibold">{Math.ceil(sprintRemainingMs / 1000)}s left</span>
                    <span className="theme-secondary-text text-sm">{score.correct} / {score.total} correct</span>
                    <button onClick={finishSprint} className="px-3 py-1 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90">
                        End Early
                    </button>
                </div>
            )}

            {mode === 'sprint' && sprintResult && (
                <div className="mb-6 p-5 rounded-lg theme-secondary-bg text-center">
                    <p className="theme-text text-xl font-bold mb-1">
                        {sprintResult.correct} / {sprintResult.total} correct
                    </p>
                    <p className="theme-secondary-text text-sm mb-3">
                        {sprintResult.total > 0 ? Math.round((sprintResult.correct / sprintResult.total) * 100) : 0}% accuracy in {sprintDuration}s
                    </p>
                    {sprintResult.isNewBest && <p className="text-green-400 font-semibold mb-3">New best!</p>}
                    <div className="flex justify-center gap-2">
                        <button onClick={startSprint} className="px-4 py-2 theme-accent-bg rounded-lg font-semibold hover:opacity-90">
                            Run Again
                        </button>
                        <button onClick={() => setSprintResult(null)} className="px-4 py-2 theme-muted-bg theme-secondary-text rounded-lg hover:opacity-90">
                            Done
                        </button>
                    </div>
                </div>
            )}

            {showFlashcard && question && (
                <>
                    <div className="my-4">
                        {clefMode === 'grand' ? (
                            <GrandStaffPrompt clef={question.clef} step={question.step} ledgerSteps={question.ledgerSteps} />
                        ) : (
                            <NoteStaffPrompt clef={question.clef} step={question.step} ledgerSteps={question.ledgerSteps} />
                        )}
                        <p className="theme-secondary-text text-sm text-center mt-1">
                            Key: {question.keyName} major
                            {clefMode === 'grand' ? ` · ${question.clef === 'treble' ? 'Treble' : 'Bass'} clef` : ''}
                        </p>
                    </div>

                    {answerMode === 'choices' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {choices.map((letter) => {
                                const isCorrectChoice = status !== 'idle' && letter === question.letter;
                                const isOtherChoice = status === 'incorrect' && letter !== question.letter;
                                return (
                                    <button
                                        key={letter}
                                        onClick={() => handleChoiceClick(letter)}
                                        disabled={status !== 'idle'}
                                        className={`px-4 py-3 rounded-lg text-lg font-semibold transition-colors
                                            ${isCorrectChoice
                                                ? 'bg-green-500 text-white'
                                                : isOtherChoice
                                                ? 'theme-muted-bg theme-secondary-text opacity-50'
                                                : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                                    >
                                        {letter}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <PianoKeyboard
                            activeNotes={displayActiveNotes}
                            onNoteOn={handleKeyboardNoteOn}
                            onNoteOff={handleKeyboardNoteOff}
                            startMidi={keyboardRange.startMidi}
                            endMidi={keyboardRange.endMidi}
                        />
                    )}

                    {status !== 'idle' && (
                        <p className={`mt-4 font-semibold ${status === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                            {status === 'correct' ? 'Correct!' : `Not quite — that was ${question.displayName}${question.octave}.`}
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

export default ClefTrainer;
