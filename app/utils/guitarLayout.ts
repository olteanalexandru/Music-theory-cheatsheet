import { noteNameFromMidi } from '@/app/utils/notes';
import type { EarTrainingDifficulty } from '@/app/utils/earTrainingData';

export const STRING_COUNT = 6;

// Standard guitar tuning, low to high: index 0 is the low E (6th) string,
// index 5 is the high E (1st) string. MIDI pitch of each string's open note.
export const STANDARD_TUNING_MIDI = [40, 45, 50, 55, 59, 64];

export const GUITAR_FRET_COUNT = 12;

// Difficulty gates how far up the neck a question can land; the fretboard
// diagram always shows the full 12-fret range so the visual stays consistent.
export const GUITAR_DIFFICULTY_PRESETS: Record<EarTrainingDifficulty, { maxFret: number }> = {
    easy: { maxFret: 4 },
    medium: { maxFret: 8 },
    hard: { maxFret: GUITAR_FRET_COUNT },
};

export interface FretQuestion {
    stringIndex: number;
    fret: number;
    midi: number;
    noteName: string;
}

function pickRandomIndex(count: number): number {
    return Math.floor(Math.random() * count);
}

export function generateFretQuestion(difficulty: EarTrainingDifficulty): FretQuestion {
    const { maxFret } = GUITAR_DIFFICULTY_PRESETS[difficulty];
    const stringIndex = pickRandomIndex(STANDARD_TUNING_MIDI.length);
    const fret = pickRandomIndex(maxFret + 1);
    const midi = STANDARD_TUNING_MIDI[stringIndex] + fret;
    return { stringIndex, fret, midi, noteName: noteNameFromMidi(midi) };
}
