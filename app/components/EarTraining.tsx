'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { SynthController } from '@/app/utils/useSynth';
import {
    DIFFICULTY_LEVELS,
    EAR_TRAINING_DATA,
    EarTrainingCategory,
    EarTrainingDifficulty,
    EarTrainingItem,
    poolForDifficulty,
} from '@/app/utils/earTrainingData';
import { CHROMATIC_NOTES, noteNameFromMidi } from '@/app/utils/notes';
import { getKeySignatureInfo, KEY_NAMES, keysForDifficulty, type KeySignatureInfo } from '@/app/utils/keySignatures';
import {
    CLEFS,
    generateNoteQuestion,
    NOTES_DIFFICULTY_PRESETS,
    type ClefId,
    type NoteQuestion,
    type RangePreset,
} from '@/app/utils/staffLayout';
import { generateFretQuestion, type FretQuestion } from '@/app/utils/guitarLayout';
import {
    RHYTHM_BPM_BY_DIFFICULTY,
    RHYTHM_TIME_SIGNATURES_BY_DIFFICULTY,
    TIME_SIGNATURES,
    buildRhythmChoices,
    describePattern,
    generateRhythmPattern,
    patternKey,
    type RhythmEvent,
    type TimeSignatureName,
} from '@/app/utils/rhythmData';
import {
    chordsForProgression,
    formatProgression,
    progressionsForDifficulty,
    type ProgressionDef,
} from '@/app/utils/progressionData';
import { loadProgress, saveProgress, type ProgressStore } from '@/app/utils/progressStore';
import { subscribeToPracticeFocus } from '@/app/utils/practiceFocusBus';
import NoteStaffPrompt from '@/app/components/NoteStaffPrompt';
import GuitarFretPrompt from '@/app/components/GuitarFretPrompt';
import PianoKeyboard from '@/app/components/PianoKeyboard';
import RhythmNotation from '@/app/components/RhythmNotation';
import ProgressPanel from '@/app/components/ProgressPanel';
import type { MidiInputController } from '@/app/utils/useMidiInput';

interface EarTrainingProps {
    midi: MidiInputController;
    synth: SynthController;
}

export type Category = EarTrainingCategory | 'notes' | 'keysig' | 'guitar' | 'rhythm' | 'progressions';
type AnswerMode = 'choices' | 'midi';
type AnswerStatus = 'idle' | 'correct' | 'incorrect';

interface StandardQuestion {
    kind: 'standard';
    item: EarTrainingItem;
    notes: number[];
    choices: string[];
}

interface StaffNoteQuestion {
    kind: 'notes';
    note: NoteQuestion;
    choices: string[];
}

interface KeySigQuestion {
    kind: 'keysig';
    keyName: string;
    info: KeySignatureInfo;
    choices: string[];
}

interface GuitarQuestion {
    kind: 'guitar';
    fret: FretQuestion;
    choices: string[];
}

interface RhythmQuestion {
    kind: 'rhythm';
    pattern: RhythmEvent[];
    timeSig: TimeSignatureName;
    bpm: number;
    choices: string[];
    patternsByKey: Record<string, RhythmEvent[]>;
}

interface ProgressionQuestion {
    kind: 'progression';
    def: ProgressionDef;
    chords: number[][];
    keyName: string;
    choices: string[];
}

type Question = StandardQuestion | StaffNoteQuestion | KeySigQuestion | GuitarQuestion | RhythmQuestion | ProgressionQuestion;

interface SessionMissedItem {
    category: Category;
    correctAnswer: string;
}

interface PracticeSession {
    length: number;
    mixed: boolean;
    index: number;
    correctCount: number;
    missed: SessionMissedItem[];
    finished: boolean;
}

const SESSION_LENGTHS = [10, 20, 50];

const CATEGORY_LABELS: Record<Category, string> = {
    intervals: 'Intervals',
    chords: 'Chords',
    scales: 'Scales',
    notes: 'Notes on Staff',
    keysig: 'Key Signatures',
    guitar: 'Guitar Fretboard',
    rhythm: 'Rhythm',
    progressions: 'Chord Progressions',
};

const CATEGORIES: Category[] = [...(Object.keys(EAR_TRAINING_DATA) as EarTrainingCategory[]), 'notes', 'keysig', 'guitar', 'rhythm', 'progressions'];

const DIFFICULTY_LABELS: Record<EarTrainingDifficulty, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
};

