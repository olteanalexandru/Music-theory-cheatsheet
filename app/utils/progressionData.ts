import { DIFFICULTY_LEVELS, type EarTrainingDifficulty } from '@/app/utils/earTrainingData';

export type ChordQuality = 'major' | 'minor' | 'diminished' | 'dominant7';

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

// Chromatic chords outside the diatonic set above, indexed 7+ and reused
// across the 'expert' progressions below: secondary dominants (borrow the V
// of another diatonic chord), modal-interchange chords (borrowed from the
// parallel minor), and a tritone substitution for V7.
export const CHROMATIC_DEGREES: DegreeInfo[] = [
    { roman: 'V7/V', semitones: 2, quality: 'dominant7' },
    { roman: 'V7/vi', semitones: 4, quality: 'dominant7' },
    { roman: 'V7/ii', semitones: 9, quality: 'dominant7' },
    { roman: 'iv', semitones: 5, quality: 'minor' },
    { roman: '♭VI', semitones: 8, quality: 'major' },
    { roman: '♭VII', semitones: 10, quality: 'major' },
    { roman: 'subV7', semitones: 1, quality: 'dominant7' },
];

export const ALL_DEGREES: DegreeInfo[] = [...MAJOR_KEY_DEGREES, ...CHROMATIC_DEGREES];

export const QUALITY_INTERVALS: Record<ChordQuality, number[]> = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    diminished: [0, 3, 6],
    dominant7: [0, 4, 7, 10],
};

export interface ProgressionDef {
    degrees: number[]; // indices into ALL_DEGREES
    difficulty: EarTrainingDifficulty;
    description: string;
}

export const PROGRESSIONS: ProgressionDef[] = [
    { degrees: [0, 3, 4, 0], difficulty: 'easy', description: 'The most fundamental progression in Western music: tonic, subdominant, dominant, tonic.' }, // I-IV-V-I
    { degrees: [0, 4, 5, 3], difficulty: 'easy', description: 'The ubiquitous "four chords" pop progression heard in countless hit songs.' }, // I-V-vi-IV
    { degrees: [0, 5, 3, 4], difficulty: 'easy', description: 'The "50s progression" behind doo-wop and early rock \'n\' roll standards.' }, // I-vi-IV-V
    { degrees: [5, 3, 0, 4], difficulty: 'easy', description: 'A minor-feeling rotation of the I-V-vi-IV progression, starting on the relative minor.' }, // vi-IV-I-V
    { degrees: [1, 4, 0], difficulty: 'medium', description: 'The quintessential jazz cadence: subdominant, dominant, tonic.' }, // ii-V-I
    { degrees: [0, 1, 3, 4], difficulty: 'medium', description: 'Two subdominant-function chords (ii then IV) building toward the dominant.' }, // I-ii-IV-V
    { degrees: [0, 2, 3, 4], difficulty: 'medium', description: 'Uses the mediant (iii) as a gentle stepping stone from tonic to subdominant.' }, // I-iii-IV-V
    { degrees: [5, 1, 4, 0], difficulty: 'medium', description: 'A minor-key-flavored run into a ii-V-I jazz cadence.' }, // vi-ii-V-I
    { degrees: [0, 6, 5, 4], difficulty: 'hard', description: 'The leading-tone diminished chord (vii°) creates tension resolving down through vi to the dominant.' }, // I-vii°-vi-V
    { degrees: [0, 5, 1, 4], difficulty: 'hard', description: 'A longer journey through the relative minor and subdominant before the jazz ii-V cadence.' }, // I-vi-ii-V
    { degrees: [2, 5, 1, 4, 0], difficulty: 'hard', description: 'A descending chain of fifths (iii-vi-ii-V-I) — the "circle progression" in miniature.' }, // iii-vi-ii-V-I
    { degrees: [0, 3, 6, 2, 5, 1, 4, 0], difficulty: 'hard', description: 'The full circle-of-fifths progression, visiting every diatonic chord on its way back to the tonic.' }, // I-IV-vii°-iii-vi-ii-V-I
    { degrees: [0, 7, 4, 0], difficulty: 'expert', description: 'A secondary dominant (V7/V) borrowed from the key of the dominant adds extra pull into V before resolving home.' }, // I-V7/V-V-I
    { degrees: [0, 9, 1, 7, 4, 0], difficulty: 'expert', description: 'A chain of secondary dominants (V7/ii, then V7/V) tonicizes each diatonic chord just before it arrives.' }, // I-V7/ii-ii-V7/V-V-I
    { degrees: [0, 10, 4, 0], difficulty: 'expert', description: 'The borrowed minor iv, lifted from the parallel minor key, replaces the major IV for a bittersweet plagal turn.' }, // I-iv-V-I
    { degrees: [0, 12, 11, 4], difficulty: 'expert', description: 'Borrowed ♭VII and ♭VI chords from the parallel minor descend toward the dominant — a staple of rock and film-score harmony.' }, // I-♭VII-♭VI-V
    { degrees: [1, 13, 0], difficulty: 'expert', description: 'Tritone substitution: subV7 (♭II7) stands in for the dominant, resolving into I by half-step descent instead of by fifth — a classic jazz reharmonization.' }, // ii-subV7-I
];

// Cumulative pool for a difficulty: 'medium' includes every 'easy' and 'medium' progression.
export function progressionsForDifficulty(difficulty: EarTrainingDifficulty): ProgressionDef[] {
    const maxLevel = DIFFICULTY_LEVELS.indexOf(difficulty);
    return PROGRESSIONS.filter((p) => DIFFICULTY_LEVELS.indexOf(p.difficulty) <= maxLevel);
}

export function formatProgression(degrees: number[]): string {
    return degrees.map((d) => ALL_DEGREES[d].roman).join(' – ');
}

// rootMidi is the tonic (I) of the key; returns one MIDI-note array per chord.
export function chordsForProgression(degrees: number[], rootMidi: number): number[][] {
    return degrees.map((d) => {
        const degree = ALL_DEGREES[d];
        const chordRoot = rootMidi + degree.semitones;
        return QUALITY_INTERVALS[degree.quality].map((interval) => chordRoot + interval);
    });
}
