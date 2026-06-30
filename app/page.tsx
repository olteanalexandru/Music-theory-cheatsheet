'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ScrollHint from '@/app/components/ScrollHint';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';

export default function LandingPage() {
    const t = useTranslations('marketing');

    const STATS: { value: string; label: string }[] = [
        { value: '8', label: t.home.stats.tools },
        { value: '2', label: t.home.stats.formats },
        { value: '0', label: t.home.stats.signups },
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
            eyebrow: t.home.featureRows.fretboard.eyebrow,
            title: t.home.featureRows.fretboard.title,
            description: t.home.featureRows.fretboard.description,
            image: '/screenshots/fretboard.png',
            imageAlt: t.home.featureRows.fretboard.imageAlt,
        },
        {
            eyebrow: t.home.featureRows.earTraining.eyebrow,
            title: t.home.featureRows.earTraining.title,
            description: t.home.featureRows.earTraining.description,
            image: '/screenshots/ear-training.png',
            imageAlt: t.home.featureRows.earTraining.imageAlt,
            reverse: true,
        },
        {
            eyebrow: t.home.featureRows.progress.eyebrow,
            title: t.home.featureRows.progress.title,
            description: t.home.featureRows.progress.description,
            image: '/screenshots/gamification.png',
            imageAlt: t.home.featureRows.progress.imageAlt,
        },
    ];

    return (
        <div className="theme-bg">
            <section className="max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-20 md:pb-28">
                <div className="grid md:grid-cols-2 gap-12 md:gap-8 items-center">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest theme-secondary-text mb-6">
                            {t.home.heroEyebrow}
                        </p>
                        <h1 className="text-5xl md:text-7xl font-bold theme-text tracking-tight leading-[1.05] mb-6">
                            {t.home.heroTitleLine1}
                            <br />
                            {t.home.heroTitleLine2Prefix}{' '}
                            <span className="inline-block theme-accent-bg px-2">{t.home.heroTitleHighlight}</span>
                        </h1>
                        <p className="text-lg theme-secondary-text max-w-lg mb-10">
                            {t.home.heroSubtitle}
                        </p>
                        <div className="flex flex-wrap items-center gap-6">
                            <Link
                                href="/app"
                                className="inline-flex items-center gap-2 px-6 py-3 theme-btn rounded-md font-semibold hover:opacity-90"
                            >
                                {t.home.openApp} <ArrowRight size={18} />
                            </Link>
                            <Link
                                href="/features"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide theme-secondary-text hover:theme-text"
                            >
                                {t.home.seeEveryFeature} <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>

                    <div className="relative min-w-0">
                        <div
                            className="hidden md:block absolute -bottom-5 -right-5 w-full h-full theme-accent-bg"
                            aria-hidden="true"
                        />
                        <ScrollHint className="relative theme-card rounded-lg shadow-2xl">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/screenshots/hero-app.png"
                                alt={t.home.heroImageAlt}
                                className="min-w-[640px] w-full h-auto block"
                            />
                        </ScrollHint>
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
                        <ScrollHint className="theme-card rounded-lg shadow-lg md:[direction:ltr]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={row.image} alt={row.imageAlt} className="min-w-[640px] w-full h-auto block" />
                        </ScrollHint>
                    </div>
                ))}
            </section>

            <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest theme-secondary-text mb-4">
                            {t.home.communityEyebrow}
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold theme-text tracking-tight mb-4">
                            {t.home.communityTitle}
                        </h2>
                        <p className="theme-secondary-text max-w-md mb-8">
                            {t.home.communityDescription}
                        </p>
                        <Link
                            href="/community"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide theme-secondary-text hover:theme-text"
                        >
                            {t.home.moreOnCommunity} <ArrowRight size={14} />
                        </Link>
                    </div>
                    <ScrollHint className="theme-card rounded-lg shadow-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/screenshots/leaderboard.png"
                            alt={t.home.leaderboardImageAlt}
                            className="min-w-[640px] w-full h-auto block"
                        />
                    </ScrollHint>
                </div>
            </section>

            <section className="theme-secondary-bg border-t border-white/10">
                <div className="max-w-4xl mx-auto px-4 md:px-8 py-20 md:py-28 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold theme-text tracking-tight mb-8">
                        {t.home.ctaTitle}
                    </h2>
                    <Link
                        href="/app"
                        className="inline-flex items-center gap-2 px-7 py-3.5 theme-btn rounded-md font-semibold text-lg hover:opacity-90"
                    >
                        {t.home.openApp} <ArrowRight size={20} />
                    </Link>
                </div>
            </section>
        </div>
    );
}
