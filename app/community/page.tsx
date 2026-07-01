'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ScrollHint from '@/app/components/ScrollHint';
import { useTranslations, useLocale } from '@/app/utils/i18n/LocaleContext';

export default function CommunityPage() {
    const t = useTranslations('marketing');
    const { locale } = useLocale();

    const PILLARS: { index: string; title: string; description: string }[] = [
        { index: '01', title: t.community.pillars.profiles.title, description: t.community.pillars.profiles.description },
        { index: '02', title: t.community.pillars.follow.title, description: t.community.pillars.follow.description },
        { index: '03', title: t.community.pillars.share.title, description: t.community.pillars.share.description },
    ];

    return (
        <div className="theme-bg">
            <section className="max-w-5xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-16 md:pb-20">
                <p className="text-xs font-semibold uppercase tracking-widest theme-secondary-text mb-6">
                    {t.community.eyebrow}
                </p>
                <h1 className="text-4xl md:text-6xl font-bold theme-text tracking-tight leading-[1.05] mb-6 max-w-3xl">
                    {t.community.title}
                </h1>
                <p className="text-lg theme-secondary-text max-w-xl mb-10">
                    {t.community.subtitle}
                </p>
                <div className="flex flex-wrap items-center gap-6">
                    <Link
                        href="/app"
                        className="inline-flex items-center gap-2 px-6 py-3 theme-btn rounded-md font-semibold hover:opacity-90"
                    >
                        {t.community.openApp} <ArrowRight size={18} />
                    </Link>
                    <Link
                        href="/features"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide theme-secondary-text hover:theme-text"
                    >
                        {t.community.seeEveryFeature} <ArrowRight size={14} />
                    </Link>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
                <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest theme-secondary-text mb-4">
                            {t.community.leaderboardEyebrow}
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold theme-text tracking-tight mb-4">
                            {t.community.leaderboardTitle}
                        </h2>
                        <p className="theme-secondary-text max-w-md">
                            {t.community.leaderboardDescription}
                        </p>
                    </div>
                    <ScrollHint className="theme-card rounded-lg shadow-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={locale === 'ro' ? '/screenshots/leaderboard-ro.png' : '/screenshots/leaderboard.png'}
                            alt={t.community.leaderboardImageAlt}
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
                    {t.community.ctaTitle}
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-6">
                    <Link
                        href="/leaderboard"
                        className="inline-flex items-center gap-2 px-7 py-3.5 theme-btn rounded-md font-semibold text-lg hover:opacity-90"
                    >
                        {t.community.viewLeaderboard} <ArrowRight size={20} />
                    </Link>
                    <Link
                        href="/app"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide theme-secondary-text hover:theme-text"
                    >
                        {t.community.openApp2} <ArrowRight size={14} />
                    </Link>
                </div>
            </section>
        </div>
    );
}
