'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ScrollHint from '@/app/components/ScrollHint';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';

export default function FeaturesPage() {
    const t = useTranslations('marketing');

    const FEATURE_ROWS: {
        eyebrow: string;
        title: string;
        description: string;
        image: string;
        imageAlt: string;
        reverse?: boolean;
    }[] = [
        {
            eyebrow: t.features.rows.fretboard.eyebrow,
            title: t.features.rows.fretboard.title,
            description: t.features.rows.fretboard.description,
            image: '/screenshots/fretboard.png',
            imageAlt: t.features.rows.fretboard.imageAlt,
        },
        {
            eyebrow: t.features.rows.circleOfFifths.eyebrow,
            title: t.features.rows.circleOfFifths.title,
            description: t.features.rows.circleOfFifths.description,
            image: '/screenshots/circle-of-fifths.png',
            imageAlt: t.features.rows.circleOfFifths.imageAlt,
            reverse: true,
        },
        {
            eyebrow: t.features.rows.staff.eyebrow,
            title: t.features.rows.staff.title,
            description: t.features.rows.staff.description,
            image: '/screenshots/staff-notation.png',
            imageAlt: t.features.rows.staff.imageAlt,
        },
        {
            eyebrow: t.features.rows.rhythm.eyebrow,
            title: t.features.rows.rhythm.title,
            description: t.features.rows.rhythm.description,
            image: '/screenshots/rhythm.png',
            imageAlt: t.features.rows.rhythm.imageAlt,
            reverse: true,
        },
        {
            eyebrow: t.features.rows.earTraining.eyebrow,
            title: t.features.rows.earTraining.title,
            description: t.features.rows.earTraining.description,
            image: '/screenshots/ear-training.png',
            imageAlt: t.features.rows.earTraining.imageAlt,
        },
        {
            eyebrow: t.features.rows.curriculum.eyebrow,
            title: t.features.rows.curriculum.title,
            description: t.features.rows.curriculum.description,
            image: '/screenshots/curriculum.png',
            imageAlt: t.features.rows.curriculum.imageAlt,
            reverse: true,
        },
        {
            eyebrow: t.features.rows.playAlong.eyebrow,
            title: t.features.rows.playAlong.title,
            description: t.features.rows.playAlong.description,
            image: '/screenshots/play-along.png',
            imageAlt: t.features.rows.playAlong.imageAlt,
        },
        {
            eyebrow: t.features.rows.progress.eyebrow,
            title: t.features.rows.progress.title,
            description: t.features.rows.progress.description,
            image: '/screenshots/gamification.png',
            imageAlt: t.features.rows.progress.imageAlt,
            reverse: true,
        },
    ];

    return (
        <div className="theme-bg">
            <section className="max-w-5xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-16 md:pb-20">
                <p className="text-xs font-semibold uppercase tracking-widest theme-secondary-text mb-6">
                    {t.features.eyebrow}
                </p>
                <h1 className="text-4xl md:text-6xl font-bold theme-text tracking-tight leading-[1.05] mb-6 max-w-3xl">
                    {t.features.title}
                </h1>
                <p className="text-lg theme-secondary-text max-w-xl mb-10">
                    {t.features.subtitle}
                </p>
                <Link
                    href="/app"
                    className="inline-flex items-center gap-2 px-6 py-3 theme-btn rounded-md font-semibold hover:opacity-90"
                >
                    {t.features.openApp} <ArrowRight size={18} />
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
                        {t.features.ctaTitle}
                    </h2>
                    <Link
                        href="/app"
                        className="inline-flex items-center gap-2 px-7 py-3.5 theme-btn rounded-md font-semibold text-lg hover:opacity-90"
                    >
                        {t.features.openAppLarge} <ArrowRight size={20} />
                    </Link>
                </div>
            </section>
        </div>
    );
}
