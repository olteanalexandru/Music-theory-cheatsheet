export type EarTrainingCategory = 'intervals' | 'chords' | 'scales';
export type EarTrainingDifficulty = 'easy' | 'medium' | 'hard';

// Ordered easiest to hardest; a level's pool includes every item at or below it.
export const DIFFICULTY_LEVELS: EarTrainingDifficulty[] = ['easy', 'medium', 'hard'];

export interface EarTrainingItem {
    name: string;
    intervals: number[];
    difficulty: EarTrainingDifficulty;
}

export const EAR_TRAINING_INTERVALS: EarTrainingItem[] = [
    { name: 'Major 2nd', intervals: [0, 2], difficulty: 'easy' },
    { name: 'Major 3rd', intervals: [0, 4], difficulty: 'easy' },
    { name: 'Perfect 4th', intervals: [0, 5], difficulty: 'easy' },
    { name: 'Perfect 5th', intervals: [0, 7], difficulty: 'easy' },
    { name: 'Octave', intervals: [0, 12], difficulty: 'easy' },
    { name: 'Minor 2nd', intervals: [0, 1], difficulty: 'medium' },
    { name: 'Minor 3rd', intervals: [0, 3], difficulty: 'medium' },
    { name: 'Major 6th', intervals: [0, 9], difficulty: 'medium' },
    { name: 'Minor 6th', intervals: [0, 8], difficulty: 'medium' },
    { name: 'Tritone', intervals: [0, 6], difficulty: 'hard' },
    { name: 'Minor 7th', intervals: [0, 10], difficulty: 'hard' },
    { name: 'Major 7th', intervals: [0, 11], difficulty: 'hard' },
];

export const EAR_TRAINING_CHORDS: EarTrainingItem[] = [
    { name: 'Major', intervals: [0, 4, 7], difficulty: 'easy' },
    { name: 'Minor', intervals: [0, 3, 7], difficulty: 'easy' },
    { name: 'Diminished', intervals: [0, 3, 6], difficulty: 'medium' },
    { name: 'Augmented', intervals: [0, 4, 8], difficulty: 'medium' },
    { name: 'Major 7th', intervals: [0, 4, 7, 11], difficulty: 'hard' },
    { name: 'Minor 7th', intervals: [0, 3, 7, 10], difficulty: 'hard' },
    { name: 'Dominant 7th', intervals: [0, 4, 7, 10], difficulty: 'hard' },
    { name: 'Minor 7th ♭5', intervals: [0, 3, 6, 10], difficulty: 'hard' },
];

export const EAR_TRAINING_SCALES: EarTrainingItem[] = [
    { name: 'Ionian (Major)', intervals: [0, 2, 4, 5, 7, 9, 11], difficulty: 'easy' },
    { name: 'Aeolian (Natural Minor)', intervals: [0, 2, 3, 5, 7, 8, 10], difficulty: 'easy' },
    { name: 'Pentatonic Major', intervals: [0, 2, 4, 7, 9], difficulty: 'easy' },
    { name: 'Pentatonic Minor', intervals: [0, 3, 5, 7, 10], difficulty: 'easy' },
    { name: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10], difficulty: 'medium' },
    { name: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10], difficulty: 'medium' },
    { name: 'Phrygian', intervals: [0, 1, 3, 5, 7, 8, 10], difficulty: 'hard' },
    { name: 'Lydian', intervals: [0, 2, 4, 6, 7, 9, 11], difficulty: 'hard' },
    { name: 'Locrian', intervals: [0, 1, 3, 5, 6, 8, 10], difficulty: 'hard' },
];

export const EAR_TRAINING_DATA: Record<EarTrainingCategory, EarTrainingItem[]> = {
    intervals: EAR_TRAINING_INTERVALS,
    chords: EAR_TRAINING_CHORDS,
    scales: EAR_TRAINING_SCALES,
};

// Cumulative pool for a difficulty: e.g. 'medium' includes every 'easy' and 'medium' item.
export function poolForDifficulty(category: EarTrainingCategory, difficulty: EarTrainingDifficulty): EarTrainingItem[] {
    const maxLevel = DIFFICULTY_LEVELS.indexOf(difficulty);
    return EAR_TRAINING_DATA[category].filter((item) => DIFFICULTY_LEVELS.indexOf(item.difficulty) <= maxLevel);
}
