import { DIFFICULTY_LEVELS, type EarTrainingDifficulty } from '@/app/utils/earTrainingData';

export type ChordQuality = 'major' | 'minor' | 'diminished';

interface DegreeInfo {
    roman: string;
    semitones: number;
    quality: ChordQuality;
}

// Diatonic triads in a major key, indexed by scale degree (0 = I ... 6 = vii°).
export const MAJOR_KEY_DEGREES: DegreeInfo[] = [
    { roman: 'I', semitones: 0, quality: 'major' },
    { roman: 'ii', semitones: 2, quality: 'minor' },
    { roman: 'iii', semitones: 4, quality: 'minor' },
    { roman: 'IV', semitones: 5, quality: 'major' },
    { roman: 'V', semitones: 7, quality: 'major' },
    { roman: 'vi', semitones: 9, quality: 'minor' },
    { roman: 'vii°', semitones: 11, quality: 'diminished' },
];

export const QUALITY_INTERVALS: Record<ChordQuality, number[]> = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    diminished: [0, 3, 6],
};

export interface ProgressionDef {
    degrees: number[]; // indices into MAJOR_KEY_DEGREES
    difficulty: EarTrainingDifficulty;
}

export const PROGRESSIONS: ProgressionDef[] = [
    { degrees: [0, 3, 4, 0], difficulty: 'easy' }, // I-IV-V-I
    { degrees: [0, 4, 5, 3], difficulty: 'easy' }, // I-V-vi-IV
    { degrees: [0, 5, 3, 4], difficulty: 'easy' }, // I-vi-IV-V
    { degrees: [5, 3, 0, 4], difficulty: 'easy' }, // vi-IV-I-V
    { degrees: [1, 4, 0], difficulty: 'medium' }, // ii-V-I
    { degrees: [0, 1, 3, 4], difficulty: 'medium' }, // I-ii-IV-V
    { degrees: [0, 2, 3, 4], difficulty: 'medium' }, // I-iii-IV-V
    { degrees: [5, 1, 4, 0], difficulty: 'medium' }, // vi-ii-V-I
    { degrees: [0, 6, 5, 4], difficulty: 'hard' }, // I-vii°-vi-V
    { degrees: [0, 5, 1, 4], difficulty: 'hard' }, // I-vi-ii-V
    { degrees: [2, 5, 1, 4, 0], difficulty: 'hard' }, // iii-vi-ii-V-I
    { degrees: [0, 3, 6, 2, 5, 1, 4, 0], difficulty: 'hard' }, // I-IV-vii°-iii-vi-ii-V-I
];

// Cumulative pool for a difficulty: 'medium' includes every 'easy' and 'medium' progression.
export function progressionsForDifficulty(difficulty: EarTrainingDifficulty): ProgressionDef[] {
    const maxLevel = DIFFICULTY_LEVELS.indexOf(difficulty);
    return PROGRESSIONS.filter((p) => DIFFICULTY_LEVELS.indexOf(p.difficulty) <= maxLevel);
}

export function formatProgression(degrees: number[]): string {
    return degrees.map((d) => MAJOR_KEY_DEGREES[d].roman).join(' – ');
}

// rootMidi is the tonic (I) of the key; returns one MIDI-note array per chord.
export function chordsForProgression(degrees: number[], rootMidi: number): number[][] {
    return degrees.map((d) => {
        const degree = MAJOR_KEY_DEGREES[d];
        const chordRoot = rootMidi + degree.semitones;
        return QUALITY_INTERVALS[degree.quality].map((interval) => chordRoot + interval);
    });
}
