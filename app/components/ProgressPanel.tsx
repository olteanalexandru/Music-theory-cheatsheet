'use client';

import React, { useState } from 'react';
import type { ProgressStore } from '@/app/utils/progressStore';

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

const ProgressPanel: React.FC<ProgressPanelProps> = ({ progress, categories, labels, onReset }) => {
    const [expanded, setExpanded] = useState(false);

    const overall = categories.reduce(
        (acc, cat) => {
            const stats = progress[cat];
            return stats ? { correct: acc.correct + stats.correct, total: acc.total + stats.total } : acc;
        },
        { correct: 0, total: 0 }
    );

    return (
        <div className="mb-6 p-4 rounded-lg theme-secondary-bg">
            <button
                onClick={() => setExpanded((current) => !current)}
                className="w-full flex items-center justify-between gap-2 text-left"
            >
                <span className="theme-text font-semibold">
                    Overall Progress: {overall.total > 0 ? `${accuracy(overall)}% ` : '— '}
                    ({overall.correct} / {overall.total})
                </span>
                <span className="theme-secondary-text text-sm whitespace-nowrap">{expanded ? '▲ Hide' : '▼ Details'}</span>
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
                                        {stats ? `${stats.correct} / ${stats.total} (${pct}%)` : 'No attempts yet'}
                                    </span>
                                </div>
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
                        Reset Progress
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProgressPanel;
