import { DIFFICULTY_LEVELS, type EarTrainingDifficulty } from '@/app/utils/earTrainingData';

export interface SpelledNote {
    letter: string;
    accidental: string;
}

// Major-key scale spellings, one entry per diatonic degree starting at the tonic.
// Each letter A-G appears exactly once per key, which is what makes it possible to
// look up "how is this staff-line letter spelled in this key" below.
//
// One key per chromatic pitch (12 total, not 17): for each black key we use the
// flat spelling (D♭, E♭, G♭, A♭, B♭) rather than its sharp-side enharmonic
// equivalent, since that's the more common convention and keeps every key's
// accidentals within a single sharp or flat (no double-sharp/double-flat keys
// like D♯ or A♯ major).
export const KEY_SIGNATURES: Record<string, string[]> = {
    'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    'D♭': ['D♭', 'E♭', 'F', 'G♭', 'A♭', 'B♭', 'C'],
    'D': ['D', 'E', 'F♯', 'G', 'A', 'B', 'C♯'],
    'E♭': ['E♭', 'F', 'G', 'A♭', 'B♭', 'C', 'D'],
    'E': ['E', 'F♯', 'G♯', 'A', 'B', 'C♯', 'D♯'],
    'F': ['F', 'G', 'A', 'B♭', 'C', 'D', 'E'],
    'G♭': ['G♭', 'A♭', 'B♭', 'C♭', 'D♭', 'E♭', 'F'],
    'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F♯'],
    'A♭': ['A♭', 'B♭', 'C', 'D♭', 'E♭', 'F', 'G'],
    'A': ['A', 'B', 'C♯', 'D', 'E', 'F♯', 'G♯'],
    'B♭': ['B♭', 'C', 'D', 'E♭', 'F', 'G', 'A'],
    'B': ['B', 'C♯', 'D♯', 'E', 'F♯', 'G♯', 'A♯'],
};

export const KEY_NAMES = Object.keys(KEY_SIGNATURES);

export function parseSpelledNote(spelled: string): SpelledNote {
    return { letter: spelled[0], accidental: spelled.slice(1) };
}

export function accidentalShift(accidental: string): number {
    let shift = 0;
    for (const ch of accidental) {
        if (ch === '♯') shift += 1;
        else if (ch === '♭') shift -= 1;
    }
    return shift;
}

// Look up how a given natural letter (C-B) is spelled within a key, e.g.
// spellLetterInKey('F', 'G') -> { letter: 'F', accidental: '♯' }.
export function spellLetterInKey(letter: string, keyName: string): SpelledNote {
    const scale = KEY_SIGNATURES[keyName] || KEY_SIGNATURES.C;
    const spelled = scale.find((entry) => entry[0] === letter) || letter;
    return parseSpelledNote(spelled);
}

export interface KeySignatureInfo {
    keyName: string;
    type: 'sharp' | 'flat' | 'none';
    count: number;
    accidentals: string[];
}

// How many sharps/flats a key's signature has, e.g. getKeySignatureInfo('D') ->
// { type: 'sharp', count: 2, accidentals: ['F♯', 'C♯'] }.
export function getKeySignatureInfo(keyName: string): KeySignatureInfo {
    const scale = KEY_SIGNATURES[keyName] || KEY_SIGNATURES.C;
    const accidentals = scale.filter((note) => note.length > 1);
    if (accidentals.length === 0) {
        return { keyName, type: 'none', count: 0, accidentals: [] };
    }
    const type = accidentals[0].includes('♯') ? 'sharp' : 'flat';
    return { keyName, type, count: accidentals.length, accidentals };
}

// Difficulty tag per key, ordered by accidental count (the circle of fifths) so the
// Key Signatures drill can start with the simplest keys and work outward.
export const KEY_DIFFICULTY: Record<string, EarTrainingDifficulty> = {
    'C': 'easy',
    'G': 'easy',
    'F': 'easy',
    'D': 'medium',
    'B♭': 'medium',
    'A': 'medium',
    'E♭': 'medium',
    'E': 'hard',
    'A♭': 'hard',
    'B': 'hard',
    'D♭': 'hard',
    'G♭': 'hard',
};

// Cumulative pool of keys for a difficulty: 'medium' includes every 'easy' and 'medium' key.
export function keysForDifficulty(difficulty: EarTrainingDifficulty): string[] {
    const maxLevel = DIFFICULTY_LEVELS.indexOf(difficulty);
    return KEY_NAMES.filter((key) => DIFFICULTY_LEVELS.indexOf(KEY_DIFFICULTY[key]) <= maxLevel);
}
