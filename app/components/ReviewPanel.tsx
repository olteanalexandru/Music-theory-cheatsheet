'use client';

import React from 'react';
import { weakestItems, type ReviewStore, type WeakItem } from '@/app/utils/reviewStore';

interface ReviewPanelProps {
    review: ReviewStore;
    labels: Record<string, string>;
    onStartReview: () => void;
    disabled?: boolean;
}

function rankWeakItems(review: ReviewStore, limit: number): WeakItem[] {
    return weakestItems(review, Date.now(), limit);
}

function formatDue(dueAt: number): string {
    const now = Date.now();
    if (dueAt <= now) return 'Due now';
    const days = Math.ceil((dueAt - now) / (24 * 60 * 60 * 1000));
    return days <= 1 ? 'Due tomorrow' : `Due in ${days}d`;
}

const ReviewPanel: React.FC<ReviewPanelProps> = ({ review, labels, onStartReview, disabled }) => {
    const weak = rankWeakItems(review, 5);

    if (weak.length === 0) return null;

    return (
        <div className="mb-6 p-4 rounded-lg theme-secondary-bg">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <p className="theme-text font-semibold">Weak Areas</p>
                <button
                    onClick={onStartReview}
                    disabled={disabled}
                    className="px-3 py-1.5 theme-accent-bg rounded-lg text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Review Weak Areas
                </button>
            </div>
            <ul className="space-y-1.5">
                {weak.map((item) => (
                    <li key={`${item.category}::${item.answerKey}`} className="flex items-center justify-between gap-2 text-sm">
                        <span className="theme-secondary-text truncate">
                            {labels[item.category] ?? item.category}: <span className="theme-text">{item.answerKey}</span>
                        </span>
                        <span className="theme-secondary-text whitespace-nowrap text-xs">
                            {Math.round(item.accuracy * 100)}% · {formatDue(item.dueAt)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ReviewPanel;
