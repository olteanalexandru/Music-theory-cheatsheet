import type { EarTrainingDifficulty } from '@/app/utils/earTrainingData';

export type DurationName =
    | 'whole'
    | 'dotted-half'
    | 'half'
    | 'dotted-quarter'
    | 'quarter'
    | 'dotted-eighth'
    | 'eighth'
    | 'triplet-eighth'
    | 'sixteenth';

// Ticks per quarter note. 12 (rather than the old 4) is the lowest resolution where
// both a sixteenth note (1/4 of a quarter) and an eighth-note triplet (1/3 of a
// quarter) land on an exact integer tick count, so measures can still be filled
// with integer arithmetic instead of floating-point beat math.
export const TICKS_PER_QUARTER = 12;

export const DURATION_TICKS: Record<DurationName, number> = {
    whole: 48,
    'dotted-half': 36,
    half: 24,
    'dotted-quarter': 18,
    quarter: 12,
    'dotted-eighth': 9,
    eighth: 6,
    'triplet-eighth': 4,
    sixteenth: 3,
};

export const DURATION_LABELS: Record<DurationName, string> = {
    whole: 'Whole note',
    'dotted-half': 'Dotted half note',
    half: 'Half note',
    'dotted-quarter': 'Dotted quarter note',
    quarter: 'Quarter note',
    'dotted-eighth': 'Dotted eighth note',
    eighth: 'Eighth note',
    'triplet-eighth': 'Eighth note triplet',
    sixteenth: 'Sixteenth note',
};

export const DURATION_NAMES: DurationName[] = [
    'whole', 'dotted-half', 'half', 'dotted-quarter', 'quarter', 'dotted-eighth', 'eighth', 'triplet-eighth', 'sixteenth',
];

export const TIME_SIGNATURES = {
    '4/4': { label: '4/4', beatsPerMeasure: 4 },
    '3/4': { label: '3/4', beatsPerMeasure: 3 },
    '2/4': { label: '2/4', beatsPerMeasure: 2 },
    '6/8': { label: '6/8', beatsPerMeasure: 3 },
} as const;

export type TimeSignatureName = keyof typeof TIME_SIGNATURES;
export const TIME_SIGNATURE_NAMES = Object.keys(TIME_SIGNATURES) as TimeSignatureName[];

export interface RhythmEvent {
    type: 'note' | 'rest';
    duration: DurationName;
    beats: number; // quarter-note units, i.e. DURATION_TICKS[duration] / 4
}

// Durations a difficulty level is allowed to draw from, and how often a beat
// becomes a rest instead of a note.
const DIFFICULTY_DURATIONS: Record<EarTrainingDifficulty, DurationName[]> = {
    easy: ['whole', 'half', 'quarter'],
    medium: ['half', 'dotted-quarter', 'quarter', 'eighth'],
    hard: ['dotted-half', 'quarter', 'dotted-quarter', 'eighth', 'dotted-eighth', 'sixteenth'],
    expert: ['dotted-half', 'quarter', 'dotted-quarter', 'eighth', 'dotted-eighth', 'sixteenth', 'triplet-eighth'],
};

const DIFFICULTY_REST_CHANCE: Record<EarTrainingDifficulty, number> = {
    easy: 0,
    medium: 0.25,
    hard: 0.35,
    expert: 0.4,
};

// Chance that a beat becomes a full eighth-note-triplet group (3 triplet-eighths
// filling one quarter note) instead of a single duration from the palette above.
const DIFFICULTY_TRIPLET_CHANCE: Record<EarTrainingDifficulty, number> = {
    easy: 0,
    medium: 0,
    hard: 0,
    expert: 0.4,
};

export const RHYTHM_TIME_SIGNATURES_BY_DIFFICULTY: Record<EarTrainingDifficulty, TimeSignatureName[]> = {
    easy: ['4/4'],
    medium: ['4/4', '3/4'],
    hard: ['4/4', '3/4', '2/4', '6/8'],
    expert: ['4/4', '3/4', '2/4', '6/8'],
};

export const RHYTHM_BPM_BY_DIFFICULTY: Record<EarTrainingDifficulty, number> = {
    easy: 80,
    medium: 96,
    hard: 112,
    expert: 120,
};

function pickRandom<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

// Greedily fills exactly one measure: at every step the remaining ticks only ever
// shrink by a duration that fits, and the smallest available duration is always 1
// tick, so this is guaranteed to terminate with the ticks summing to the total.
export function generateRhythmPattern(timeSig: TimeSignatureName, difficulty: EarTrainingDifficulty): RhythmEvent[] {
    const totalTicks = TIME_SIGNATURES[timeSig].beatsPerMeasure * TICKS_PER_QUARTER;
    const palette = DIFFICULTY_DURATIONS[difficulty];
    const restChance = DIFFICULTY_REST_CHANCE[difficulty];
    const tripletChance = DIFFICULTY_TRIPLET_CHANCE[difficulty];
    const events: RhythmEvent[] = [];
    let remaining = totalTicks;

    while (remaining > 0) {
        // A triplet only makes sense as a group of 3 filling one whole quarter note.
        if (palette.includes('triplet-eighth') && remaining >= TICKS_PER_QUARTER && Math.random() < tripletChance) {
            for (let i = 0; i < 3; i++) {
                const isRest = Math.random() < restChance;
                events.push({ type: isRest ? 'rest' : 'note', duration: 'triplet-eighth', beats: DURATION_TICKS['triplet-eighth'] / TICKS_PER_QUARTER });
            }
            remaining -= TICKS_PER_QUARTER;
            continue;
        }
        const candidates = palette.filter((duration) => duration !== 'triplet-eighth' && DURATION_TICKS[duration] <= remaining);
        const duration = candidates.length > 0 ? pickRandom(candidates) : 'sixteenth';
        const ticks = DURATION_TICKS[duration];
        const isRest = Math.random() < restChance;
        events.push({ type: isRest ? 'rest' : 'note', duration, beats: ticks / TICKS_PER_QUARTER });
        remaining -= ticks;
    }

    return events;
}

export function patternKey(events: RhythmEvent[]): string {
    return events.map((event) => `${event.type === 'rest' ? 'r' : 'n'}${DURATION_TICKS[event.duration]}`).join('-');
}

export function describePattern(events: RhythmEvent[]): string {
    return events.map((event) => `${DURATION_LABELS[event.duration]}${event.type === 'rest' ? ' Rest' : ''}`).join(', ');
}

// Builds a shuffled list of candidate patterns (the correct one plus up to
// count - 1 distinct distractors) for a multiple-choice rhythm question.
export function buildRhythmChoices(
    correct: RhythmEvent[],
    timeSig: TimeSignatureName,
    difficulty: EarTrainingDifficulty,
    count = 4
): RhythmEvent[][] {
    const seen = new Set([patternKey(correct)]);
    const choices = [correct];
    let attempts = 0;
    while (choices.length < count && attempts < 30) {
        attempts += 1;
        const candidate = generateRhythmPattern(timeSig, difficulty);
        const key = patternKey(candidate);
        if (seen.has(key)) continue;
        seen.add(key);
        choices.push(candidate);
    }

    for (let i = choices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    return choices;
}
