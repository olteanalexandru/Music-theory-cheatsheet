'use client';

import React, { useState } from 'react';
import {
    noteAccuracy,
    noteAverageMs,
    weakestNotes,
    type ClefMode,
    type ClefTrainerData,
} from '@/app/utils/clefTrainerStore';

interface ClefTrainerStatsProps {
    data: ClefTrainerData;
    onReset: () => void;
}

const CLEF_LABELS: Record<ClefMode, string> = {
    treble: 'Treble',
    bass: 'Bass',
    grand: 'Grand Staff',
};

// Splits a "{clef}-{letter}{accidental}{octave}" key (e.g. "bass-F♯4") back into
// a clef label and a note label for display, since the store only keeps the raw key.
function describeNoteKey(key: string): { clefLabel: string; noteLabel: string } {
    const dashIndex = key.indexOf('-');
    const clef = key.slice(0, dashIndex) as ClefMode;
    return { clefLabel: CLEF_LABELS[clef] ?? clef, noteLabel: key.slice(dashIndex + 1) };
}

function formatLastPracticed(timestamp: number | null): string {
    if (!timestamp) return 'Never';
    const diffMs = Date.now() - timestamp;
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (diffMs < minute) return 'Just now';
    if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
    if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
    if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

const ClefTrainerStats: React.FC<ClefTrainerStatsProps> = ({ data, onReset }) => {
    const [expanded, setExpanded] = useState(false);

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
                    Note Reading Stats: {totals.attempts > 0 ? `${overallAccuracy}% ` : '— '}
                    ({totals.correct} / {totals.attempts})
                </span>
                <span className="theme-secondary-text text-sm whitespace-nowrap">{expanded ? '▲ Hide' : '▼ Details'}</span>
            </button>

            {expanded && (
                <div className="mt-4 space-y-4">
                    <div>
                        <p className="theme-text font-semibold text-sm mb-2">Weakest Notes</p>
                        {weak.length === 0 ? (
                            <p className="theme-secondary-text text-sm">
                                Not enough attempts yet — practice a few notes to see your weak spots here.
                            </p>
                        ) : (
                            <ul className="space-y-1.5">
                                {weak.map(({ key, entry }) => {
                                    const { clefLabel, noteLabel } = describeNoteKey(key);
                                    return (
                                        <li key={key} className="flex items-center justify-between gap-2 text-sm">
                                            <span className="theme-secondary-text truncate">
                                                {clefLabel} clef: <span className="theme-text">{noteLabel}</span>
                                            </span>
                                            <span className="theme-secondary-text whitespace-nowrap text-xs">
                                                {Math.round(noteAccuracy(entry) * 100)}% · {Math.round(noteAverageMs(entry))}ms avg
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <div>
                        <p className="theme-text font-semibold text-sm mb-2">Best Sprint Results</p>
                        {bestSprints.length === 0 ? (
                            <p className="theme-secondary-text text-sm">No timed runs yet.</p>
                        ) : (
                            <ul className="space-y-1.5">
                                {bestSprints.map(([key, best]) => {
                                    const mode = key.slice(0, key.lastIndexOf('-')) as ClefMode;
                                    return (
                                        <li key={key} className="flex items-center justify-between gap-2 text-sm">
                                            <span className="theme-secondary-text">
                                                {CLEF_LABELS[mode] ?? mode} · {best.durationSec}s
                                            </span>
                                            <span className="theme-text whitespace-nowrap text-xs">
                                                {best.correct} / {best.total} correct
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {entries.length > 0 && (
                        <p className="theme-secondary-text text-xs opacity-80">
                            Tracking {entries.length} distinct notes · last practiced {formatLastPracticed(mostRecent)}
                        </p>
                    )}

                    <button
                        onClick={onReset}
                        className="px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90"
                    >
                        Reset Note Reading Stats
                    </button>
                </div>
            )}
        </div>
    );
};

export default ClefTrainerStats;
