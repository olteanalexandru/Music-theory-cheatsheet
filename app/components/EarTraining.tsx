'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { playNotesInSequence, playNotesTogether } from '@/app/utils/audioSynth';
import {
    DIFFICULTY_LEVELS,
    EAR_TRAINING_DATA,
    EarTrainingCategory,
    EarTrainingDifficulty,
    EarTrainingItem,
    poolForDifficulty,
} from '@/app/utils/earTrainingData';
import { noteNameFromMidi } from '@/app/utils/notes';
import { getKeySignatureInfo, KEY_NAMES, keysForDifficulty, type KeySignatureInfo } from '@/app/utils/keySignatures';
import {
    CLEFS,
    generateNoteQuestion,
    NOTES_DIFFICULTY_PRESETS,
    type ClefId,
    type NoteQuestion,
    type RangePreset,
} from '@/app/utils/staffLayout';
import NoteStaffPrompt from '@/app/components/NoteStaffPrompt';
import type { MidiInputController } from '@/app/utils/useMidiInput';

interface EarTrainingProps {
    midi: MidiInputController;
}

type Category = EarTrainingCategory | 'notes' | 'keysig';
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

type Question = StandardQuestion | StaffNoteQuestion | KeySigQuestion;

const CATEGORY_LABELS: Record<Category, string> = {
    intervals: 'Intervals',
    chords: 'Chords',
    scales: 'Scales',
    notes: 'Notes on Staff',
    keysig: 'Key Signatures',
};

const CATEGORIES: Category[] = [...(Object.keys(EAR_TRAINING_DATA) as EarTrainingCategory[]), 'notes', 'keysig'];

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

