'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { playNotesInSequence, playNotesTogether } from '@/app/utils/audioSynth';
import { EAR_TRAINING_DATA, EarTrainingCategory, EarTrainingItem } from '@/app/utils/earTrainingData';
import { noteNameFromMidi } from '@/app/utils/notes';
import type { MidiInputController } from '@/app/utils/useMidiInput';

interface EarTrainingProps {
    midi: MidiInputController;
}

type AnswerMode = 'choices' | 'midi';
type AnswerStatus = 'idle' | 'correct' | 'incorrect';

interface Question {
    item: EarTrainingItem;
    notes: number[];
    choices: string[];
}

const CATEGORY_LABELS: Record<EarTrainingCategory, string> = {
    intervals: 'Intervals',
    chords: 'Chords',
    scales: 'Scales',
};

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

function buildQuestion(category: EarTrainingCategory): Question {
    const pool = EAR_TRAINING_DATA[category];
    const item = pickRandom(pool);
    const root = 57 + Math.floor(Math.random() * 12); // A3..G#4
    const notes = item.intervals.map((interval) => root + interval);
    const maxChoices = Math.min(6, pool.length);
    const distractors = shuffle(pool.filter((entry) => entry.name !== item.name)).slice(0, maxChoices - 1);
    const choices = shuffle([item.name, ...distractors.map((entry) => entry.name)]);
    return { item, notes, choices };
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
    const [category, setCategory] = useState<EarTrainingCategory>('intervals');
    const [question, setQuestion] = useState<Question>(() => buildQuestion('intervals'));
    const [answerMode, setAnswerMode] = useState<AnswerMode>('choices');
    const [status, setStatus] = useState<AnswerStatus>('idle');
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const attemptNotesRef = useRef<Set<number>>(new Set());

    // Track every note pressed during the current attempt, even after it's
    // released, so a played-and-released chord/scale can still be graded.
    useEffect(() => {
        midi.activeNotes.forEach((note) => attemptNotesRef.current.add(note));
    }, [midi.activeNotes]);

    const newQuestion = useCallback((nextCategory: EarTrainingCategory) => {
        setQuestion(buildQuestion(nextCategory));
        setStatus('idle');
        attemptNotesRef.current = new Set();
    }, []);

    const handleCategoryChange = (nextCategory: EarTrainingCategory) => {
        setCategory(nextCategory);
        newQuestion(nextCategory);
    };

    const handlePlay = () => {
        if (category === 'chords') {
            playNotesTogether(question.notes);
        } else {
            playNotesInSequence(question.notes);
        }
    };

    const handleChoice = (name: string) => {
        if (status !== 'idle') return;
        const correct = name === question.item.name;
        setStatus(correct ? 'correct' : 'incorrect');
        setScore((current) => ({
            correct: current.correct + (correct ? 1 : 0),
            total: current.total + 1,
        }));
    };

    const handleCheckMidiAnswer = () => {
        if (status !== 'idle') return;
        const correct = notesMatchExpected(attemptNotesRef.current, question.item.intervals);
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
                {(Object.keys(EAR_TRAINING_DATA) as EarTrainingCategory[]).map((cat) => (
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
                <button onClick={handlePlay} className="px-4 py-2 theme-btn rounded-lg hover:opacity-90">
                    ▶ Play
                </button>
                <button
                    onClick={() => newQuestion(category)}
                    className="px-4 py-2 theme-muted-bg theme-secondary-text rounded-lg hover:opacity-90"
                >
                    New Question
                </button>
                <span className="theme-secondary-text text-sm ml-auto">
                    Score: {score.correct} / {score.total}
                </span>
            </div>

            {answerMode === 'choices' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {question.choices.map((name) => {
                        const isCorrectChoice = status !== 'idle' && name === question.item.name;
                        const isOtherChoice = status === 'incorrect' && name !== question.item.name;
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
                        <span className="theme-secondary-text text-sm">Answer: {question.item.name}</span>
                    )}
                </div>
            )}

            {status !== 'idle' && (
                <p className={`mt-4 font-semibold ${status === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                    {status === 'correct' ? 'Correct!' : `Not quite — it was ${question.item.name}.`}
                </p>
            )}
        </div>
    );
};

export default EarTraining;
