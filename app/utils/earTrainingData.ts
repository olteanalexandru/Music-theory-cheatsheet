export type EarTrainingCategory = 'intervals' | 'chords' | 'scales';

export interface EarTrainingItem {
    name: string;
    intervals: number[];
}

export const EAR_TRAINING_INTERVALS: EarTrainingItem[] = [
    { name: 'Minor 2nd', intervals: [0, 1] },
    { name: 'Major 2nd', intervals: [0, 2] },
    { name: 'Minor 3rd', intervals: [0, 3] },
    { name: 'Major 3rd', intervals: [0, 4] },
    { name: 'Perfect 4th', intervals: [0, 5] },
    { name: 'Tritone', intervals: [0, 6] },
    { name: 'Perfect 5th', intervals: [0, 7] },
    { name: 'Minor 6th', intervals: [0, 8] },
    { name: 'Major 6th', intervals: [0, 9] },
    { name: 'Minor 7th', intervals: [0, 10] },
    { name: 'Major 7th', intervals: [0, 11] },
    { name: 'Octave', intervals: [0, 12] },
];

export const EAR_TRAINING_CHORDS: EarTrainingItem[] = [
    { name: 'Major', intervals: [0, 4, 7] },
    { name: 'Minor', intervals: [0, 3, 7] },
    { name: 'Diminished', intervals: [0, 3, 6] },
    { name: 'Augmented', intervals: [0, 4, 8] },
    { name: 'Major 7th', intervals: [0, 4, 7, 11] },
    { name: 'Minor 7th', intervals: [0, 3, 7, 10] },
    { name: 'Dominant 7th', intervals: [0, 4, 7, 10] },
    { name: 'Minor 7th ♭5', intervals: [0, 3, 6, 10] },
];

export const EAR_TRAINING_SCALES: EarTrainingItem[] = [
    { name: 'Ionian (Major)', intervals: [0, 2, 4, 5, 7, 9, 11] },
    { name: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10] },
    { name: 'Phrygian', intervals: [0, 1, 3, 5, 7, 8, 10] },
    { name: 'Lydian', intervals: [0, 2, 4, 6, 7, 9, 11] },
    { name: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10] },
    { name: 'Aeolian (Natural Minor)', intervals: [0, 2, 3, 5, 7, 8, 10] },
    { name: 'Locrian', intervals: [0, 1, 3, 5, 6, 8, 10] },
    { name: 'Pentatonic Major', intervals: [0, 2, 4, 7, 9] },
    { name: 'Pentatonic Minor', intervals: [0, 3, 5, 7, 10] },
];

export const EAR_TRAINING_DATA: Record<EarTrainingCategory, EarTrainingItem[]> = {
    intervals: EAR_TRAINING_INTERVALS,
    chords: EAR_TRAINING_CHORDS,
    scales: EAR_TRAINING_SCALES,
};
