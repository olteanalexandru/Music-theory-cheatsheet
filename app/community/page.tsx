import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ScrollHint from '@/app/components/ScrollHint';

const PILLARS: { index: string; title: string; description: string }[] = [
    {
        index: '01',
        title: 'Public profiles',
        description:
            "A username, a bio, your level and achievements. Keep it public for the leaderboard, or private if you'd rather practice without an audience.",
    },
    {
        index: '02',
        title: 'Follow other musicians',
        description:
            'Follow players whose progress you want to track. Their rank, streaks, and level show up wherever yours does — starting with your friends leaderboard.',
    },
    {
        index: '03',
        title: 'Share progress cards',
        description:
            "One tap turns your level, XP, and recent achievements into an image — share it, don't just talk about it.",
    },
];

export default function CommunityPage() {
    return (
        <div className="theme-bg">
            <section className="max-w-5xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-16 md:pb-20">
                <p className="text-xs font-semibold uppercase tracking-widest theme-secondary-text mb-6">
                    Community
                </p>
                <h1 className="text-4xl md:text-6xl font-bold theme-text tracking-tight leading-[1.05] mb-6 max-w-3xl">
                    Practicing alone is optional, not required.
                </h1>
                <p className="text-lg theme-secondary-text max-w-xl mb-10">
                    Build a public profile, follow other musicians, and see where you land on the
                    leaderboard. It all runs on the same XP and achievements your practice already
                    earns — no separate point system to game.
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
            </section>

            <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
                <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest theme-secondary-text mb-4">
                            Leaderboard
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold theme-text tracking-tight mb-4">
                            Global, or just the people you follow.
                        </h2>
                        <p className="theme-secondary-text max-w-md">
                            Toggle between everyone with a public profile and the musicians you
                            follow. Ranked by level and XP, pulled straight from real practice — no
                            leaderboard padding.
                        </p>
                    </div>
                    <ScrollHint className="theme-card rounded-lg shadow-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/screenshots/leaderboard.png"
                            alt="Leaderboard page with Global and Friends toggle"
                            className="min-w-[640px] w-full h-auto block"
                        />
                    </ScrollHint>
                </div>
            </section>

            <section className="theme-secondary-bg border-y border-white/10">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
                    {PILLARS.map((pillar) => (
                        <div key={pillar.title}>
                            <p className="text-sm font-bold theme-secondary-text tracking-tight mb-4">
                                {pillar.index}
                            </p>
                            <h3 className="text-xl font-bold theme-text tracking-tight mb-3">{pillar.title}</h3>
                            <p className="theme-secondary-text text-sm max-w-sm">{pillar.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-4 md:px-8 py-20 md:py-28 text-center">
                <h2 className="text-4xl md:text-5xl font-bold theme-text tracking-tight mb-8">
                    Find out where you rank.
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-6">
                    <Link
                        href="/leaderboard"
                        className="inline-flex items-center gap-2 px-7 py-3.5 theme-btn rounded-md font-semibold text-lg hover:opacity-90"
                    >
                        View the leaderboard <ArrowRight size={20} />
                    </Link>
                    <Link
                        href="/app"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide theme-secondary-text hover:theme-text"
                    >
                        Open the app <ArrowRight size={14} />
                    </Link>
                </div>
            </section>
        </div>
    );
}
