import Link from 'next/link';
import { ArrowRight, BookOpen, Guitar, Headphones, Music, Sparkles, Trophy, Users } from 'lucide-react';

const FEATURES: { icon: React.ComponentType<{ size?: number }>; title: string; description: string }[] = [
    {
        icon: Guitar,
        title: 'Fretboard Navigator',
        description: 'Visualize scales, arpeggios, and chords across guitar or bass in any tuning.',
    },
    {
        icon: Music,
        title: 'Staff & Tab Notation',
        description: 'Read and play along with real notation, generated from your own Guitar Pro or MIDI files.',
    },
    {
        icon: Headphones,
        title: 'Ear Training',
        description: 'Sharpen your ear with interval, chord, scale, and rhythm recognition drills.',
    },
    {
        icon: BookOpen,
        title: 'Guided Curriculum',
        description: 'Structured lessons and quizzes that adapt to what you still need to practice.',
    },
    {
        icon: Trophy,
        title: 'XP & Achievements',
        description: 'Earn XP, level up, and unlock achievements every time you practice.',
    },
    {
        icon: Users,
        title: 'Friends & Leaderboards',
        description: 'Follow other musicians, compare streaks, and climb the leaderboard.',
    },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen theme-bg">
            <section className="max-w-5xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-20 text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full theme-muted-bg theme-secondary-text text-xs font-medium mb-6">
                    <Sparkles size={14} /> Now with Play Along, Leaderboards &amp; more
                </span>
                <h1 className="text-4xl md:text-6xl font-bold theme-text mb-6 tracking-tight">
                    Learn music theory by <span className="text-indigo-400">playing</span>, not memorizing.
                </h1>
                <p className="text-lg theme-secondary-text max-w-2xl mx-auto mb-10">
                    An interactive fretboard, ear trainer, and play-along practice tool — with real-time notation,
                    gamified progress, and a community of musicians to keep you motivated.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <Link
                        href="/app"
                        className="inline-flex items-center gap-2 px-6 py-3 theme-btn rounded-lg font-semibold hover:opacity-90"
                    >
                        Get Started Free <ArrowRight size={18} />
                    </Link>
                    <Link
                        href="/leaderboard"
                        className="inline-flex items-center gap-2 px-6 py-3 theme-muted-bg theme-text rounded-lg font-semibold hover:opacity-90"
                    >
                        See the Leaderboard
                    </Link>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-4 md:px-8 pb-20">
                <h2 className="text-2xl md:text-3xl font-bold theme-text text-center mb-10">
                    Everything you need to actually get better
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map(({ icon: Icon, title, description }) => (
                        <div key={title} className="theme-card rounded-xl p-6 shadow-lg">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg theme-accent-bg mb-4">
                                <Icon size={20} />
                            </div>
                            <h3 className="text-lg font-semibold theme-text mb-2">{title}</h3>
                            <p className="theme-secondary-text text-sm">{description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-4 md:px-8 pb-24 text-center">
                <div className="theme-card rounded-2xl p-10 shadow-lg">
                    <h2 className="text-2xl md:text-3xl font-bold theme-text mb-4">
                        Practice sticks when it&apos;s social.
                    </h2>
                    <p className="theme-secondary-text max-w-xl mx-auto mb-8">
                        Follow friends, compare streaks, and share your progress — practicing alone is optional,
                        not required.
                    </p>
                    <Link
                        href="/app"
                        className="inline-flex items-center gap-2 px-6 py-3 theme-btn rounded-lg font-semibold hover:opacity-90"
                    >
                        Start practicing <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </div>
    );
}
