import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const STATS: { value: string; label: string }[] = [
    { value: '8', label: 'Practice tools, one app' },
    { value: '2', label: 'File formats Play Along reads — MIDI & Guitar Pro' },
    { value: '0', label: 'Signups needed to start practicing' },
];

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
        title: 'See the scale before you play a note.',
        description:
            'Pick a root, a mode, a tuning. The fretboard lights up across as many strings and frets as your instrument has — guitar, bass, anything in between.',
        image: '/screenshots/fretboard.png',
        imageAlt: 'Fretboard Navigator showing a C Ionian scale pattern across a 4-string bass',
    },
    {
        eyebrow: 'Ear Training',
        title: "Train the part theory can't teach.",
        description:
            'Intervals, chords, scales, rhythm, key signatures, even fretboard recognition — drilled against a real synth engine, not a folder of static audio clips.',
        image: '/screenshots/ear-training.png',
        imageAlt: 'Ear training drill categories, difficulty controls, and a practice session',
        reverse: true,
    },
    {
        eyebrow: 'Progress & Achievements',
        title: 'Practice that keeps score.',
        description:
            'XP, levels, and achievements track every session automatically. Share a progress card with one tap, or just watch the level counter move.',
        image: '/screenshots/gamification.png',
        imageAlt: 'Level, XP bar, and achievements panel',
    },
];

export default function LandingPage() {
    return (
        <div className="theme-bg">
            <section className="max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-20 md:pb-28">
                <div className="grid md:grid-cols-2 gap-12 md:gap-8 items-center">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest theme-secondary-text mb-6">
                            Fretboard · Ear training · Notation · Curriculum
                        </p>
                        <h1 className="text-5xl md:text-7xl font-bold theme-text tracking-tight leading-[1.05] mb-6">
                            Music theory
                            <br />
                            you can{' '}
                            <span className="inline-block theme-accent-bg px-2">actually play.</span>
                        </h1>
                        <p className="text-lg theme-secondary-text max-w-lg mb-10">
                            An interactive fretboard, ear trainer, and play-along tool for guitar and bass —
                            built so the theory sticks because your hands learned it, not because you
                            memorized a chart.
                        </p>
                        <div className="flex flex-wrap items-center gap-6">
                            <Link
                                href="/app"
                                className="inline-flex items-center gap-2 px-6 py-3 theme-btn rounded-md font-semibold hover:opacity-90"
                            >
                                Open the app <ArrowRight size={18} />
                            </Link>
                            <Link
                                href="/features"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide theme-secondary-text hover:theme-text"
                            >
                                See every feature <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>

                    <div className="relative">
                        <div
                            className="hidden md:block absolute -bottom-5 -right-5 w-full h-full theme-accent-bg"
                            aria-hidden="true"
                        />
                        <div className="relative theme-card rounded-lg shadow-2xl overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/screenshots/hero-app.png"
                                alt="The Music Theory practice app: fretboard navigator, gamification panel, and navigation"
                                className="w-full h-auto block"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="theme-secondary-bg border-y border-white/10">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {STATS.map((stat) => (
                        <div key={stat.label}>
                            <p className="text-5xl md:text-6xl font-bold theme-text tracking-tight mb-2">
                                {stat.value}
                            </p>
                            <p className="theme-secondary-text text-sm">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28 space-y-20 md:space-y-28">
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
                        <div className="theme-card rounded-lg shadow-lg overflow-hidden md:[direction:ltr]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={row.image} alt={row.imageAlt} className="w-full h-auto block" />
                        </div>
                    </div>
                ))}
            </section>

            <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest theme-secondary-text mb-4">
                            Community
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold theme-text tracking-tight mb-4">
                            Practice sticks when it&apos;s social.
                        </h2>
                        <p className="theme-secondary-text max-w-md mb-8">
                            Build a public profile, follow other musicians, and compare levels and streaks
                            on the leaderboard. Practicing alone is optional, not required.
                        </p>
                        <Link
                            href="/community"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide theme-secondary-text hover:theme-text"
                        >
                            More on community <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="theme-card rounded-lg shadow-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/screenshots/leaderboard.png"
                            alt="Leaderboard page with Global and Friends toggle"
                            className="w-full h-auto block"
                        />
                    </div>
                </div>
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
