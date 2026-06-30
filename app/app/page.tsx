'use client';

import Link from 'next/link';
import { ArrowRight, Guitar, Compass, Music, Drum, Ear, PlayCircle, BookOpen, type LucideIcon } from 'lucide-react';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';

export default function AppHubPage() {
    const t = useTranslations('tools');

    const TOOLS: { href: string; title: string; description: string; icon: LucideIcon }[] = [
        {
            href: '/app/fretboard',
            title: t.hub.fretboard.title,
            description: t.hub.fretboard.description,
            icon: Guitar,
        },
        {
            href: '/app/circle-of-fifths',
            title: t.hub.circleOfFifths.title,
            description: t.hub.circleOfFifths.description,
            icon: Compass,
        },
        {
            href: '/app/staff',
            title: t.hub.staff.title,
            description: t.hub.staff.description,
            icon: Music,
        },
        {
            href: '/app/rhythm',
            title: t.hub.rhythm.title,
            description: t.hub.rhythm.description,
            icon: Drum,
        },
        {
            href: '/app/ear-training',
            title: t.hub.earTraining.title,
            description: t.hub.earTraining.description,
            icon: Ear,
        },
        {
            href: '/app/play-along',
            title: t.hub.playAlong.title,
            description: t.hub.playAlong.description,
            icon: PlayCircle,
        },
        {
            href: '/app/curriculum',
            title: t.hub.curriculum.title,
            description: t.hub.curriculum.description,
            icon: BookOpen,
        },
    ];

    return (
        <div>
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold theme-text mb-2">{t.hub.title}</h1>
                <p className="theme-secondary-text">{t.hub.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TOOLS.map(({ href, title, description, icon: Icon }) => (
                    <Link key={href} href={href} className="group theme-card tool-card rounded-xl p-5 shadow-lg">
                        <div className="flex items-center justify-center w-11 h-11 rounded-lg theme-accent-soft-bg mb-3">
                            <Icon size={22} className="theme-secondary-text" />
                        </div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <h2 className="text-lg font-semibold theme-text">{title}</h2>
                            <ArrowRight
                                size={16}
                                className="theme-secondary-text opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                            />
                        </div>
                        <p className="text-sm theme-secondary-text">{description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