const DEFAULT_DIFFICULTY: EarTrainingDifficulty = 'easy';

const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const RANGE_OPTIONS: { value: RangePreset; label: string }[] = [
    { value: 'staff', label: 'Staff Only' },
    { value: 'extended', label: '+ Ledger Lines' },
    { value: 'wide', label: 'Wide Range' },
];

function shuffle<T>(items: T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function pickRandom<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

function buildStandardQuestion(category: EarTrainingCategory, difficulty: EarTrainingDifficulty): StandardQuestion {
    const pool = poolForDifficulty(category, difficulty);
    const item = pickRandom(pool);
    const root = 57 + Math.floor(Math.random() * 12); // A3..G#4
    const notes = item.intervals.map((interval) => root + interval);
    const maxChoices = Math.min(6, pool.length);
    const distractors = shuffle(pool.filter((entry) => entry.name !== item.name)).slice(0, maxChoices - 1);
    const choices = shuffle([item.name, ...distractors.map((entry) => entry.name)]);
    return { kind: 'standard', item, notes, choices };
}

function buildNotesQuestion(clef: ClefId, selectedKeys: string[], range: RangePreset): StaffNoteQuestion {
    const note = generateNoteQuestion(clef, selectedKeys, range);
    return { kind: 'notes', note, choices: shuffle(NOTE_LETTERS) };
}

function formatKeySignature(info: KeySignatureInfo): string {
    if (info.count === 0) return 'No sharps or flats';
    const noun = info.type === 'sharp' ? 'sharp' : 'flat';
    return `${info.count} ${noun}${info.count > 1 ? 's' : ''} (${info.accidentals.join(', ')})`;
}

function buildKeySigQuestion(difficulty: EarTrainingDifficulty): KeySigQuestion {
    const pool = keysForDifficulty(difficulty);
    const keyName = pickRandom(pool);
    const info = getKeySignatureInfo(keyName);
    const maxChoices = Math.min(6, pool.length);
    const distractorKeys = shuffle(pool.filter((key) => key !== keyName)).slice(0, maxChoices - 1);
    const choices = shuffle([
        formatKeySignature(info),
        ...distractorKeys.map((key) => formatKeySignature(getKeySignatureInfo(key))),
    ]);
    return { kind: 'keysig', keyName, info, choices };
}

function buildGuitarQuestion(difficulty: EarTrainingDifficulty): GuitarQuestion {
    const fret = generateFretQuestion(difficulty);
    const maxChoices = Math.min(6, CHROMATIC_NOTES.length);
    const distractors = shuffle(CHROMATIC_NOTES.filter((name) => name !== fret.noteName)).slice(0, maxChoices - 1);
    const choices = shuffle([fret.noteName, ...distractors]);
    return { kind: 'guitar', fret, choices };
}

function buildRhythmQuestion(difficulty: EarTrainingDifficulty): RhythmQuestion {
    const timeSig = pickRandom(RHYTHM_TIME_SIGNATURES_BY_DIFFICULTY[difficulty]);
    const bpm = RHYTHM_BPM_BY_DIFFICULTY[difficulty];
    const pattern = generateRhythmPattern(timeSig, difficulty);
    const patternChoices = buildRhythmChoices(pattern, timeSig, difficulty);
    const patternsByKey: Record<string, RhythmEvent[]> = {};
    patternChoices.forEach((choice) => {
        patternsByKey[patternKey(choice)] = choice;
    });
    return {
        kind: 'rhythm',
        pattern,
        timeSig,
        bpm,
        choices: patternChoices.map(patternKey),
        patternsByKey,
    };
}

function buildProgressionQuestion(difficulty: EarTrainingDifficulty): ProgressionQuestion {
    const pool = progressionsForDifficulty(difficulty);
    const def = pickRandom(pool);
    const rootMidi = 57 + Math.floor(Math.random() * 12); // A3..G#4
    const chords = chordsForProgression(def.degrees, rootMidi);
    const keyName = CHROMATIC_NOTES[((rootMidi % 12) + 12) % 12];
    const maxChoices = Math.min(6, pool.length);
    const distractors = shuffle(pool.filter((entry) => entry !== def)).slice(0, maxChoices - 1);
    const choices = shuffle([def, ...distractors].map((entry) => formatProgression(entry.degrees)));
    return { kind: 'progression', def, chords, keyName, choices };
}

function notesMatchExpected(playedMidiNotes: Set<number>, expectedIntervals: number[]): boolean {
    if (playedMidiNotes.size === 0) return false;
    const sorted = Array.from(playedMidiNotes).sort((a, b) => a - b);
    const root = sorted[0];
    const playedIntervals = new Set(sorted.map((note) => note - root));
    const expected = new Set(expectedIntervals);
    if (playedIntervals.size !== expected.size) return false;
    for (const interval of expected) {
        if (!playedIntervals.has(interval)) return false;
    }
    return true;
}

const EarTraining: React.FC<EarTrainingProps> = ({ midi, synth }) => {
    const [category, setCategory] = useState<Category>('intervals');
    const [difficulty, setDifficulty] = useState<EarTrainingDifficulty>(DEFAULT_DIFFICULTY);
    const [question, setQuestion] = useState<Question>(() => buildStandardQuestion('intervals', DEFAULT_DIFFICULTY));
    const [answerMode, setAnswerMode] = useState<AnswerMode>('choices');
    const [status, setStatus] = useState<AnswerStatus>('idle');
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [progress, setProgress] = useState<ProgressStore>(() => loadProgress());
    const [clef, setClef] = useState<ClefId>('treble');
    const [selectedKeys, setSelectedKeys] = useState<string[]>(['C']);
    const [range, setRange] = useState<RangePreset>('staff');
    const [heldClickNotes, setHeldClickNotes] = useState<Set<number>>(new Set());
    const [session, setSession] = useState<PracticeSession | null>(null);
    const [sessionLength, setSessionLength] = useState(SESSION_LENGTHS[0]);
    const [mixedSession, setMixedSession] = useState(false);
    const attemptNotesRef = useRef<Set<number>>(new Set());

    // Track every note pressed during the current attempt, even after it's
    // released, so a played-and-released chord/scale can still be graded.
    useEffect(() => {
        midi.activeNotes.forEach((note) => attemptNotesRef.current.add(note));
    }, [midi.activeNotes]);

    // Persist per-category accuracy across sessions, mirroring page.tsx's
    // localStorage pattern for visibleComponents.
    useEffect(() => {
        saveProgress(progress);
    }, [progress]);

    const resetAnswerState = () => {
        setStatus('idle');
        attemptNotesRef.current = new Set();
        setHeldClickNotes(new Set());
        synth.stopAll();
    };

    // The on-screen keyboard can't write into the MIDI hook's activeNotes (that's
    // only ever mutated by real onmidimessage events), so clicks are tracked here
    // and merged with real MIDI input for both display and answer-checking.
    const handleKeyboardNoteOn = (note: number) => {
        attemptNotesRef.current.add(note);
        setHeldClickNotes((current) => new Set(current).add(note));
        synth.noteOn(note);
    };

    const handleKeyboardNoteOff = (note: number) => {
        setHeldClickNotes((current) => {
            const next = new Set(current);
            next.delete(note);
            return next;
        });
        synth.noteOff(note);
    };

    // Single dispatch point for "build a question for this category" — shared by
    // category/difficulty changes and by Practice Session's mixed-category draws.
    const buildQuestionForCategory = (cat: Category, diff: EarTrainingDifficulty): Question => {
        switch (cat) {
            case 'notes':
                return buildNotesQuestion(clef, selectedKeys, range);
            case 'keysig':
                return buildKeySigQuestion(diff);
            case 'guitar':
                return buildGuitarQuestion(diff);
            case 'rhythm':
                return buildRhythmQuestion(diff);
            case 'progressions':
                return buildProgressionQuestion(diff);
            default:
                return buildStandardQuestion(cat, diff);
        }
    };

    const newNotesQuestion = (nextClef: ClefId, nextKeys: string[], nextRange: RangePreset) => {
        setQuestion(buildNotesQuestion(nextClef, nextKeys, nextRange));
        resetAnswerState();
    };

    const newQuestionForCategory = (cat: Category, diff: EarTrainingDifficulty) => {
        setQuestion(buildQuestionForCategory(cat, diff));
        resetAnswerState();
    };

    // Keeps MIDI answer mode from staying selected when landing on a category
    // that can't be graded that way (no natural single-note answer mapping).
    const applyCategory = (nextCategory: Category) => {
        setCategory(nextCategory);
        if ((nextCategory === 'keysig' || nextCategory === 'rhythm' || nextCategory === 'progressions') && answerMode === 'midi') {
            setAnswerMode('choices');
        }
    };

    const handleCategoryChange = (nextCategory: Category) => {
        applyCategory(nextCategory);
        newQuestionForCategory(nextCategory, difficulty);
    };

    const handleNewQuestion = () => {
        if (session && !session.finished) {
            const nextCategory = session.mixed ? pickRandom(CATEGORIES) : category;
            applyCategory(nextCategory);
            newQuestionForCategory(nextCategory, difficulty);
            return;
        }
        newQuestionForCategory(category, difficulty);
    };

    const handleDifficultyChange = (nextDifficulty: EarTrainingDifficulty) => {
        setDifficulty(nextDifficulty);
        if (category === 'notes') {
            const preset = NOTES_DIFFICULTY_PRESETS[nextDifficulty];
            setRange(preset.range);
            setSelectedKeys(preset.keys);
            newNotesQuestion(clef, preset.keys, preset.range);
        } else {
            newQuestionForCategory(category, nextDifficulty);
        }
    };

    // Lets a Curriculum lesson's "Practice this" button steer this panel to a
    // specific category/difficulty without page.tsx having to prop-drill it.
    useEffect(() => {
        return subscribeToPracticeFocus(({ category: nextCategory, difficulty: nextDifficulty }) => {
            applyCategory(nextCategory);
            setDifficulty(nextDifficulty);
            setSession(null);
            if (nextCategory === 'notes') {
                const preset = NOTES_DIFFICULTY_PRESETS[nextDifficulty];
                setRange(preset.range);
                setSelectedKeys(preset.keys);
                newNotesQuestion(clef, preset.keys, preset.range);
            } else {
                newQuestionForCategory(nextCategory, nextDifficulty);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clef, answerMode]);

    const handleClefChange = (nextClef: ClefId) => {
        setClef(nextClef);
        newNotesQuestion(nextClef, selectedKeys, range);
    };

    const handleRangeChange = (nextRange: RangePreset) => {
        setRange(nextRange);
        newNotesQuestion(clef, selectedKeys, nextRange);
    };

    const handleToggleKey = (key: string) => {
        const isSelected = selectedKeys.includes(key);
        const next = isSelected ? selectedKeys.filter((k) => k !== key) : [...selectedKeys, key];
        const effective = next.length > 0 ? next : selectedKeys; // always keep at least one key selected
        setSelectedKeys(effective);
        newNotesQuestion(clef, effective, range);
    };

    const handlePlay = () => {
        if (question.kind === 'keysig') return;
        if (question.kind === 'rhythm') {
            synth.playRhythm(question.pattern, question.bpm);
            return;
        }
        if (question.kind === 'progression') {
            synth.playProgression(question.chords);
            return;
        }
        const notes = question.kind === 'notes'
            ? [question.note.midi]
            : question.kind === 'guitar'
            ? [question.fret.midi]
            : question.notes;
        if (question.kind === 'standard' && category === 'chords') {
            synth.playChord(notes);
        } else {
            synth.playSequence(notes);
        }
    };

    const correctAnswerLabel = question.kind === 'standard'
        ? question.item.name
        : question.kind === 'notes'
        ? question.note.letter
        : question.kind === 'guitar'
        ? question.fret.noteName
        : question.kind === 'keysig'
        ? formatKeySignature(question.info)
        : question.kind === 'rhythm'
        ? patternKey(question.pattern)
        : formatProgression(question.def.degrees);
    const correctAnswerDisplayName = question.kind === 'standard'
        ? question.item.name
        : question.kind === 'notes'
        ? question.note.displayName
        : question.kind === 'guitar'
        ? question.fret.noteName
        : question.kind === 'keysig'
        ? formatKeySignature(question.info)
        : question.kind === 'rhythm'
        ? describePattern(question.pattern)
        : formatProgression(question.def.degrees);

    const questionDescription = question.kind === 'standard'
        ? question.item.description
        : question.kind === 'progression'
        ? question.def.description
        : null;

    const recordResult = (correct: boolean) => {
        setStatus(correct ? 'correct' : 'incorrect');
        setScore((current) => ({
            correct: current.correct + (correct ? 1 : 0),
            total: current.total + 1,
        }));
        setProgress((current) => {
            const stats = current[category] ?? { correct: 0, total: 0, currentStreak: 0, bestStreak: 0, lastPracticed: null };
            const nextStreak = correct ? stats.currentStreak + 1 : 0;
            return {
                ...current,
                [category]: {
                    correct: stats.correct + (correct ? 1 : 0),
                    total: stats.total + 1,
                    currentStreak: nextStreak,
                    bestStreak: Math.max(stats.bestStreak, nextStreak),
                    lastPracticed: Date.now(),
                },
            };
        });
        setSession((current) => {
            if (!current || current.finished) return current;
            const missed = correct ? current.missed : [...current.missed, { category, correctAnswer: correctAnswerDisplayName }];
            const nextIndex = current.index + 1;
            return {
                ...current,
                index: nextIndex,
                correctCount: current.correctCount + (correct ? 1 : 0),
                missed,
                finished: nextIndex >= current.length,
            };
        });
    };

    const resetProgress = () => {
        setProgress({});
        setScore({ correct: 0, total: 0 });
    };

    const startSession = () => {
        setAnswerMode('choices');
        const firstCategory = mixedSession ? pickRandom(CATEGORIES) : category;
        applyCategory(firstCategory);
        setQuestion(buildQuestionForCategory(firstCategory, difficulty));
        resetAnswerState();
        setSession({ length: sessionLength, mixed: mixedSession, index: 0, correctCount: 0, missed: [], finished: false });
    };

    const endSession = () => {
        setSession(null);
    };

    const handleChoice = (name: string) => {
        if (status !== 'idle') return;
        recordResult(name === correctAnswerLabel);
    };

    const handleCheckMidiAnswer = () => {
        if (status !== 'idle') return;
        const correct = question.kind === 'standard'
            ? notesMatchExpected(attemptNotesRef.current, question.item.intervals)
            : question.kind === 'notes'
            ? attemptNotesRef.current.has(question.note.midi)
            : question.kind === 'guitar'
            ? attemptNotesRef.current.has(question.fret.midi)
            : false;
        recordResult(correct);
    };

    const displayActiveNotes = useMemo(
        () => new Set<number>([...midi.activeNotes, ...heldClickNotes]),
        [midi.activeNotes, heldClickNotes]
    );

    const heldNoteNames = useMemo(
        () => Array.from(displayActiveNotes).sort((a, b) => a - b).map(noteNameFromMidi),
        [displayActiveNotes]
    );

    // Category/difficulty are locked while a fixed-length session is running so
    // its category pool and level stay consistent question-to-question.
    const sessionActive = session !== null && !session.finished;

    return (
        <div id="ear-training-section" className="theme-card rounded-lg p-4 md:p-6 shadow-lg">
            <h3 className="text-lg md:text-xl font-bold theme-text mb-4">Ear Training</h3>

            <div className="flex flex-wrap gap-2 mb-4">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        disabled={sessionActive}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                            ${category === cat
                                ? 'theme-accent-bg'
                                : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                    >
                        {CATEGORY_LABELS[cat]}
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="theme-secondary-text text-sm">Difficulty:</span>
                {DIFFICULTY_LEVELS.map((level) => (
                    <button
                        key={level}
                        onClick={() => handleDifficultyChange(level)}
                        disabled={sessionActive}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                            ${difficulty === level ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                    >
                        {DIFFICULTY_LABELS[level]}
                    </button>
                ))}
            </div>

            <div className="mb-6 p-4 rounded-lg theme-secondary-bg">
                <p className="theme-text font-semibold mb-3">Practice Session</p>
                {!session ? (
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="theme-secondary-text text-sm">Length:</span>
                            {SESSION_LENGTHS.map((len) => (
                                <button
                                    key={len}
                                    onClick={() => setSessionLength(len)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                                        ${sessionLength === len ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                                >
                                    {len}
                                </button>
                            ))}
                        </div>
                        <label className="flex items-center gap-2 text-sm theme-secondary-text">
                            <input
                                type="checkbox"
                                checked={mixedSession}
                                onChange={(e) => setMixedSession(e.target.checked)}
                            />
                            Mix all categories
                        </label>
                        <button onClick={startSession} className="px-4 py-2 theme-btn rounded-lg hover:opacity-90">
                            Start Session
                        </button>
                    </div>
                ) : session.finished ? (
                    <div className="space-y-3">
                        <p className="theme-text">
                            Session complete: {session.correctCount} / {session.length} correct (
                            {Math.round((session.correctCount / session.length) * 100)}%)
                        </p>
                        {session.missed.length > 0 ? (
                            <div>
                                <p className="theme-secondary-text text-sm mb-1">Missed:</p>
                                <ul className="text-sm theme-secondary-text list-disc list-inside space-y-0.5">
                                    {session.missed.map((m, i) => (
                                        <li key={i}>
                                            {CATEGORY_LABELS[m.category]}: {m.correctAnswer}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p className="text-sm text-green-400">Perfect score — no missed questions!</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                            <button onClick={startSession} className="px-4 py-2 theme-btn rounded-lg hover:opacity-90">
                                Start New Session
                            </button>
                            <button
                                onClick={endSession}
                                className="px-4 py-2 theme-muted-bg theme-secondary-text rounded-lg hover:opacity-90"
                            >
                                Back to Free Practice
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="theme-secondary-text text-sm">
                            Question {session.index + 1} / {session.length} · {session.correctCount} correct
                        </span>
                        <button
                            onClick={endSession}
                            className="px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90"
                        >
                            End Session
                        </button>
                    </div>
                )}
            </div>

            {category !== 'keysig' && category !== 'rhythm' && category !== 'progressions' && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span className="theme-secondary-text text-sm">Answer with:</span>
                    <button
                        onClick={() => setAnswerMode('choices')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                            ${answerMode === 'choices' ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                    >
                        Multiple Choice
                    </button>
                    <button
                        onClick={() => setAnswerMode('midi')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                            ${answerMode === 'midi' ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                    >
                        MIDI Keyboard
                    </button>
                </div>
            )}

            {category === 'notes' && (
                <div className="mb-6 p-4 rounded-lg theme-secondary-bg space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="theme-secondary-text text-sm">Clef:</span>
                        {(Object.keys(CLEFS) as ClefId[]).map((clefId) => (
                            <button
                                key={clefId}
                                onClick={() => handleClefChange(clefId)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                                    ${clef === clefId ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                            >
                                {CLEFS[clefId].label}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="theme-secondary-text text-sm">Range:</span>
                        {RANGE_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleRangeChange(option.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                                    ${range === option.value ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <div>
                        <span className="theme-secondary-text text-sm block mb-2">Key signatures (select one or more):</span>
                        <div className="flex flex-wrap gap-2">
                            {KEY_NAMES.map((key) => (
                                <button
                                    key={key}
                                    onClick={() => handleToggleKey(key)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors
                                        ${selectedKeys.includes(key) ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {answerMode === 'midi' && (
                <div className="mb-6 p-4 rounded-lg theme-secondary-bg space-y-3">
                    {midi.permission !== 'granted' ? (
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={midi.connect}
                                className="px-4 py-2 theme-btn rounded-lg hover:opacity-90"
                            >
                                Connect MIDI Device
                            </button>
                            {midi.permission === 'pending' && (
                                <span className="theme-secondary-text text-sm">Requesting access…</span>
                            )}
                            {midi.permission === 'unsupported' && (
                                <span className="text-sm theme-warning-text">
                                    Web MIDI isn&apos;t supported in this browser. Try Chrome or Edge.
                                </span>
                            )}
                            {midi.permission === 'denied' && (
                                <span className="text-sm theme-warning-text">
                                    {midi.error || 'MIDI access was denied.'}
                                </span>
                            )}
                            <span className="theme-secondary-text text-sm">Or just click the keys below.</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center gap-3">
                                <label className="theme-secondary-text text-sm">Device:</label>
                                <select
                                    value={midi.selectedDeviceId ?? ''}
                                    onChange={(e) => midi.selectDevice(e.target.value || null)}
                                    className="theme-muted-bg theme-secondary-text px-3 py-1.5 rounded-lg text-sm"
                                >
                                    <option value="">All devices</option>
                                    {midi.devices.map((device) => (
                                        <option key={device.id} value={device.id}>
                                            {device.name}
                                        </option>
                                    ))}
                                </select>
                                {midi.devices.length === 0 && (
                                    <span className="text-sm theme-warning-text">No MIDI devices detected.</span>
                                )}
                            </div>
                            <p className="theme-secondary-text text-sm">
                                Currently held: {heldNoteNames.length > 0 ? heldNoteNames.join(', ') : '—'}
                            </p>
                        </>
                    )}
                    <PianoKeyboard
                        activeNotes={displayActiveNotes}
                        onNoteOn={handleKeyboardNoteOn}
                        onNoteOff={handleKeyboardNoteOff}
                    />
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-6">
                {category !== 'keysig' && (
                    <button onClick={handlePlay} className="px-4 py-2 theme-btn rounded-lg hover:opacity-90">
                        ▶ Play
                    </button>
                )}
                <button
                    onClick={handleNewQuestion}
                    className="px-4 py-2 theme-muted-bg theme-secondary-text rounded-lg hover:opacity-90"
                >
                    New Question
                </button>
                <span className="theme-secondary-text text-sm ml-auto">
                    Score: {score.correct} / {score.total}
                </span>
            </div>

            <ProgressPanel progress={progress} categories={CATEGORIES} labels={CATEGORY_LABELS} onReset={resetProgress} />

            {question.kind === 'notes' && (
                <div className="mb-6">
                    <p className="theme-secondary-text text-sm mb-2 text-center">
                        Key: {question.note.keyName} major
                    </p>
                    <NoteStaffPrompt clef={question.note.clef} step={question.note.step} ledgerSteps={question.note.ledgerSteps} />
                </div>
            )}

            {question.kind === 'guitar' && (
                <div className="mb-6">
                    <p className="theme-secondary-text text-sm mb-2 text-center">Standard tuning</p>
                    <GuitarFretPrompt stringIndex={question.fret.stringIndex} fret={question.fret.fret} />
                </div>
            )}

            {question.kind === 'keysig' && (
                <div className="mb-6 text-center">
                    <p className="theme-text text-2xl font-bold">{question.keyName} major</p>
                    <p className="theme-secondary-text text-sm mt-2">
                        How many sharps or flats does this key signature have?
                    </p>
                </div>
            )}

            {question.kind === 'rhythm' && (
                <div className="mb-6 text-center">
                    <p className="theme-text text-xl font-bold">{TIME_SIGNATURES[question.timeSig].label} time</p>
                    <p className="theme-secondary-text text-sm mt-2">
                        Listen and pick the rhythm pattern you heard.
                    </p>
                </div>
            )}

            {question.kind === 'progression' && (
                <div className="mb-6 text-center">
                    <p className="theme-secondary-text text-sm mb-2">Key: {question.keyName} major</p>
                    <p className="theme-secondary-text text-sm">
                        Listen and identify the chord progression (Roman numeral analysis).
                    </p>
                </div>
            )}

            {answerMode === 'choices' ? (
                <div className={question.kind === 'rhythm' || question.kind === 'progression' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' : 'grid grid-cols-2 sm:grid-cols-3 gap-2'}>
                    {question.choices.map((name) => {
                        const isCorrectChoice = status !== 'idle' && name === correctAnswerLabel;
                        const isOtherChoice = status === 'incorrect' && name !== correctAnswerLabel;
                        return (
                            <button
                                key={name}
                                onClick={() => handleChoice(name)}
                                disabled={status !== 'idle'}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                    ${isCorrectChoice
                                        ? 'bg-green-500 text-white'
                                        : isOtherChoice
                                        ? 'theme-muted-bg theme-secondary-text opacity-50'
                                        : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                            >
                                {question.kind === 'rhythm' ? (
                                    <RhythmNotation events={question.patternsByKey[name]} compact />
                                ) : (
                                    name
                                )}
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleCheckMidiAnswer}
                        disabled={status !== 'idle'}
                        className="px-4 py-2 theme-accent-bg rounded-lg hover:opacity-90 disabled:opacity-50"
                    >
                        Check My Answer
                    </button>
                    {status !== 'idle' && (
                        <span className="theme-secondary-text text-sm">Answer: {correctAnswerDisplayName}</span>
                    )}
                </div>
            )}

            {status !== 'idle' && (
                <p className={`mt-4 font-semibold ${status === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                    {status === 'correct' ? 'Correct!' : `Not quite — it was ${correctAnswerDisplayName}.`}
                </p>
            )}

            {status !== 'idle' && questionDescription && (
                <div className="mt-3 p-3 rounded-lg theme-secondary-bg">
                    <p className="theme-secondary-text text-xs font-semibold uppercase tracking-wide mb-1">Learn</p>
                    <p className="theme-text text-sm">{questionDescription}</p>
                </div>
            )}
        </div>
    );
};

export default EarTraining;
