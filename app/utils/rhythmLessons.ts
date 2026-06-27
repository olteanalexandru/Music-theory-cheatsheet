import type { RhythmEvent, TimeSignatureName } from '@/app/utils/rhythmData';

export interface RhythmLessonExample {
    label: string;
    counting: string;
    timeSig: TimeSignatureName;
    events: RhythmEvent[];
}

export interface RhythmLesson {
    id: string;
    title: string;
    summary: string;
    body: string[];
    examples: RhythmLessonExample[];
}

const note = (duration: RhythmEvent['duration'], beats: number): RhythmEvent => ({ type: 'note', duration, beats });
const rest = (duration: RhythmEvent['duration'], beats: number): RhythmEvent => ({ type: 'rest', duration, beats });

// A small, hand-picked (non-random) curriculum that walks from "what is a
// beat" up through subdivision, rests, time signatures and triplets. Kept
// separate from rhythmData.ts's randomized generateRhythmPattern, since
// lesson examples need to land on a specific, repeatable teaching point
// rather than a random draw.
export const RHYTHM_LESSONS: RhythmLesson[] = [
    {
        id: 'beats-and-values',
        title: '1. Beats and Note Values',
        summary: 'What a "beat" is, and how note values divide it.',
        body: [
            'A beat is the steady pulse you’d tap your foot to. Note values tell you how many beats a sound lasts: a quarter note gets 1 beat, a half note gets 2, and a whole note gets 4.',
            'Tap your foot evenly while each example plays — the longer notes simply ring through more foot-taps before the next note starts.',
        ],
        examples: [
            { label: 'Whole note (4 beats)', counting: '1   2   3   4', timeSig: '4/4', events: [note('whole', 4)] },
            { label: 'Half notes (2 beats each)', counting: '1   2   3   4', timeSig: '4/4', events: [note('half', 2), note('half', 2)] },
            { label: 'Quarter notes (1 beat each)', counting: '1   2   3   4', timeSig: '4/4', events: [note('quarter', 1), note('quarter', 1), note('quarter', 1), note('quarter', 1)] },
        ],
    },
    {
        id: 'subdivision',
        title: '2. Subdivision: Eighth Notes',
        summary: 'Splitting a beat in half, and counting "1 +".',
        body: [
            'An eighth note is half a beat — two of them fit in the space of one quarter note. Musicians count the off-beat eighth as "and" (written "+"), so a full measure of eighths in 4/4 counts as "1 + 2 + 3 + 4 +".',
            'Try counting out loud along with the example: say "1" exactly when you hear the first note, "+" exactly halfway to the next beat.',
        ],
        examples: [
            { label: 'Quarter, then two eighths, repeated', counting: '1   2 +  3   4 +', timeSig: '4/4', events: [note('quarter', 1), note('eighth', 0.5), note('eighth', 0.5), note('quarter', 1), note('eighth', 0.5), note('eighth', 0.5)] },
            { label: 'All eighth notes', counting: '1 + 2 + 3 + 4 +', timeSig: '4/4', events: Array.from({ length: 8 }, () => note('eighth', 0.5)) },
        ],
    },
    {
        id: 'rests',
        title: '3. Rests: Silence That Still Counts',
        summary: 'A rest takes up exactly as much time as a note — it just stays quiet.',
        body: [
            'Rests are easy to rush past because there’s nothing to hear, but they occupy real time in the measure. Keep counting through them at the same steady tempo, and come in exactly on time for the next note.',
            'In the example below, count "1, 2" through the half-rest, then play right on beat 3.',
        ],
        examples: [
            { label: 'Half rest, then two quarter notes', counting: '1   2   3   4', timeSig: '4/4', events: [rest('half', 2), note('quarter', 1), note('quarter', 1)] },
            { label: 'Quarter note, quarter rest, alternating', counting: '1   2   3   4', timeSig: '4/4', events: [note('quarter', 1), rest('quarter', 1), note('quarter', 1), rest('quarter', 1)] },
        ],
    },
    {
        id: 'dotted-notes',
        title: '4. Dotted Notes',
        summary: 'A dot adds half of the note’s own value again.',
        body: [
            'A dot after a note makes it last one-and-a-half times as long: a dotted quarter (1 + ½ = 1½ beats) is often followed by a single eighth note to fill out the remaining half-beat, a very common pairing.',
            'Listen for the slightly "long-short" feel of the dotted-quarter-plus-eighth pair — it’s the rhythm under countless basslines and melodies.',
        ],
        examples: [
            { label: 'Dotted quarter + eighth, twice', counting: '1   . +  2   . +', timeSig: '4/4', events: [note('dotted-quarter', 1.5), note('eighth', 0.5), note('dotted-quarter', 1.5), note('eighth', 0.5)] },
            { label: 'Dotted half + quarter', counting: '1   2   3   4', timeSig: '4/4', events: [note('dotted-half', 3), note('quarter', 1)] },
        ],
    },
    {
        id: 'sixteenths',
        title: '5. Sixteenth Notes',
        summary: 'Splitting a beat into four, and counting "1 e + a".',
        body: [
            'A sixteenth note is a quarter of a beat — four fit where one quarter note used to. The standard counting syllables are "1 e + a, 2 e + a..." Say them evenly: each syllable is exactly the same length.',
            'This is the fastest subdivision in this lesson set — go slowly at first and let the counting syllables guide your hand or foot.',
        ],
        examples: [
            { label: 'One beat of sixteenths, then quarters', counting: '1 e + a 2   3   4', timeSig: '4/4', events: [note('sixteenth', 0.25), note('sixteenth', 0.25), note('sixteenth', 0.25), note('sixteenth', 0.25), note('quarter', 1), note('quarter', 1), note('quarter', 1)] },
            { label: 'Sixteenths on every beat', counting: '1 e + a 2 e + a', timeSig: '2/4', events: Array.from({ length: 8 }, () => note('sixteenth', 0.25)) },
        ],
    },
    {
        id: 'time-signatures',
        title: '6. Time Signatures',
        summary: 'The top number counts beats per measure; the bottom picks the note value that gets one beat.',
        body: [
            'In 4/4, there are 4 beats per measure and a quarter note gets 1 beat — it’s the most common meter in popular music. 3/4 has only 3 beats per measure, giving music a waltz-like feel. 6/8 also groups in pairs of 3, but with a faster, more flowing eighth-note pulse underneath.',
            'Compare how the same idea — a strong first beat — feels different across these meters.',
        ],
        examples: [
            { label: '4/4 — four steady beats', counting: '1   2   3   4', timeSig: '4/4', events: Array.from({ length: 4 }, () => note('quarter', 1)) },
            { label: '3/4 — three beats (waltz feel)', counting: '1   2   3', timeSig: '3/4', events: Array.from({ length: 3 }, () => note('quarter', 1)) },
            { label: '6/8 — two groups of three eighths', counting: '1 + a 2 + a', timeSig: '6/8', events: Array.from({ length: 6 }, () => note('eighth', 0.5)) },
        ],
    },
    {
        id: 'triplets',
        title: '7. Triplets',
        summary: 'Fitting 3 evenly-spaced notes into the space normally held by 2.',
        body: [
            'An eighth-note triplet squeezes three equal notes into one beat, instead of the usual two eighth notes. Count it "1 trip-let, 2 trip-let" — each syllable lands evenly across the beat.',
            'Triplets feel noticeably different from straight subdivision — listen for the rolling, three-against-the-beat feel.',
        ],
        examples: [
            { label: 'Eighth-note triplets, two beats', counting: '1 trip let 2 trip let', timeSig: '4/4', events: Array.from({ length: 6 }, () => note('triplet-eighth', 1 / 3)) },
            { label: 'Triplet beat, then straight quarters', counting: '1 trip let 2   3', timeSig: '4/4', events: [note('triplet-eighth', 1 / 3), note('triplet-eighth', 1 / 3), note('triplet-eighth', 1 / 3), note('quarter', 1), note('quarter', 1)] },
        ],
    },
    {
        id: 'putting-it-together',
        title: '8. Putting It Together',
        summary: 'A mixed pattern that combines everything above — your warm-up before the Tap-Along.',
        body: [
            'Real rhythms mix durations and rests freely. Listen to the full pattern below a couple of times, counting along, then head to the Tap-Along tab to play patterns like this back in time yourself.',
        ],
        examples: [
            {
                label: 'Mixed pattern',
                counting: '1   2 +  3 e+a 4',
                timeSig: '4/4',
                events: [
                    note('quarter', 1),
                    rest('eighth', 0.5),
                    note('eighth', 0.5),
                    note('sixteenth', 0.25), note('sixteenth', 0.25), note('sixteenth', 0.25), note('sixteenth', 0.25),
                    note('quarter', 1),
                ],
            },
        ],
    },
];
