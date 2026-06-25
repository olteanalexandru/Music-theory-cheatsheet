import type { EarTrainingDifficulty } from '@/app/utils/earTrainingData';
import type { Category as PracticeCategory } from '@/app/components/EarTraining';

export interface QuizQuestion {
    question: string;
    choices: string[];
    correctIndex: number;
    explanation: string;
}

export interface PracticeLink {
    category: PracticeCategory;
    difficulty: EarTrainingDifficulty;
    label: string;
}

export interface Lesson {
    id: string;
    title: string;
    summary: string;
    content: string[];
    practice?: PracticeLink;
    quiz: QuizQuestion[];
}

export interface Unit {
    id: string;
    title: string;
    description: string;
    lessons: Lesson[];
}

// Passing a lesson's concept-check quiz requires this fraction correct or better.
export const QUIZ_PASS_THRESHOLD = 0.75;

export const CURRICULUM: Unit[] = [
    {
        id: 'foundations',
        title: 'Foundations of Pitch & Intervals',
        description: 'Start here: what pitch is, how intervals are named, and how to start recognizing them by ear.',
        lessons: [
            {
                id: 'pitch-basics',
                title: 'What Is Pitch?',
                summary: 'Semitones, whole steps, and the octave.',
                content: [
                    'Pitch is how high or low a note sounds. On a piano or guitar, the smallest possible step between two pitches is called a semitone (or half step) — the distance from any key to the very next key, white or black.',
                    'Two semitones make a whole step. Stack twelve semitones in a row and you land on an octave: the same note name again, but vibrating at exactly double (or half) the frequency. That 12-semitone cycle — the chromatic scale — is the full set of pitches Western music is built from before it repeats.',
                    'Everything else in this curriculum — intervals, scales, chords — is just different ways of selecting and combining notes from that 12-note cycle.',
                ],
                quiz: [
                    {
                        question: 'How many semitones are in one octave?',
                        choices: ['7', '8', '12', '10'],
                        correctIndex: 2,
                        explanation: 'The chromatic scale has 12 distinct pitches before the pattern repeats an octave higher.',
                    },
                    {
                        question: 'What is the smallest distance between two pitches called?',
                        choices: ['A whole step', 'An octave', 'A semitone (half step)', 'A scale degree'],
                        correctIndex: 2,
                        explanation: 'A semitone — the gap from any key to the very next one — is the smallest standard step in Western music.',
                    },
                    {
                        question: 'How many semitones make up a whole step?',
                        choices: ['1', '2', '3', '4'],
                        correctIndex: 1,
                        explanation: 'A whole step (whole tone) is two semitones.',
                    },
                    {
                        question: 'If a note vibrates at 440 Hz, what is the frequency of the same note one octave higher?',
                        choices: ['450 Hz', '660 Hz', '880 Hz', '220 Hz'],
                        correctIndex: 2,
                        explanation: 'An octave up doubles the frequency: 440 Hz × 2 = 880 Hz.',
                    },
                ],
            },
            {
                id: 'interval-names',
                title: 'Naming Intervals',
                summary: 'How intervals get their numbers and qualities.',
                content: [
                    'An interval is just the distance between two notes. Intervals get a number from how many letter-names they span (C to E spans C-D-E, three letters, so it\'s some kind of "3rd") and a quality (major, minor, or perfect) that pins down the exact semitone count.',
                    'The most common intervals, from smallest to largest within an octave: minor 2nd (1 semitone), major 2nd (2), minor 3rd (3), major 3rd (4), perfect 4th (5), perfect 5th (7), minor 6th (8), major 6th (9), minor 7th (10), major 7th (11), and the octave itself (12).',
                    'Perfect 4ths and 5ths don\'t come in "major/minor" flavors in standard practice — they\'re just perfect, because they sound stable and consonant regardless of context. Everything else pairs up as major (bigger) or minor (one semitone smaller).',
                ],
                practice: { category: 'intervals', difficulty: 'easy', label: 'Intervals · Easy' },
                quiz: [
                    {
                        question: 'How many semitones are in a major 3rd?',
                        choices: ['3', '4', '5', '2'],
                        correctIndex: 1,
                        explanation: 'A major 3rd spans 4 semitones, e.g. C to E.',
                    },
                    {
                        question: 'What interval is 7 semitones wide?',
                        choices: ['Major 6th', 'Perfect 4th', 'Perfect 5th', 'Minor 7th'],
                        correctIndex: 2,
                        explanation: 'The perfect 5th is 7 semitones — the most stable interval after the octave.',
                    },
                    {
                        question: 'Which interval quality does NOT have a major/minor pair?',
                        choices: ['3rds', '6ths', '4ths and 5ths', '7ths'],
                        correctIndex: 2,
                        explanation: 'Perfect 4ths and 5ths are simply "perfect" — they don\'t come in major/minor versions like 2nds, 3rds, 6ths, and 7ths do.',
                    },
                    {
                        question: 'C up to F spans how many letter names (C, D, E, F), and what is that interval called?',
                        choices: ['3 letters — a 3rd', '4 letters — a 4th', '5 letters — a 5th', '4 letters — a 5th'],
                        correctIndex: 1,
                        explanation: 'C-D-E-F is 4 letter names, so C to F is some kind of 4th — specifically a perfect 4th (5 semitones).',
                    },
                ],
            },
            {
                id: 'interval-ear-training',
                title: 'Training Your Ear for Intervals',
                summary: 'Practical tricks for recognizing intervals by sound.',
                content: [
                    'Reading interval names is one thing; recognizing them by ear is the real skill. The fastest way in is to anchor each interval to a melody you already know that starts with that exact leap.',
                    'A few common anchors: minor 2nd sounds like the "Jaws" theme; major 2nd opens "Happy Birthday"; minor 3rd opens "Greensleeves"; major 3rd opens "Kumbaya"; perfect 4th opens "Here Comes the Bride" or the "Star Wars" main theme leap; perfect 5th opens the "Star Wars" fanfare\'s first two notes; major 6th opens "My Bonnie Lies Over the Ocean"; major 7th has a wide, reaching quality found in the theme to "Take On Me".',
                    'When you hear two notes in the Ear Training drill below, try singing the gap back to yourself and matching it to one of these reference tunes before checking the answer choices.',
                ],
                practice: { category: 'intervals', difficulty: 'medium', label: 'Intervals · Medium' },
                quiz: [
                    {
                        question: 'Why is associating intervals with familiar melodies a useful ear-training trick?',
                        choices: [
                            'It replaces the need to know interval names',
                            'It gives your ear a concrete reference point to compare against',
                            'It only works for perfect intervals',
                            'It is mostly useful for rhythm, not pitch',
                        ],
                        correctIndex: 1,
                        explanation: 'A familiar tune gives you an instantly recallable reference for what an interval sounds like, bridging the gap between theory and recognition.',
                    },
                    {
                        question: 'What is generally true about how dissonant an interval sounds as it gets smaller (closer to a unison)?',
                        choices: [
                            'Smaller intervals like minor 2nds tend to sound more tense/dissonant',
                            'Smaller intervals always sound more consonant',
                            'Interval size has no effect on consonance',
                            'Only major intervals can sound dissonant',
                        ],
                        correctIndex: 0,
                        explanation: 'Very close intervals like the minor 2nd clash more, which is why they sound tense — it\'s the basis of the "Jaws" theme\'s menace.',
                    },
                    {
                        question: 'The perfect 5th and perfect 4th tend to sound:',
                        choices: ['Tense and unresolved', 'Open and stable', 'Bluesy', 'Identical to a minor 3rd'],
                        correctIndex: 1,
                        explanation: 'Perfect intervals are the most consonant, stable-sounding intervals besides the octave/unison.',
                    },
                    {
                        question: 'What should you do when you hear an unfamiliar interval before checking the answer choices?',
                        choices: [
                            'Guess randomly',
                            'Try humming the gap back and comparing it to a reference tune',
                            'Assume it\'s always a major 3rd',
                            'Skip the question',
                        ],
                        correctIndex: 1,
                        explanation: 'Actively reproducing the interval (even mentally) trains the same recognition skill that hearing alone doesn\'t build as quickly.',
                    },
                ],
            },
            {
                id: 'compound-intervals',
                title: 'Compound Intervals',
                summary: 'What 9ths, 11ths, and 13ths actually are.',
                content: [
                    'Once you go past an octave, intervals get "compound" names: a 9th is just an octave plus a 2nd, an 11th is an octave plus a 4th, and a 13th is an octave plus a 6th. The underlying pitch relationship (and its sound) is the same as the simple interval — a 9th has the same flavor as a 2nd, just spread further apart.',
                    'These show up constantly in jazz and extended chord voicings: a "C9" chord is a dominant 7th chord with a major 9th stacked on top, which is really just "add a major 2nd, an octave up."',
                    'Counting semitones makes the relationship obvious: a major 2nd is 2 semitones, a major 9th is 14 (2 + 12 for the extra octave). Same logic applies to 11ths (perfect 4th + 12) and 13ths (major 6th + 12).',
                ],
                practice: { category: 'intervals', difficulty: 'hard', label: 'Intervals · Hard' },
                quiz: [
                    {
                        question: 'A 9th is an octave plus which simple interval?',
                        choices: ['A 3rd', 'A 4th', 'A 2nd', 'A 6th'],
                        correctIndex: 2,
                        explanation: 'A 9th = an octave (8) + a 2nd. The "9" comes from 8 + 2 - 1 (sharing the octave note).',
                    },
                    {
                        question: 'How many semitones are in a major 9th?',
                        choices: ['9', '12', '14', '16'],
                        correctIndex: 2,
                        explanation: 'A major 2nd is 2 semitones; add a full octave (12) for the major 9th: 14 total.',
                    },
                    {
                        question: 'A perfect 11th is an octave plus which interval?',
                        choices: ['A perfect 4th', 'A perfect 5th', 'A major 3rd', 'A minor 7th'],
                        correctIndex: 0,
                        explanation: 'An 11th = octave + 4th, just like a 9th is an octave + 2nd.',
                    },
                    {
                        question: 'Why do compound intervals matter in practice?',
                        choices: [
                            'They sound completely different from their simple counterparts',
                            'They only exist in theory, never in real chords',
                            'They describe how extended chords like 9ths and 13ths are built',
                            'They replace the need for octaves',
                        ],
                        correctIndex: 2,
                        explanation: 'Extended chords (9, 11, 13 chords) are named directly from these compound intervals stacked above the root.',
                    },
                ],
            },
        ],
    },
    {
        id: 'scales-keys',
        title: 'Scales & Key Signatures',
        description: 'Build the major and minor scales from a formula, then connect them to key signatures and the circle of fifths.',
        lessons: [
            {
                id: 'major-scale',
                title: 'The Major Scale Formula',
                summary: 'W-W-H-W-W-W-H and the seven scale degrees.',
                content: [
                    'Every major scale follows the exact same pattern of whole (W) and half (H) steps: W-W-H-W-W-W-H. Start on any note and apply that pattern, and you get a major scale in that key.',
                    'For C major: C(W)D(W)E(H)F(W)G(W)A(W)B(H)C — and because that lands on white keys only, C major needs no sharps or flats. Apply the exact same formula starting on G, and you get G-A-B-C-D-E-F♯-G: one sharp, because the formula demands a whole step from E to F♯ where the plain F would only be a half step away.',
                    'The seven notes are numbered scale degrees 1 through 7 (often called do-re-mi-fa-sol-la-ti). Scale degree 1 is the tonic — the "home" note the whole key is named after and gravitates back to.',
                ],
                practice: { category: 'scales', difficulty: 'easy', label: 'Scales · Easy' },
                quiz: [
                    {
                        question: 'What is the whole-step/half-step formula for a major scale?',
                        choices: ['W-H-W-W-H-W-W', 'W-W-H-W-W-W-H', 'H-W-W-H-W-W-W', 'W-W-W-H-W-W-H'],
                        correctIndex: 1,
                        explanation: 'Every major scale, in every key, follows W-W-H-W-W-W-H.',
                    },
                    {
                        question: 'Why does G major need an F♯ instead of a plain F?',
                        choices: [
                            'It doesn\'t — G major has no sharps',
                            'The formula needs a whole step from E to the 7th degree, which only F♯ provides',
                            'F♯ just sounds better',
                            'All major scales except C need every note sharped',
                        ],
                        correctIndex: 1,
                        explanation: 'Following W-W-H-W-W-W-H from G lands exactly on F♯ for the 7th degree — a plain F would only be a half step from E, breaking the formula.',
                    },
                    {
                        question: 'What is scale degree 1 of a major scale called?',
                        choices: ['The dominant', 'The subdominant', 'The tonic', 'The leading tone'],
                        correctIndex: 2,
                        explanation: 'The tonic is the home note the scale (and key) is named after.',
                    },
                    {
                        question: 'How many distinct notes are in a major scale before it repeats?',
                        choices: ['5', '6', '7', '8'],
                        correctIndex: 2,
                        explanation: 'Seven distinct scale degrees, with the 8th note being the tonic repeated an octave up.',
                    },
                ],
            },
            {
                id: 'relative-minor',
                title: 'Natural Minor & Relative Keys',
                summary: 'How every major key has a minor "twin" sharing its key signature.',
                content: [
                    'The natural minor scale has its own formula: W-H-W-W-H-W-W. Compared to major, the 3rd, 6th, and 7th degrees are each a semitone lower, which is what gives minor keys their darker character.',
                    'Every major key has a relative minor: start the major scale\'s notes from its 6th degree instead of its 1st, and you get the natural minor scale with an identical set of notes — and therefore an identical key signature. C major\'s 6th degree is A, so A minor is C major\'s relative minor: same seven notes (no sharps/flats), different tonic.',
                    'This relationship is why a piece "in A minor" and a piece "in C major" can use the exact same key signature on the staff — what differs is which note the music treats as home.',
                ],
                practice: { category: 'scales', difficulty: 'easy', label: 'Scales · Easy' },
                quiz: [
                    {
                        question: 'Compared to a major scale, which degrees are lowered in the natural minor scale?',
                        choices: ['2nd, 4th, 6th', '3rd, 6th, 7th', '3rd, 5th, 7th', '2nd, 3rd, 5th'],
                        correctIndex: 1,
                        explanation: 'Natural minor lowers the 3rd, 6th, and 7th degrees relative to the major scale on the same tonic.',
                    },
                    {
                        question: 'What is the relative minor of C major?',
                        choices: ['F minor', 'G minor', 'A minor', 'E minor'],
                        correctIndex: 2,
                        explanation: 'A is the 6th degree of the C major scale, so A minor is C major\'s relative minor — same notes, same key signature.',
                    },
                    {
                        question: 'How do you find a major scale\'s relative minor?',
                        choices: [
                            'Start the same notes from the 6th scale degree',
                            'Raise every note a semitone',
                            'Start the same notes from the 4th scale degree',
                            'Play the scale backwards',
                        ],
                        correctIndex: 0,
                        explanation: 'Renumbering the major scale\'s 6th degree as the new "1" gives you the relative natural minor scale.',
                    },
                    {
                        question: 'Why do C major and A minor share a key signature?',
                        choices: [
                            'They don\'t actually share one',
                            'They use the exact same seven notes, just starting from a different tonic',
                            'Coincidence with no underlying reason',
                            'Because A minor is louder',
                        ],
                        correctIndex: 1,
                        explanation: 'A key signature reflects which notes are used, not which one is "home" — relative major/minor pairs use identical notes.',
                    },
                ],
            },
            {
                id: 'key-signatures',
                title: 'Key Signatures & the Circle of Fifths',
                summary: 'The order sharps and flats are added, and how the circle of fifths organizes every key.',
                content: [
                    'Key signatures don\'t add sharps or flats in random order. Sharps are always added in this sequence: F♯, C♯, G♯, D♯, A♯, E♯, B♯. Flats are added in the exact reverse sequence: B♭, E♭, A♭, D♭, G♭, C♭, F♭.',
                    'The circle of fifths arranges all twelve major keys in a circle where each step clockwise is a perfect 5th up and adds one sharp, while each step counter-clockwise is a perfect 5th down (or a 4th up) and adds one flat. C major sits at the top with no sharps or flats; G (one sharp) is one step clockwise; F (one flat) is one step counter-clockwise.',
                    'This is more than trivia — because each new sharp/flat key is built from the previous one by raising or lowering exactly one note, the circle of fifths is also a map of how closely related any two keys are, which is why so many chord progressions move around it.',
                ],
                practice: { category: 'keysig', difficulty: 'easy', label: 'Key Signatures · Easy' },
                quiz: [
                    {
                        question: 'In which order are sharps added to a key signature?',
                        choices: [
                            'F♯, C♯, G♯, D♯, A♯, E♯, B♯',
                            'B♯, E♯, A♯, D♯, G♯, C♯, F♯',
                            'C♯, D♯, E♯, F♯, G♯, A♯, B♯',
                            'Random, depending on the key',
                        ],
                        correctIndex: 0,
                        explanation: 'Sharps always accumulate in the fixed order F♯-C♯-G♯-D♯-A♯-E♯-B♯.',
                    },
                    {
                        question: 'What is the order flats are added in?',
                        choices: [
                            'The same order as sharps',
                            'The exact reverse of the sharp order: B♭, E♭, A♭, D♭, G♭, C♭, F♭',
                            'Alphabetical: A♭, B♭, C♭...',
                            'There is no fixed order for flats',
                        ],
                        correctIndex: 1,
                        explanation: 'Flats accumulate in the mirror-image order of sharps.',
                    },
                    {
                        question: 'Moving one step clockwise on the circle of fifths from a given major key does what?',
                        choices: [
                            'Moves down a perfect 5th and removes a sharp',
                            'Moves up a perfect 5th and adds one sharp (or removes one flat)',
                            'Has no relationship to sharps or flats',
                            'Switches the key to its relative minor',
                        ],
                        correctIndex: 1,
                        explanation: 'Each clockwise step is a perfect 5th higher and adds exactly one sharp to the key signature.',
                    },
                    {
                        question: 'Which key sits directly opposite C major on the circle of fifths, with the most sharps/flats?',
                        choices: ['G major', 'F♯ / G♭ major', 'D major', 'B♭ major'],
                        correctIndex: 1,
                        explanation: 'F♯ major (6 sharps) and its enharmonic twin G♭ major (6 flats) sit at the far point of the circle from C.',
                    },
                ],
            },
            {
                id: 'modes',
                title: 'Modes Beyond Major and Minor',
                summary: 'Dorian, Phrygian, Lydian, Mixolydian, and Locrian as altered major/minor scales.',
                content: [
                    'A mode is what you get by taking a major scale\'s set of notes and treating a different degree as "home." There are seven modes total; you already know two of them by other names — Ionian is just the major scale, and Aeolian is the natural minor scale.',
                    'The easiest way to understand the others is as a minor or major scale with one degree altered: Dorian is a minor scale with a raised (major) 6th; Phrygian is a minor scale with a lowered 2nd; Lydian is a major scale with a raised 4th; Mixolydian is a major scale with a lowered 7th; Locrian is a minor scale with both a lowered 2nd and lowered 5th.',
                    'Each has a distinct character: Dorian feels minor but brighter (common in modal jazz and Celtic music), Mixolydian feels major but bluesy (common over dominant 7th chords), and Lydian has a dreamy, floating quality from that raised 4th.',
                ],
                practice: { category: 'scales', difficulty: 'hard', label: 'Scales · Hard' },
                quiz: [
                    {
                        question: 'Which mode is identical to the natural minor scale?',
                        choices: ['Dorian', 'Aeolian', 'Mixolydian', 'Lydian'],
                        correctIndex: 1,
                        explanation: 'Aeolian is just another name for the natural minor scale.',
                    },
                    {
                        question: 'Dorian can be described as:',
                        choices: [
                            'A major scale with a lowered 7th',
                            'A minor scale with a raised (major) 6th',
                            'A minor scale with a lowered 2nd',
                            'A major scale with a raised 4th',
                        ],
                        correctIndex: 1,
                        explanation: 'Dorian takes the natural minor scale and raises the 6th degree, giving it a brighter edge than plain minor.',
                    },
                    {
                        question: 'Which mode is a major scale with a raised 4th degree?',
                        choices: ['Lydian', 'Mixolydian', 'Phrygian', 'Locrian'],
                        correctIndex: 0,
                        explanation: 'Lydian raises the 4th degree of the major scale, producing its dreamy, floating sound.',
                    },
                    {
                        question: 'Mixolydian is commonly used over which type of chord?',
                        choices: ['Diminished 7th chords', 'Dominant 7th chords', 'Major 7th chords only', 'It has no common chordal use'],
                        correctIndex: 1,
                        explanation: 'Mixolydian\'s lowered 7th matches the lowered 7th in a dominant 7th chord, making it a natural fit.',
                    },
                ],
            },
        ],
    },
    {
        id: 'chords-harmony',
        title: 'Chords & Harmony',
        description: 'Stack intervals into triads and 7th chords, then see how chords are organized within a key.',
        lessons: [
            {
                id: 'triads',
                title: 'Triads: Major, Minor, Diminished, Augmented',
                summary: 'Stacking two 3rds to build the four basic triad qualities.',
                content: [
                    'A triad is built by stacking two 3rds on top of a root note. The quality of those two stacked 3rds determines the chord\'s quality: major (major 3rd + minor 3rd), minor (minor 3rd + major 3rd), diminished (minor 3rd + minor 3rd), and augmented (major 3rd + major 3rd).',
                    'In semitones from the root: major is 0-4-7, minor is 0-3-7, diminished is 0-3-6, and augmented is 0-4-8. Major and minor share the same outer interval (a perfect 5th, 7 semitones) but differ in where the middle note sits; diminished squeezes that 5th down to a tritone, and augmented stretches it up.',
                    'Major triads sound bright and resolved, minor triads sound darker, diminished triads sound tense and unstable (often used to lead somewhere else), and augmented triads sound symmetrical and ambiguous, with no strong pull in any direction.',
                ],
                practice: { category: 'chords', difficulty: 'easy', label: 'Chords · Easy' },
                quiz: [
                    {
                        question: 'A major triad is built from which two stacked intervals?',
                        choices: [
                            'Minor 3rd then major 3rd',
                            'Major 3rd then minor 3rd',
                            'Two major 3rds',
                            'Two minor 3rds',
                        ],
                        correctIndex: 1,
                        explanation: 'Major triad = root, major 3rd up, then minor 3rd up from there (0-4-7 in semitones).',
                    },
                    {
                        question: 'What semitone pattern (from the root) is a diminished triad?',
                        choices: ['0-4-7', '0-3-7', '0-3-6', '0-4-8'],
                        correctIndex: 2,
                        explanation: 'Diminished stacks two minor 3rds: 0-3-6, ending in a tritone above the root.',
                    },
                    {
                        question: 'Which triad is built from two stacked major 3rds?',
                        choices: ['Major', 'Minor', 'Diminished', 'Augmented'],
                        correctIndex: 3,
                        explanation: 'Augmented triads stack a major 3rd on top of another major 3rd (0-4-8), making them perfectly symmetrical.',
                    },
                    {
                        question: 'Major and minor triads share which interval between the root and the top note?',
                        choices: ['A tritone', 'A perfect 5th', 'A major 6th', 'An augmented 5th'],
                        correctIndex: 1,
                        explanation: 'Both major (0-4-7) and minor (0-3-7) triads span a perfect 5th (7 semitones) from root to top note — only the middle note differs.',
                    },
                ],
            },
            {
                id: 'seventh-chords',
                title: 'Seventh Chords',
                summary: 'Adding a 4th note on top of a triad for jazzier, richer harmony.',
                content: [
                    'A seventh chord is a triad with one more 3rd stacked on top, adding the chord\'s 7th degree. The five most common types: major 7th (major triad + major 7th, 0-4-7-11), minor 7th (minor triad + minor 7th, 0-3-7-10), dominant 7th (major triad + minor 7th, 0-4-7-10), minor 7♭5 / half-diminished (diminished triad + minor 7th, 0-3-6-10), and diminished 7th (diminished triad + diminished 7th, 0-3-6-9).',
                    'The dominant 7th is especially important: that major-triad-plus-minor-7th combination creates a strong pull back to the tonic chord, which is why it\'s the backbone of blues and the "V7" in classical cadences.',
                    'Major 7th chords sound lush and dreamy (common in jazz ballads and bossa nova); minor 7th chords sound smooth and mellow; diminished 7th chords are maximally tense and, because they\'re built from stacked minor 3rds all the way around, perfectly symmetrical.',
                ],
                practice: { category: 'chords', difficulty: 'hard', label: 'Chords · Hard' },
                quiz: [
                    {
                        question: 'What distinguishes a dominant 7th chord from a major 7th chord?',
                        choices: [
                            'Dominant 7th has a minor 7th on top of a major triad; major 7th has a major 7th',
                            'They are the same chord with different names',
                            'Dominant 7th has no 3rd',
                            'Major 7th is always minor in quality',
                        ],
                        correctIndex: 0,
                        explanation: 'Both start from a major triad, but dominant 7th adds a minor 7th (0-4-7-10) while major 7th adds a major 7th (0-4-7-11).',
                    },
                    {
                        question: 'Why is the dominant 7th chord so central to cadences?',
                        choices: [
                            'It has no particular tendency to resolve anywhere',
                            'The combination of major 3rd and minor 7th creates strong pull back to the tonic',
                            'It only works in minor keys',
                            'It is the simplest possible chord',
                        ],
                        correctIndex: 1,
                        explanation: 'That specific major-3rd-plus-minor-7th tension is what gives V7 chords their strong "need to resolve" feeling.',
                    },
                    {
                        question: 'A half-diminished (minor 7♭5) chord is built from which triad plus which 7th?',
                        choices: [
                            'Major triad + major 7th',
                            'Minor triad + minor 7th',
                            'Diminished triad + minor 7th',
                            'Augmented triad + major 7th',
                        ],
                        correctIndex: 2,
                        explanation: 'Half-diminished = diminished triad (0-3-6) plus a minor 7th on top (0-3-6-10).',
                    },
                    {
                        question: 'Why is the diminished 7th chord described as "perfectly symmetrical"?',
                        choices: [
                            'It has only two notes',
                            'It is built from stacked minor 3rds all the way around (0-3-6-9)',
                            'It contains a perfect 5th and nothing else',
                            'It is identical to a major triad',
                        ],
                        correctIndex: 1,
                        explanation: 'Every interval between adjacent notes in a diminished 7th chord is the same minor 3rd, making it symmetrical.',
                    },
                ],
            },
            {
                id: 'diatonic-harmony',
                title: 'Diatonic Harmony & Roman Numerals',
                summary: 'Building a chord on every degree of a major scale.',
                content: [
                    'If you build a triad on every degree of a major scale, using only notes from that scale, you get a predictable, repeating pattern of qualities: I (major), ii (minor), iii (minor), IV (major), V (major), vi (minor), vii° (diminished). This is true in every major key — only the actual note names change.',
                    'Roman numerals capture this directly: uppercase for major chords, lowercase for minor, and a degree symbol (°) for diminished. Writing a progression in Roman numerals (like I-IV-V) describes its shape independent of key, which is why the same numeral progression can be played in any key without changing its function.',
                    'This pattern is why certain chords always feel similar in role: the V chord is always major and always wants to resolve, the vii° chord is always diminished and always feels unstable, no matter which key you\'re in.',
                ],
                practice: { category: 'progressions', difficulty: 'easy', label: 'Chord Progressions · Easy' },
                quiz: [
                    {
                        question: 'What quality is the iii chord in a major key?',
                        choices: ['Major', 'Minor', 'Diminished', 'Augmented'],
                        correctIndex: 1,
                        explanation: 'The diatonic triad pattern in major is I-ii-iii-IV-V-vi-vii°, where iii is minor.',
                    },
                    {
                        question: 'Which scale degree always produces a diminished triad in a major key?',
                        choices: ['The 2nd (ii)', 'The 5th (V)', 'The 7th (vii°)', 'The 1st (I)'],
                        correctIndex: 2,
                        explanation: 'The triad built on the 7th degree of a major scale is always diminished — hence vii°.',
                    },
                    {
                        question: 'Why use Roman numerals instead of chord letter names?',
                        choices: [
                            'They describe a progression\'s shape independent of key',
                            'They only work in C major',
                            'They replace the need to know any chord qualities',
                            'They are purely decorative notation',
                        ],
                        correctIndex: 0,
                        explanation: 'I-IV-V means the same functional pattern whether you\'re in C, G, or any other key — only the letter names change.',
                    },
                    {
                        question: 'In the Roman numeral system, what does a lowercase numeral indicate?',
                        choices: ['A diminished chord', 'A major chord', 'A minor chord', 'A 7th chord'],
                        correctIndex: 2,
                        explanation: 'Lowercase numerals (ii, iii, vi) indicate minor triads; uppercase (I, IV, V) indicate major.',
                    },
                ],
            },
            {
                id: 'functional-harmony',
                title: 'Functional Harmony: Tonic, Subdominant, Dominant',
                summary: 'Why progressions feel like they\'re going somewhere.',
                content: [
                    'Diatonic chords group into three functions. Tonic (I, vi) feels like home — stable, resolved, a place to rest. Subdominant (ii, IV) feels like movement away from home, building anticipation. Dominant (V, vii°) feels like maximum tension, demanding a return to the tonic.',
                    'A cadence is a chord move that closes a musical phrase. The strongest is the authentic cadence, V-I (or V7-I) — dominant resolving straight to tonic. The plagal cadence, IV-I, is gentler and is sometimes nicknamed the "Amen cadence" from its use in hymns.',
                    'Knowing these functions lets you predict, and write, progressions that feel purposeful: most progressions are some path through subdominant, to dominant, and back to tonic — T-S-D-T is the basic skeleton underneath an enormous amount of music.',
                ],
                practice: { category: 'progressions', difficulty: 'medium', label: 'Chord Progressions · Medium' },
                quiz: [
                    {
                        question: 'Which chords carry "tonic" function in a major key?',
                        choices: ['I and vi', 'ii and IV', 'V and vii°', 'iii and vi'],
                        correctIndex: 0,
                        explanation: 'I (the tonic itself) and vi (its closest relative) both carry tonic, "home" function.',
                    },
                    {
                        question: 'What is an authentic cadence?',
                        choices: ['IV to I', 'V (or V7) to I', 'I to V', 'ii to vi'],
                        correctIndex: 1,
                        explanation: 'V-I (or V7-I) is the strongest, most conclusive cadence — dominant resolving to tonic.',
                    },
                    {
                        question: 'The plagal cadence (IV-I) is sometimes nicknamed:',
                        choices: ['The blues cadence', 'The Amen cadence', 'The deceptive cadence', 'The half cadence'],
                        correctIndex: 1,
                        explanation: 'IV-I is called the "Amen cadence" from its frequent use at the end of hymns.',
                    },
                    {
                        question: 'What is the basic functional skeleton behind most common progressions?',
                        choices: ['Dominant only', 'Tonic - Subdominant - Dominant - Tonic', 'Subdominant only', 'Random chord order'],
                        correctIndex: 1,
                        explanation: 'T-S-D-T (leave home, build tension, resolve back) underlies a huge share of common-practice and popular music progressions.',
                    },
                ],
            },
        ],
    },
    {
        id: 'progressions',
        title: 'Chord Progressions',
        description: 'See functional harmony in action through the progressions that show up everywhere.',
        lessons: [
            {
                id: 'pop-progressions',
                title: 'Common Pop & Rock Progressions',
                summary: 'I-IV-V, I-V-vi-IV, and the "50s progression."',
                content: [
                    'I-IV-V-I is about as fundamental as progressions get: tonic, subdominant, dominant, back to tonic. It\'s the harmonic backbone of blues and a huge share of rock and folk music.',
                    'I-V-vi-IV is the so-called "four chords" progression — instantly recognizable because it powers an enormous number of pop hits across decades. Its close cousin, I-vi-IV-V, is nicknamed the "50s progression" for its use in doo-wop and early rock \'n\' roll standards.',
                    'A minor-feeling variant, vi-IV-I-V, simply rotates the same four chords to start on the relative minor instead of the tonic — same harmonic content, different emotional starting point.',
                ],
                practice: { category: 'progressions', difficulty: 'easy', label: 'Chord Progressions · Easy' },
                quiz: [
                    {
                        question: 'What functions does the I-IV-V-I progression cycle through?',
                        choices: [
                            'Tonic, dominant, subdominant, tonic',
                            'Tonic, subdominant, dominant, tonic',
                            'Subdominant only',
                            'Dominant, tonic, subdominant, dominant',
                        ],
                        correctIndex: 1,
                        explanation: 'I-IV-V-I moves tonic -> subdominant -> dominant -> back to tonic, the most basic harmonic journey.',
                    },
                    {
                        question: 'The "four chords" progression made famous for appearing in countless pop songs is:',
                        choices: ['I-vi-IV-V', 'ii-V-I', 'I-V-vi-IV', 'I-IV-vii°-iii'],
                        correctIndex: 2,
                        explanation: 'I-V-vi-IV is the progression often referred to as "the four chords" because of how frequently it recurs across pop music.',
                    },
                    {
                        question: 'What is the "50s progression"?',
                        choices: ['I-vi-IV-V', 'vi-ii-V-I', 'I-iii-IV-V', 'I-IV-V-I'],
                        correctIndex: 0,
                        explanation: 'I-vi-IV-V is nicknamed the 50s progression for its heavy use in doo-wop and early rock \'n\' roll.',
                    },
                    {
                        question: 'How does vi-IV-I-V relate to I-V-vi-IV?',
                        choices: [
                            'It is a completely unrelated progression',
                            'It is the same four chords, rotated to start on the relative minor',
                            'It uses different chords entirely',
                            'It only works in minor keys',
                        ],
                        correctIndex: 1,
                        explanation: 'Rotating which chord starts the cycle changes the emotional starting point without changing the underlying harmony.',
                    },
                ],
            },
            {
                id: 'jazz-ii-v-i',
                title: 'The Jazz ii-V-I Cadence',
                summary: 'The backbone of jazz harmony — and the full circle progression.',
                content: [
                    'The ii-V-I progression is the single most common cadence in jazz: a subdominant chord (ii), moving to a dominant chord (V), resolving to the tonic (I). Each step increases tension until the final resolution.',
                    'Real jazz tunes often chain several ii-V pairs together before the final resolution, or insert extra diatonic chords along the way — for example, vi-ii-V-I adds a minor-key-flavored run-up before the cadence.',
                    'Taken to its logical extreme, you get the full circle-of-fifths progression: I-IV-vii°-iii-vi-ii-V-I, visiting every diatonic chord by descending in fifths before returning home. It\'s a miniature tour of the entire key.',
                ],
                practice: { category: 'progressions', difficulty: 'hard', label: 'Chord Progressions · Hard' },
                quiz: [
                    {
                        question: 'What functions make up the ii-V-I cadence?',
                        choices: [
                            'Tonic, dominant, subdominant',
                            'Subdominant, dominant, tonic',
                            'Dominant, tonic, subdominant',
                            'Tonic, subdominant, subdominant',
                        ],
                        correctIndex: 1,
                        explanation: 'ii (subdominant) -> V (dominant) -> I (tonic) is the classic jazz cadence shape.',
                    },
                    {
                        question: 'What does vi-ii-V-I add compared to a plain ii-V-I?',
                        choices: [
                            'Nothing, they are identical',
                            'A minor-key-flavored run-up (vi) before the jazz cadence',
                            'An extra dominant chord',
                            'A key change',
                        ],
                        correctIndex: 1,
                        explanation: 'Starting on vi adds a minor-tinged lead-in before settling into the familiar ii-V-I resolution.',
                    },
                    {
                        question: 'The full circle-of-fifths progression I-IV-vii°-iii-vi-ii-V-I moves through chords by:',
                        choices: [
                            'Ascending fifths',
                            'Descending fifths (equivalently, ascending fourths)',
                            'Random scale degrees',
                            'Chromatic half-steps only',
                        ],
                        correctIndex: 1,
                        explanation: 'Each chord in that chain is a fifth below (or a fourth above) the previous one, visiting every diatonic chord on the way back to I.',
                    },
                    {
                        question: 'Why is ii-V-I considered the backbone of jazz harmony?',
                        choices: [
                            'It never resolves',
                            'It rarely appears in real jazz tunes',
                            'It builds tension through subdominant and dominant function before a satisfying resolution, and is reused constantly',
                            'It only uses major chords',
                        ],
                        correctIndex: 2,
                        explanation: 'Its clear tension-and-release shape makes it endlessly reusable and recognizable, which is why jazz standards lean on it so heavily.',
                    },
                ],
            },
        ],
    },
    {
        id: 'rhythm-time',
        title: 'Rhythm & Time',
        description: 'Meter, note durations, and the subdivisions that give music its groove.',
        lessons: [
            {
                id: 'time-signatures',
                title: 'Beats, Meter, and Time Signatures',
                summary: 'What the two numbers in a time signature actually mean.',
                content: [
                    'A time signature has two numbers. The top number says how many beats are in each measure. The bottom number says which note value counts as one beat — a 4 means the quarter note gets the beat, an 8 means the eighth note does.',
                    '4/4 (four quarter-note beats per measure) is by far the most common meter in popular music. 3/4 (three quarter-note beats) gives a waltz-like feel. These are both "simple" meters, where each beat divides naturally into two.',
                    '6/8 looks like it should mean "six eighth-note beats," but it\'s almost always felt as two big beats, each made of three eighth notes — a "compound" meter. That grouping-of-three-within-a-beat is what gives 6/8 its rolling, lilting feel compared to 3/4 or 2/4.',
                ],
                practice: { category: 'rhythm', difficulty: 'easy', label: 'Rhythm · Easy' },
                quiz: [
                    {
                        question: 'In a time signature, what does the top number tell you?',
                        choices: [
                            'Which note value gets one beat',
                            'How many beats are in each measure',
                            'The tempo in beats per minute',
                            'The key signature',
                        ],
                        correctIndex: 1,
                        explanation: 'The top number is the beat count per measure; the bottom number says which note value is "one beat."',
                    },
                    {
                        question: 'In 4/4 time, which note value receives one beat?',
                        choices: ['Half note', 'Quarter note', 'Eighth note', 'Whole note'],
                        correctIndex: 1,
                        explanation: 'The bottom "4" means the quarter note is the beat unit.',
                    },
                    {
                        question: 'How is 6/8 typically felt, despite its name suggesting six beats?',
                        choices: [
                            'As six separate equal beats',
                            'As two big beats, each made of three eighth notes',
                            'As three big beats of two eighth notes each',
                            'It is never used in practice',
                        ],
                        correctIndex: 1,
                        explanation: '6/8 is a compound meter usually felt in two groups of three eighth notes, giving it a distinct rolling feel.',
                    },
                    {
                        question: 'What feel does 3/4 time typically produce?',
                        choices: ['A driving rock feel', 'A waltz-like feel', 'A compound, rolling feel', 'No discernible pulse'],
                        correctIndex: 1,
                        explanation: 'Three quarter-note beats per measure is the classic waltz meter.',
                    },
                ],
            },
            {
                id: 'note-durations',
                title: 'Note Durations & Subdivision',
                summary: 'How whole, half, quarter, eighth, and sixteenth notes relate — and what a dot does.',
                content: [
                    'Note durations form a strict halving chain: a whole note equals two half notes, a half note equals two quarter notes, a quarter note equals two eighth notes, and an eighth note equals two sixteenth notes. Each step down splits the previous duration exactly in half.',
                    'A dot placed after a note adds half of that note\'s value to itself. A dotted quarter note equals a quarter plus an eighth (1.5 quarter notes\' worth) — which is why dotted rhythms feel "long-short" rather than evenly divided.',
                    'Subdivision is simply counting the smaller pieces inside a beat ("1-and, 2-and" for eighth notes, "1-e-and-a" for sixteenths). Internalizing subdivisions is what lets a performer play rhythms accurately rather than just approximately.',
                ],
                practice: { category: 'rhythm', difficulty: 'medium', label: 'Rhythm · Medium' },
                quiz: [
                    {
                        question: 'How many eighth notes equal one quarter note?',
                        choices: ['1', '2', '4', '3'],
                        correctIndex: 1,
                        explanation: 'Each step down the duration chain halves the previous value: one quarter note = two eighth notes.',
                    },
                    {
                        question: 'What does a dot after a note do to its duration?',
                        choices: [
                            'Doubles it',
                            'Adds half of the note\'s own value to itself',
                            'Cuts it in half',
                            'Has no effect',
                        ],
                        correctIndex: 1,
                        explanation: 'A dot adds 50% of the note\'s base value — a dotted half note = a half plus a quarter.',
                    },
                    {
                        question: 'A dotted quarter note is equal in length to:',
                        choices: [
                            'A quarter note plus an eighth note',
                            'Two quarter notes',
                            'A half note',
                            'An eighth note',
                        ],
                        correctIndex: 0,
                        explanation: 'Dotted quarter = quarter (1 beat) + half of a quarter (an eighth note, 0.5 beats) = 1.5 beats total.',
                    },
                    {
                        question: 'Why is subdividing beats (e.g. counting "1-and-2-and") useful?',
                        choices: [
                            'It has no practical benefit',
                            'It lets a performer place rhythms accurately rather than approximately',
                            'It only matters for sight-reading, not playing',
                            'It is only used in jazz',
                        ],
                        correctIndex: 1,
                        explanation: 'Internalized subdivision gives you a steady internal grid to place notes against precisely.',
                    },
                ],
            },
            {
                id: 'syncopation',
                title: 'Syncopation & Rests',
                summary: 'Playing against the expected beat, and why silence still takes up time.',
                content: [
                    'Syncopation is emphasis placed where you don\'t expect it — on an off-beat or a weak part of the beat instead of the strong, expected downbeat. It\'s a major source of "groove" in funk, jazz, reggae, and most popular rhythm sections.',
                    'A rest is not an absence of rhythm — it\'s a note-shaped silence that occupies exactly as much time as the note value it represents. A quarter rest takes one beat of silence in 4/4 just as definitively as a quarter note takes one beat of sound.',
                    'Combining short notes, rests, and off-beat accents is what separates a flat, mechanical-sounding rhythm from one that feels alive. Listening for where the silence and the accents land is just as important as listening to the notes themselves.',
                ],
                practice: { category: 'rhythm', difficulty: 'hard', label: 'Rhythm · Hard' },
                quiz: [
                    {
                        question: 'What is syncopation?',
                        choices: [
                            'Playing every note on the downbeat',
                            'Emphasis placed on an off-beat or unexpected part of the beat',
                            'A type of key signature',
                            'A way of notating rests',
                        ],
                        correctIndex: 1,
                        explanation: 'Syncopation deliberately accents weak beats or off-beats rather than the expected strong beats.',
                    },
                    {
                        question: 'How much time does a quarter rest occupy in 4/4 time?',
                        choices: [
                            'No time at all',
                            'Exactly as long as a quarter note (one beat)',
                            'Half a beat',
                            'It varies depending on tempo only, not duration value',
                        ],
                        correctIndex: 1,
                        explanation: 'A rest takes up exactly the same amount of time as the equivalent note value — silence is still measured rhythm.',
                    },
                    {
                        question: 'Which genres are especially known for heavy syncopation?',
                        choices: ['Funk, jazz, and reggae', 'None — syncopation is rare in popular music', 'Only classical waltzes', 'Only solo piano music'],
                        correctIndex: 0,
                        explanation: 'Funk, jazz, and reggae rhythm sections rely heavily on off-beat emphasis for their characteristic groove.',
                    },
                    {
                        question: 'What mainly separates a "flat" mechanical rhythm from a "groovy" one?',
                        choices: [
                            'Playing louder overall',
                            'Thoughtful use of rests, short notes, and off-beat accents',
                            'Using only whole notes',
                            'Avoiding syncopation entirely',
                        ],
                        correctIndex: 1,
                        explanation: 'Deliberate placement of silence and accents against the beat is what creates a sense of groove.',
                    },
                ],
            },
        ],
    },
    {
        id: 'reading-music',
        title: 'Reading Music',
        description: 'Connect the staff to actual pitches, and carry that note-naming skill onto the fretboard.',
        lessons: [
            {
                id: 'staff-clefs',
                title: 'The Staff, Clefs, and Ledger Lines',
                summary: 'Five lines, four spaces, and the mnemonics that name them.',
                content: [
                    'A musical staff has five lines and four spaces, each representing a specific pitch. Which pitch depends on the clef placed at the start — the treble clef (used for higher voices/instruments) and bass clef (used for lower ones) assign completely different notes to the same five lines.',
                    'In treble clef, the lines from bottom to top spell E-G-B-D-F (mnemonic: "Every Good Boy Does Fine"), and the spaces spell F-A-C-E. In bass clef, the lines spell G-B-D-F-A ("Good Boys Do Fine Always"), and the spaces spell A-C-E-G ("All Cows Eat Grass").',
                    'Notes that go above or below the staff use ledger lines — short extra lines drawn just for that note. Middle C is the classic example: it sits one ledger line below the treble staff and one ledger line above the bass staff, which is exactly why it\'s the pitch where the two clefs meet.',
                ],
                practice: { category: 'notes', difficulty: 'easy', label: 'Notes on Staff · Easy' },
                quiz: [
                    {
                        question: 'How many lines and spaces does a musical staff have?',
                        choices: ['4 lines, 5 spaces', '5 lines, 4 spaces', '6 lines, 5 spaces', '5 lines, 5 spaces'],
                        correctIndex: 1,
                        explanation: 'A standard staff has 5 lines and 4 spaces between them.',
                    },
                    {
                        question: 'What do the treble clef\'s lines (bottom to top) spell, by mnemonic?',
                        choices: ['F-A-C-E', 'Every Good Boy Does Fine (E-G-B-D-F)', 'All Cows Eat Grass', 'Good Boys Do Fine Always'],
                        correctIndex: 1,
                        explanation: 'Treble clef lines bottom-to-top are E-G-B-D-F, remembered as "Every Good Boy Does Fine."',
                    },
                    {
                        question: 'What are ledger lines for?',
                        choices: [
                            'Decorating the staff',
                            'Extending the staff to notate pitches above or below its normal range',
                            'Indicating tempo',
                            'Marking the key signature',
                        ],
                        correctIndex: 1,
                        explanation: 'Ledger lines are short extra lines that extend the staff for notes too high or low to fit on the regular five lines.',
                    },
                    {
                        question: 'Where does middle C sit relative to the treble and bass staves?',
                        choices: [
                            'In the middle of the treble staff',
                            'One ledger line below the treble staff / one ledger line above the bass staff',
                            'It cannot be notated in either clef',
                            'On the top line of the bass staff',
                        ],
                        correctIndex: 1,
                        explanation: 'Middle C sits exactly at the meeting point of the two clefs — one ledger line below treble, one above bass.',
                    },
                ],
            },
            {
                id: 'staff-note-names',
                title: 'Note Names Across the Staff',
                summary: 'Building speed at reading notes, including in different key signatures.',
                content: [
                    'Reading fluently means recognizing a note\'s letter name on sight, without counting lines from a reference point every time. That comes from repetition — drilling random notes across the full range of a clef until the position-to-letter mapping becomes automatic.',
                    'A key signature changes how a letter is spelled, not where it sits on the staff. An F on the staff is still the same line or space in any key — but in a key with F♯ in its signature, that same position is read and played as F♯, not plain F.',
                    'Ledger-line notes are usually the slowest to read fluently, simply because they appear less often. Deliberately practicing notes just above and below the staff (not only the comfortable in-staff ones) closes that gap fastest.',
                ],
                practice: { category: 'notes', difficulty: 'hard', label: 'Notes on Staff · Hard' },
                quiz: [
                    {
                        question: 'What does a key signature change about a note\'s position on the staff?',
                        choices: [
                            'Its line or space position',
                            'Nothing about position — it changes how that position is spelled/played (e.g. F vs F♯)',
                            'It removes the note from the staff entirely',
                            'It only affects ledger-line notes',
                        ],
                        correctIndex: 1,
                        explanation: 'A key signature applies an accidental to every instance of a given line/space, without moving its position.',
                    },
                    {
                        question: 'Why are ledger-line notes typically the slowest to read fluently?',
                        choices: [
                            'They are mathematically harder to calculate',
                            'They appear less often, so there\'s less practice repetition by default',
                            'They don\'t have letter names',
                            'They are only used in bass clef',
                        ],
                        correctIndex: 1,
                        explanation: 'Less frequent exposure means less automatic recognition — deliberate extra practice closes that gap.',
                    },
                    {
                        question: 'What is the most effective way to build fluent sight-reading speed?',
                        choices: [
                            'Memorizing one song',
                            'Repeated drilling on random notes across the full range of a clef',
                            'Avoiding ledger lines',
                            'Only practicing in C major',
                        ],
                        correctIndex: 1,
                        explanation: 'Broad, repeated drilling builds the instant position-to-letter recognition that fluent reading requires.',
                    },
                    {
                        question: 'If a key signature has an F♯, how is a note on the F line read?',
                        choices: ['As F♯', 'As plain F', 'As F♭', 'It is skipped entirely'],
                        correctIndex: 0,
                        explanation: 'Every F in that key is automatically read and played as F♯ because of the key signature, regardless of octave.',
                    },
                ],
            },
            {
                id: 'fretboard-notes',
                title: 'Finding Notes on the Fretboard',
                summary: 'Standard tuning, frets as semitones, and the 12th-fret octave.',
                content: [
                    'Standard guitar tuning, low string to high, is E-A-D-G-B-E. Standard 4-string bass tuning is E-A-D-G — the same as a guitar\'s four lowest strings, just an octave lower.',
                    'Every fret raises the pitch by exactly one semitone, the same unit you learned with intervals. That means the note-naming skills from reading and ear training carry over directly: counting frets is just counting semitones up from the open string\'s name.',
                    'The 12th fret is always the same note as the open string, one octave higher — a direct result of an octave being 12 semitones. That makes the 12th fret a reliable anchor point: once you know the open strings, you already know the entire 12th-fret row too.',
                ],
                practice: { category: 'guitar', difficulty: 'medium', label: 'Guitar Fretboard · Medium' },
                quiz: [
                    {
                        question: 'What is standard guitar tuning, from the lowest to highest string?',
                        choices: ['E-A-D-G-B-E', 'E-A-D-G-C-F', 'D-A-D-G-B-E', 'E-B-G-D-A-E'],
                        correctIndex: 0,
                        explanation: 'Standard tuning low to high is E-A-D-G-B-E.',
                    },
                    {
                        question: 'How much does each fret raise the pitch?',
                        choices: ['A whole step', 'A semitone (half step)', 'A major 3rd', 'It varies by string'],
                        correctIndex: 1,
                        explanation: 'Each fret is exactly one semitone higher than the previous one, on any string.',
                    },
                    {
                        question: 'What note do you get at the 12th fret of any string?',
                        choices: [
                            'A random note depending on the string',
                            'The same note as the open string, one octave higher',
                            'Always an E',
                            'The note a perfect 5th above the open string',
                        ],
                        correctIndex: 1,
                        explanation: '12 frets = 12 semitones = exactly one octave, so the 12th fret always matches the open string\'s name.',
                    },
                    {
                        question: 'Standard 4-string bass tuning matches which four guitar strings?',
                        choices: [
                            'The four highest guitar strings',
                            'The four lowest guitar strings (an octave lower)',
                            'It has no relationship to guitar tuning',
                            'All six guitar strings',
                        ],
                        correctIndex: 1,
                        explanation: 'Bass E-A-D-G matches a guitar\'s four lowest strings, just pitched an octave below.',
                    },
                ],
            },
        ],
    },
];

export const ALL_LESSONS: Lesson[] = CURRICULUM.flatMap((unit) => unit.lessons);

export function getLessonById(lessonId: string): Lesson | undefined {
    return ALL_LESSONS.find((lesson) => lesson.id === lessonId);
}

export function getUnitForLesson(lessonId: string): Unit | undefined {
    return CURRICULUM.find((unit) => unit.lessons.some((lesson) => lesson.id === lessonId));
}

// The curriculum is strictly linear: a lesson unlocks once the lesson immediately
// before it (across the whole flattened sequence, not just within its unit) is
// completed. The very first lesson is always unlocked.
export function isLessonUnlocked(lessonId: string, completedLessonIds: ReadonlySet<string>): boolean {
    const index = ALL_LESSONS.findIndex((lesson) => lesson.id === lessonId);
    if (index <= 0) return true;
    return completedLessonIds.has(ALL_LESSONS[index - 1].id);
}

export function nextIncompleteLesson(completedLessonIds: ReadonlySet<string>): Lesson | null {
    return ALL_LESSONS.find((lesson) => !completedLessonIds.has(lesson.id)) ?? null;
}
