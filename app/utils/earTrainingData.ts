export type EarTrainingCategory = 'intervals' | 'chords' | 'scales';
export type EarTrainingDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

// Ordered easiest to hardest; a level's pool includes every item at or below it.
export const DIFFICULTY_LEVELS: EarTrainingDifficulty[] = ['easy', 'medium', 'hard', 'expert'];

export interface EarTrainingItem {
    name: string;
    intervals: number[];
    difficulty: EarTrainingDifficulty;
    description: string;
}

export const EAR_TRAINING_INTERVALS: EarTrainingItem[] = [
    { name: 'Major 2nd', intervals: [0, 2], difficulty: 'easy', description: 'Two semitones (a whole step) apart, e.g. C to D.' },
    { name: 'Major 3rd', intervals: [0, 4], difficulty: 'easy', description: 'Four semitones apart; the interval that gives major chords their bright color, e.g. C to E.' },
    { name: 'Perfect 4th', intervals: [0, 5], difficulty: 'easy', description: 'Five semitones apart, e.g. C to F; common at the start of "Here Comes the Bride".' },
    { name: 'Perfect 5th', intervals: [0, 7], difficulty: 'easy', description: 'Seven semitones apart, e.g. C to G; the most stable interval besides the octave, and the basis of power chords.' },
    { name: 'Octave', intervals: [0, 12], difficulty: 'easy', description: 'Twelve semitones apart; the same note name at double (or half) the frequency.' },
    { name: 'Minor 2nd', intervals: [0, 1], difficulty: 'medium', description: 'One semitone apart, e.g. C to D♭; the smallest interval in Western music and the most dissonant.' },
    { name: 'Minor 3rd', intervals: [0, 3], difficulty: 'medium', description: 'Three semitones apart; the interval that gives minor chords their darker color, e.g. C to E♭.' },
    { name: 'Major 6th', intervals: [0, 9], difficulty: 'medium', description: 'Nine semitones apart; the inversion of a minor 3rd.' },
    { name: 'Minor 6th', intervals: [0, 8], difficulty: 'medium', description: 'Eight semitones apart; the inversion of a major 3rd.' },
    { name: 'Tritone', intervals: [0, 6], difficulty: 'hard', description: 'Six semitones apart, exactly half an octave; historically nicknamed "the devil\'s interval" for its tension.' },
    { name: 'Minor 7th', intervals: [0, 10], difficulty: 'hard', description: 'Ten semitones apart; gives dominant 7th chords their bluesy pull toward resolution.' },
    { name: 'Major 7th', intervals: [0, 11], difficulty: 'hard', description: 'Eleven semitones apart, one short of the octave; lush and dreamy rather than tense.' },
    { name: 'Minor 9th', intervals: [0, 13], difficulty: 'hard', description: 'A minor 2nd stretched up an octave (13 semitones).' },
    { name: 'Major 9th', intervals: [0, 14], difficulty: 'hard', description: 'A major 2nd stretched up an octave (14 semitones).' },
    { name: 'Perfect 11th', intervals: [0, 17], difficulty: 'hard', description: 'A perfect 4th stretched up an octave (17 semitones).' },
    { name: 'Perfect 13th', intervals: [0, 21], difficulty: 'hard', description: 'A major 6th stretched up an octave (21 semitones).' },
];

export const EAR_TRAINING_CHORDS: EarTrainingItem[] = [
    { name: 'Major', intervals: [0, 4, 7], difficulty: 'easy', description: 'Root, major 3rd, perfect 5th — bright and stable; the default "happy" chord.' },
    { name: 'Minor', intervals: [0, 3, 7], difficulty: 'easy', description: 'Root, minor 3rd, perfect 5th — darker and sadder than a major chord.' },
    { name: 'Diminished', intervals: [0, 3, 6], difficulty: 'medium', description: 'Root, minor 3rd, tritone — tense and unstable, often used to lead into another chord.' },
    { name: 'Augmented', intervals: [0, 4, 8], difficulty: 'medium', description: 'Root, major 3rd, augmented 5th — symmetrical and dreamlike, with no strong pull anywhere.' },
    { name: 'Suspended 2nd', intervals: [0, 2, 7], difficulty: 'medium', description: 'The 3rd replaced by a major 2nd — open and unresolved, neither major nor minor.' },
    { name: 'Suspended 4th', intervals: [0, 5, 7], difficulty: 'medium', description: 'The 3rd replaced by a perfect 4th — open and unresolved, often used right before resolving to a major chord.' },
    { name: 'Major 7th', intervals: [0, 4, 7, 11], difficulty: 'hard', description: 'A major triad plus a major 7th — lush and jazzy, common in ballads and bossa nova.' },
    { name: 'Minor 7th', intervals: [0, 3, 7, 10], difficulty: 'hard', description: 'A minor triad plus a minor 7th — smooth and mellow, a jazz and soul staple.' },
    { name: 'Dominant 7th', intervals: [0, 4, 7, 10], difficulty: 'hard', description: 'A major triad plus a minor 7th — the classic "V7" chord that wants to resolve to the tonic.' },
    { name: 'Minor 7th ♭5', intervals: [0, 3, 6, 10], difficulty: 'hard', description: 'A diminished triad plus a minor 7th (half-diminished); common as the ii chord in minor keys.' },
    { name: 'Diminished 7th', intervals: [0, 3, 6, 9], difficulty: 'hard', description: 'Stacked minor 3rds all the way around — maximally tense and perfectly symmetrical.' },
    { name: 'Major 6th', intervals: [0, 4, 7, 9], difficulty: 'hard', description: 'A major triad plus a major 6th — sweet, with a vintage jazz/swing flavor.' },
    { name: 'Minor 6th', intervals: [0, 3, 7, 9], difficulty: 'hard', description: 'A minor triad plus a major 6th — bittersweet, used often in film and jazz writing.' },
    { name: 'Dominant 9th', intervals: [0, 4, 7, 10, 14], difficulty: 'expert', description: 'A dominant 7th plus a major 9th — the "9" chord that drives funk and jazz comping.' },
    { name: 'Minor 9th', intervals: [0, 3, 7, 10, 14], difficulty: 'expert', description: 'A minor 7th plus a major 9th — lush and modern, common in neo-soul and jazz.' },
    { name: 'Dominant 11th', intervals: [0, 4, 7, 10, 14, 17], difficulty: 'expert', description: 'A dominant 9th plus a perfect 11th — dense and stacked, blurring into quartal harmony.' },
    { name: 'Dominant 13th', intervals: [0, 4, 7, 10, 14, 17, 21], difficulty: 'expert', description: 'A dominant 11th plus a major 13th — every diatonic extension stacked over the root at once.' },
];

