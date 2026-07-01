'use client';

import React, { useState } from 'react';
import {
    noteAccuracy,
    noteAverageMs,
    weakestNotes,
    type ClefMode,
    type ClefTrainerData,
} from '@/app/utils/clefTrainerStore';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';
import type { ClefTrainerDict } from '@/app/utils/i18n/dictionaries/clefTrainer';

interface ClefTrainerStatsProps {
    data: ClefTrainerData;
    onReset: () => void;
}

// Splits a "{clef}-{letter}{accidental}{octave}" key (e.g. "bass-F♯4") back into
// a clef label and a note label for display, since the store only keeps the raw key.
function describeNoteKey(key: string, clefLabels: Record<ClefMode, string>): { clefLabel: string; noteLabel: string } {
    const dashIndex = key.indexOf('-');
    const clef = key.slice(0, dashIndex) as ClefMode;
    return { clefLabel: clefLabels[clef] ?? clef, noteLabel: key.slice(dashIndex + 1) };
}

function formatLastPracticed(timestamp: number | null, t: ClefTrainerDict['stats']): string {
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

const ClefTrainerStats: React.FC<ClefTrainerStatsProps> = ({ data, onReset }) => {
    const t = useTranslations('clefTrainer');
    const [expanded, setExpanded] = useState(false);

    const clefLabels = t.stats.clefLabels;

    const entries = Object.values(data.notes);
    const totals = entries.reduce(
        (acc, entry) => ({ attempts: acc.attempts + entry.attempts, correct: acc.correct + entry.correct }),
        { attempts: 0, correct: 0 }
    );
    const overallAccuracy = totals.attempts > 0 ? Math.round((totals.correct / totals.attempts) * 100) : 0;
    const weak = weakestNotes(data, 5);
    const bestSprints = Object.entries(data.bestSprint).sort((a, b) => b[1].correct - a[1].correct);
    const lastPracticedTimes = entries.map((e) => e.lastPracticed).filter((t): t is number => t !== null);
    const mostRecent = lastPracticedTimes.length > 0 ? Math.max(...lastPracticedTimes) : null;

    return (
        <div className="mb-6 p-4 rounded-lg theme-secondary-bg">
            <button
                onClick={() => setExpanded((current) => !current)}
                className="w-full flex items-center justify-between gap-2 text-left"
            >
                <span className="theme-text font-semibold">
                    {t.stats.noteReadingStats(totals.attempts > 0 ? `${overallAccuracy}%` : '—', totals.correct, totals.attempts)}
                </span>
                <span className="theme-secondary-text text-sm whitespace-nowrap">{expanded ? t.stats.hide : t.stats.details}</span>
            </button>

            {expanded && (
                <div className="mt-4 space-y-4">
                    <div>
                        <p className="theme-text font-semibold text-sm mb-2">{t.stats.weakestNotes}</p>
                        {weak.length === 0 ? (
                            <p className="theme-secondary-text text-sm">
                                {t.stats.notEnoughAttempts}
                            </p>
                        ) : (
                            <ul className="space-y-1.5">
                                {weak.map(({ key, entry }) => {
                                    const { clefLabel, noteLabel } = describeNoteKey(key, clefLabels);
                                    return (
                                        <li key={key} className="flex items-center justify-between gap-2 text-sm">
                                            <span className="theme-secondary-text truncate">
                                                {t.stats.clefNote(clefLabel)} <span className="theme-text">{noteLabel}</span>
                                            </span>
                                            <span className="theme-secondary-text whitespace-nowrap text-xs">
                                                {t.stats.accuracyAvgMs(Math.round(noteAccuracy(entry) * 100), Math.round(noteAverageMs(entry)))}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <div>
                        <p className="theme-text font-semibold text-sm mb-2">{t.stats.bestSprintResults}</p>
                        {bestSprints.length === 0 ? (
                            <p className="theme-secondary-text text-sm">{t.stats.noTimedRuns}</p>
                        ) : (
                            <ul className="space-y-1.5">
                                {bestSprints.map(([key, best]) => {
                                    const mode = key.slice(0, key.lastIndexOf('-')) as ClefMode;
                                    return (
                                        <li key={key} className="flex items-center justify-between gap-2 text-sm">
                                            <span className="theme-secondary-text">
                                                {t.stats.durationCorrect(clefLabels[mode] ?? mode, best.durationSec)}
                                            </span>
                                            <span className="theme-text whitespace-nowrap text-xs">
                                                {t.stats.correctOfTotal(best.correct, best.total)}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {entries.length > 0 && (
                        <p className="theme-secondary-text text-xs opacity-80">
                            {t.stats.trackingNotes(entries.length, formatLastPracticed(mostRecent, t.stats))}
                        </p>
                    )}

                    <button
                        onClick={onReset}
                        className="px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90"
                    >
                        {t.stats.resetStats}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ClefTrainerStats;
