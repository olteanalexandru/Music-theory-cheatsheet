import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ScrollHint from '@/app/components/ScrollHint';

const FEATURE_ROWS: {
    eyebrow: string;
    title: string;
    description: string;
    image: string;
    imageAlt: string;
    reverse?: boolean;
}[] = [
    {
        eyebrow: 'Fretboard Navigator',
        title: 'Every scale, every shape, every tuning.',
        description:
            'Pick a root and a mode and the whole fretboard lights up — scales, arpeggios, and chords, in landmark numbers or note names. Works across 4, 5, and 6-string basses and any guitar tuning you throw at it.',
        image: '/screenshots/fretboard.png',
        imageAlt: 'Fretboard Navigator showing a C Ionian scale pattern across a 4-string bass',
    },
    {
        eyebrow: 'Circle of Fifths',
        title: 'Key relationships you can click, not just memorize.',
        description:
            'See how every key connects to its neighbors. Click around the wheel to hear scale degrees and chords through the built-in synth — toggle chord mode to study harmonic relationships at a glance.',
        image: '/screenshots/circle-of-fifths.png',
        imageAlt: 'Circle of Fifths diagram with chord mode enabled',
        reverse: true,
    },
    {
        eyebrow: 'Interactive Staff',
        title: 'Standard notation that talks back.',
        description:
            'Switch between treble and bass clef, click any note on the staff to hear it, and overlay note names or solfège so reading music stops feeling like decoding.',
        image: '/screenshots/staff-notation.png',
        imageAlt: 'Interactive staff notation component with clef toggle',
    },
    {
        eyebrow: 'Rhythm',
        title: 'Counting, made audible.',
        description:
            'Note and rest durations, time signatures, and a built-in metronome — set a tempo and feel where the beat actually falls instead of just naming it on a worksheet.',
        image: '/screenshots/rhythm.png',
        imageAlt: 'Rhythm trainer showing note durations, time signatures, and metronome controls',
        reverse: true,
    },
    {
        eyebrow: 'Ear Training',
        title: "Train the part theory can't teach.",
        description:
            'Intervals, chords, scales, rhythm, key signatures, guitar fretboard recognition, even chord progressions — eight drill categories and three difficulty levels. Answer by clicking, on a MIDI keyboard, or wired in over Web MIDI.',
        image: '/screenshots/ear-training.png',
        imageAlt: 'Ear training drill categories, difficulty controls, and a practice session',
    },
    {
        eyebrow: 'Curriculum',
        title: 'A syllabus, not just a sandbox.',
        description:
            'Structured units walk from pitch and intervals through key signatures, chords, and rhythm, each ending in a quiz. Weak-area review surfaces the categories your ear-training stats say need more work.',
        image: '/screenshots/curriculum.png',
        imageAlt: 'Curriculum units list with a lesson open and quiz progress',
        reverse: true,
    },
    {
        eyebrow: 'Play Along',
        title: 'Drop in a song, get real-time feedback.',
        description:
            'Upload a MIDI or Guitar Pro file and practice against staff-and-tab notation or a scrolling note highway. Wait Mode pauses for you to play the right note, loop any section, and transpose or re-tune on the fly.',
        image: '/screenshots/play-along.png',
        imageAlt: 'Play Along file upload panel',
    },
    {
        eyebrow: 'Progress & Achievements',
        title: 'Every session adds up.',
        description:
            "XP and levels track total practice, streaks track consistency, and achievements unlock on real milestones — lessons completed, accuracy hit, not vanity badges. Share a progress card with one tap.",
        image: '/screenshots/gamification.png',
        imageAlt: 'Level, XP bar, and achievements panel',
        reverse: true,
    },
];

export default function FeaturesPage() {
    return (
        <div className="theme-bg">
            <section className="max-w-5xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-16 md:pb-20">
                <p className="text-xs font-semibold uppercase tracking-widest theme-secondary-text mb-6">
                    Features
                </p>
                <h1 className="text-4xl md:text-6xl font-bold theme-text tracking-tight leading-[1.05] mb-6 max-w-3xl">
                    One app. Every angle on music theory.
                </h1>
                <p className="text-lg theme-secondary-text max-w-xl mb-10">
                    Fretboard, ear, staff, rhythm, and a curriculum that ties them together — built
                    so you practice instead of just reading.
                </p>
                <Link
                    href="/app"
                    className="inline-flex items-center gap-2 px-6 py-3 theme-btn rounded-md font-semibold hover:opacity-90"
                >
                    Open the app <ArrowRight size={18} />
                </Link>
            </section>

            <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 space-y-20 md:space-y-28">
                {FEATURE_ROWS.map((row) => (
                    <div
                        key={row.title}
                        className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${
                            row.reverse ? 'md:[direction:rtl]' : ''
                        }`}
                    >
                        <div className="md:[direction:ltr]">
                            <p className="text-xs font-semibold uppercase tracking-widest theme-secondary-text mb-4">
                                {row.eyebrow}
                            </p>
                            <h2 className="text-3xl md:text-4xl font-bold theme-text tracking-tight mb-4">
                                {row.title}
                            </h2>
                            <p className="theme-secondary-text max-w-md">{row.description}</p>
                        </div>
                        <ScrollHint className="theme-card rounded-lg shadow-lg md:[direction:ltr]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={row.image} alt={row.imageAlt} className="min-w-[640px] w-full h-auto block" />
                        </ScrollHint>
                    </div>
                ))}
            </section>

            <section className="theme-secondary-bg border-t border-white/10">
                <div className="max-w-4xl mx-auto px-4 md:px-8 py-20 md:py-28 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold theme-text tracking-tight mb-8">
                        Pick a root note. Start playing.
                    </h2>
                    <Link
                        href="/app"
                        className="inline-flex items-center gap-2 px-7 py-3.5 theme-btn rounded-md font-semibold text-lg hover:opacity-90"
                    >
                        Open the app <ArrowRight size={20} />
                    </Link>
                </div>
            </section>
        </div>
    );
}