export const EAR_TRAINING_SCALES: EarTrainingItem[] = [
    { name: 'Ionian (Major)', intervals: [0, 2, 4, 5, 7, 9, 11], difficulty: 'easy', description: 'The standard major scale: whole-whole-half-whole-whole-whole-half.' },
    { name: 'Aeolian (Natural Minor)', intervals: [0, 2, 3, 5, 7, 8, 10], difficulty: 'easy', description: 'The standard minor scale; the relative minor of a major scale starting on its 6th degree.' },
    { name: 'Pentatonic Major', intervals: [0, 2, 4, 7, 9], difficulty: 'easy', description: 'A 5-note major-scale subset with no half steps between adjacent notes; common in folk and rock melodies.' },
    { name: 'Pentatonic Minor', intervals: [0, 3, 5, 7, 10], difficulty: 'easy', description: 'A 5-note minor-scale subset; the backbone of blues and rock guitar soloing.' },
    { name: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10], difficulty: 'medium', description: 'A minor scale with a raised 6th degree; common in modal jazz and Celtic/folk music.' },
    { name: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10], difficulty: 'medium', description: 'A major scale with a lowered 7th degree; common over dominant 7th chords and in blues-rock.' },
    { name: 'Harmonic Minor', intervals: [0, 2, 3, 5, 7, 8, 11], difficulty: 'medium', description: 'Natural minor with a raised 7th degree, creating a strong pull to the tonic; common in classical and flamenco music.' },
    { name: 'Melodic Minor', intervals: [0, 2, 3, 5, 7, 9, 11], difficulty: 'medium', description: 'Natural minor with raised 6th and 7th degrees, smoothing out the melodic line into the tonic.' },
    { name: 'Phrygian', intervals: [0, 1, 3, 5, 7, 8, 10], difficulty: 'hard', description: 'A minor scale with a lowered 2nd degree, giving it a Spanish/flamenco flavor.' },
    { name: 'Lydian', intervals: [0, 2, 4, 6, 7, 9, 11], difficulty: 'hard', description: 'A major scale with a raised 4th degree, giving it a dreamy, floating quality.' },
    { name: 'Locrian', intervals: [0, 1, 3, 5, 6, 8, 10], difficulty: 'hard', description: 'A minor scale with lowered 2nd and 5th degrees; the most unstable mode, rarely used as a home key.' },
    { name: 'Blues Scale', intervals: [0, 3, 5, 6, 7, 10], difficulty: 'hard', description: 'The minor pentatonic plus a chromatic ♭5 "blue note" that defines blues phrasing.' },
    { name: 'Whole Tone', intervals: [0, 2, 4, 6, 8, 10], difficulty: 'hard', description: 'Built entirely from whole steps; symmetrical, with no strong tonal center.' },
    { name: 'Bebop Dominant', intervals: [0, 2, 4, 5, 7, 9, 10, 11], difficulty: 'expert', description: 'Mixolydian plus a passing major 7th, keeping eighth-note bebop lines landing on chord tones on the beat.' },
    { name: 'Bebop Major', intervals: [0, 2, 4, 5, 7, 8, 9, 11], difficulty: 'expert', description: 'The major scale plus a passing ♭6, used the same rhythmic-placement way as bebop dominant but over major chords.' },
    { name: 'Altered Scale', intervals: [0, 1, 3, 4, 6, 8, 10], difficulty: 'expert', description: 'The 7th mode of melodic minor; every note is altered (♭9, ♯9, ♭5/♯11, ♭13) against a dominant chord, for maximum tension before resolving.' },
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