const EarTraining: React.FC<EarTrainingProps> = ({ midi }) => {
    const [category, setCategory] = useState<Category>('intervals');
    const [difficulty, setDifficulty] = useState<EarTrainingDifficulty>(DEFAULT_DIFFICULTY);
    const [question, setQuestion] = useState<Question>(() => buildStandardQuestion('intervals', DEFAULT_DIFFICULTY));
    const [answerMode, setAnswerMode] = useState<AnswerMode>('choices');
    const [status, setStatus] = useState<AnswerStatus>('idle');
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [clef, setClef] = useState<ClefId>('treble');
    const [selectedKeys, setSelectedKeys] = useState<string[]>(['C']);
    const [range, setRange] = useState<RangePreset>('staff');
    const attemptNotesRef = useRef<Set<number>>(new Set());

    // Track every note pressed during the current attempt, even after it's
    // released, so a played-and-released chord/scale can still be graded.
    useEffect(() => {
        midi.activeNotes.forEach((note) => attemptNotesRef.current.add(note));
    }, [midi.activeNotes]);

    const resetAnswerState = () => {
        setStatus('idle');
        attemptNotesRef.current = new Set();
    };

    const newStandardQuestion = (nextCategory: EarTrainingCategory, nextDifficulty: EarTrainingDifficulty) => {
        setQuestion(buildStandardQuestion(nextCategory, nextDifficulty));
        resetAnswerState();
    };

    const newNotesQuestion = (nextClef: ClefId, nextKeys: string[], nextRange: RangePreset) => {
        setQuestion(buildNotesQuestion(nextClef, nextKeys, nextRange));
        resetAnswerState();
    };

    const newKeySigQuestion = (nextDifficulty: EarTrainingDifficulty) => {
        setQuestion(buildKeySigQuestion(nextDifficulty));
        resetAnswerState();
    };

    const handleCategoryChange = (nextCategory: Category) => {
        setCategory(nextCategory);
        if (nextCategory === 'keysig' && answerMode === 'midi') {
            setAnswerMode('choices');
        }
        if (nextCategory === 'notes') {
            newNotesQuestion(clef, selectedKeys, range);
        } else if (nextCategory === 'keysig') {
            newKeySigQuestion(difficulty);
        } else {
            newStandardQuestion(nextCategory, difficulty);
        }
    };

    const handleNewQuestion = () => {
        if (category === 'notes') {
            newNotesQuestion(clef, selectedKeys, range);
        } else if (category === 'keysig') {
            newKeySigQuestion(difficulty);
        } else {
            newStandardQuestion(category, difficulty);
        }
    };

    const handleDifficultyChange = (nextDifficulty: EarTrainingDifficulty) => {
        setDifficulty(nextDifficulty);
        if (category === 'notes') {
            const preset = NOTES_DIFFICULTY_PRESETS[nextDifficulty];
            setRange(preset.range);
            setSelectedKeys(preset.keys);
            newNotesQuestion(clef, preset.keys, preset.range);
        } else if (category === 'keysig') {
            newKeySigQuestion(nextDifficulty);
        } else {
            newStandardQuestion(category, nextDifficulty);
        }
    };

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
        const notes = question.kind === 'notes' ? [question.note.midi] : question.notes;
        if (question.kind === 'standard' && category === 'chords') {
            playNotesTogether(notes);
        } else {
            playNotesInSequence(notes);
        }
    };

    const correctAnswerLabel = question.kind === 'standard'
        ? question.item.name
        : question.kind === 'notes'
        ? question.note.letter
        : formatKeySignature(question.info);
    const correctAnswerDisplayName = question.kind === 'standard'
        ? question.item.name
        : question.kind === 'notes'
        ? question.note.displayName
        : formatKeySignature(question.info);

    const handleChoice = (name: string) => {
        if (status !== 'idle') return;
        const correct = name === correctAnswerLabel;
        setStatus(correct ? 'correct' : 'incorrect');
        setScore((current) => ({
            correct: current.correct + (correct ? 1 : 0),
            total: current.total + 1,
        }));
    };

    const handleCheckMidiAnswer = () => {
        if (status !== 'idle') return;
        const correct = question.kind === 'standard'
            ? notesMatchExpected(attemptNotesRef.current, question.item.intervals)
            : question.kind === 'notes'
            ? attemptNotesRef.current.has(question.note.midi)
            : false;
        setStatus(correct ? 'correct' : 'incorrect');
        setScore((current) => ({
            correct: current.correct + (correct ? 1 : 0),
            total: current.total + 1,
        }));
    };

    const heldNoteNames = useMemo(
        () => Array.from(midi.activeNotes).sort((a, b) => a - b).map(noteNameFromMidi),
        [midi.activeNotes]
    );

    return (
        <div className="theme-card rounded-lg p-4 md:p-6 shadow-lg">
            <h3 className="text-lg md:text-xl font-bold theme-text mb-4">Ear Training</h3>

            <div className="flex flex-wrap gap-2 mb-4">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
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
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                            ${difficulty === level ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                    >
                        {DIFFICULTY_LABELS[level]}
                    </button>
                ))}
            </div>

            {category !== 'keysig' && (
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
                                <span className="text-sm text-yellow-400">
                                    Web MIDI isn&apos;t supported in this browser. Try Chrome or Edge.
                                </span>
                            )}
                            {midi.permission === 'denied' && (
                                <span className="text-sm text-yellow-400">
                                    {midi.error || 'MIDI access was denied.'}
                                </span>
                            )}
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
                                    <span className="text-sm text-yellow-400">No MIDI devices detected.</span>
                                )}
                            </div>
                            <p className="theme-secondary-text text-sm">
                                Currently held: {heldNoteNames.length > 0 ? heldNoteNames.join(', ') : '—'}
                            </p>
                        </>
                    )}
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

            {question.kind === 'notes' && (
                <div className="mb-6">
                    <p className="theme-secondary-text text-sm mb-2 text-center">
                        Key: {question.note.keyName} major
                    </p>
                    <NoteStaffPrompt clef={question.note.clef} step={question.note.step} ledgerSteps={question.note.ledgerSteps} />
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

            {answerMode === 'choices' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                                {name}
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleCheckMidiAnswer}
                        disabled={midi.permission !== 'granted' || status !== 'idle'}
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
        </div>
    );
};

export default EarTraining;
