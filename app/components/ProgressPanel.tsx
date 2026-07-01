'use client';

import React, { useState } from 'react';
import type { ProgressStore } from '@/app/utils/progressStore';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';
import type { SocialDict } from '@/app/utils/i18n/dictionaries/social';

interface ProgressPanelProps {
    progress: ProgressStore;
    categories: string[];
    labels: Record<string, string>;
    onReset: () => void;
}

function accuracy(stats: { correct: number; total: number } | undefined): number {
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.correct / stats.total) * 100);
}

function formatLastPracticed(timestamp: number | null, t: SocialDict['progress']): string {
    if (!timestamp) return t.never;
    const diffMs = Date.now() - timestamp;
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (diffMs < minute) return t.justNow;
    if (diffMs < hour) return t.minutesAgo(Math.floor(diffMs / minute));
    if (diffMs < day) return t.hoursAgo(Math.floor(diffMs / hour));
    if (diffMs < 7 * day) return t.daysAgo(Math.floor(diffMs / day));
    return new Date(timestamp).toLocaleDateString();
}

const ProgressPanel: React.FC<ProgressPanelProps> = ({ progress, categories, labels, onReset }) => {
    const t = useTranslations('social');
    const [expanded, setExpanded] = useState(false);

    const overall = categories.reduce(
        (acc, cat) => {
            const stats = progress[cat];
            return stats
                ? {
                      correct: acc.correct + stats.correct,
                      total: acc.total + stats.total,
                      bestStreak: Math.max(acc.bestStreak, stats.bestStreak),
                  }
                : acc;
        },
        { correct: 0, total: 0, bestStreak: 0 }
    );

    return (
        <div className="mb-6 p-4 rounded-lg theme-secondary-bg">
            <button
                onClick={() => setExpanded((current) => !current)}
                className="w-full flex items-center justify-between gap-2 text-left"
            >
                <span className="theme-text font-semibold">
                    {t.progress.overallProgress}: {overall.total > 0 ? `${accuracy(overall)}% ` : `${t.progress.overallProgressNoAttempts} `}
                    ({overall.correct} / {overall.total})
                    {overall.bestStreak > 0 && t.progress.bestStreakSuffix(overall.bestStreak)}
                </span>
                <span className="theme-secondary-text text-sm whitespace-nowrap">{expanded ? t.progress.hideDetails : t.progress.showDetails}</span>
            </button>

            {expanded && (
                <div className="mt-4 space-y-3">
                    {categories.map((cat) => {
                        const stats = progress[cat];
                        const pct = accuracy(stats);
                        return (
                            <div key={cat}>
                                <div className="flex items-center justify-between gap-2 text-sm mb-1">
                                    <span className="theme-secondary-text">{labels[cat] ?? cat}</span>
                                    <span className="theme-secondary-text whitespace-nowrap">
                                        {stats ? `${stats.correct} / ${stats.total} (${pct}%)` : t.progress.noAttemptsYet}
                                    </span>
                                </div>
                                {stats && (
                                    <div className="flex items-center justify-between gap-2 text-xs theme-secondary-text opacity-80 mb-1">
                                        <span>
                                            {t.progress.streak}: {stats.currentStreak}
                                            {stats.bestStreak > 0 ? t.progress.bestSuffix(stats.bestStreak) : ''}
                                        </span>
                                        <span>{t.progress.lastPracticed}: {formatLastPracticed(stats.lastPracticed, t.progress)}</span>
                                    </div>
                                )}
                                <div className="h-2 rounded-full theme-muted-bg overflow-hidden">
                                    <div className="h-full theme-accent-bg" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                    <button
                        onClick={onReset}
                        className="mt-2 px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90"
                    >
                        {t.progress.resetProgress}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProgressPanel;
