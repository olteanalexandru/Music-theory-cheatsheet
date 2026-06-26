'use client';

// Item-level spaced repetition (Leitner-box) tracking, layered on top of the
// per-category stats in progressStore.ts. Each "item" is the specific concept
// a question tested — e.g. category 'intervals' + answer 'Major Third' — so
// weak concepts (not just weak categories) can surface for review.

export interface ReviewItemStats {
    box: number; // 1 (just missed) .. MAX_BOX (mastered)
    correct: number;
    incorrect: number;
    dueAt: number; // epoch ms
    lastSeen: number; // epoch ms
}

export type ReviewStore = Record<string, ReviewItemStats>;

const STORAGE_KEY = 'music-theory-cheatsheet-review';
const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];
const MAX_BOX = BOX_INTERVAL_DAYS.length;
const DAY_MS = 24 * 60 * 60 * 1000;

function normalizeStats(stats: Partial<ReviewItemStats> | undefined): ReviewItemStats {
    return {
        box: stats?.box ?? 1,
        correct: stats?.correct ?? 0,
        incorrect: stats?.incorrect ?? 0,
        dueAt: stats?.dueAt ?? 0,
        lastSeen: stats?.lastSeen ?? 0,
    };
}

export function loadReview(): ReviewStore {
    if (typeof window === 'undefined') return {};
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    try {
        const parsed = JSON.parse(saved) as Record<string, Partial<ReviewItemStats>>;
        const normalized: ReviewStore = {};
        for (const [key, stats] of Object.entries(parsed)) {
            normalized[key] = normalizeStats(stats);
        }
        return normalized;
    } catch {
        return {};
    }
}

type ReviewListener = (review: ReviewStore) => void;
const listeners = new Set<ReviewListener>();

export function saveReview(review: ReviewStore): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(review));
    listeners.forEach((listener) => listener(review));
}

export function subscribeToReviewChanges(listener: ReviewListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function mergeReview(local: ReviewStore, cloud: ReviewStore): ReviewStore {
    const merged: ReviewStore = { ...local };
    for (const [key, cloudStats] of Object.entries(cloud)) {
        const localStats = merged[key];
        if (!localStats || (cloudStats.lastSeen ?? 0) > (localStats.lastSeen ?? 0)) {
            merged[key] = normalizeStats(cloudStats);
        }
    }
    return merged;
}

export function reviewItemKey(category: string, answerKey: string): string {
    return `${category}::${answerKey}`;
}

function parseItemKey(key: string): { category: string; answerKey: string } {
    const separatorIndex = key.indexOf('::');
    return { category: key.slice(0, separatorIndex), answerKey: key.slice(separatorIndex + 2) };
}

// Pure update, mirroring how EarTraining.tsx updates progressStore stats
// inline via setState — callers persist the result themselves.
export function applyReviewResult(store: ReviewStore, category: string, answerKey: string, correct: boolean): ReviewStore {
    const key = reviewItemKey(category, answerKey);
    const existing = store[key];
    const box = correct ? Math.min((existing?.box ?? 1) + 1, MAX_BOX) : 1;
    const now = Date.now();
    return {
        ...store,
        [key]: {
            box,
            correct: (existing?.correct ?? 0) + (correct ? 1 : 0),
            incorrect: (existing?.incorrect ?? 0) + (correct ? 0 : 1),
            dueAt: now + BOX_INTERVAL_DAYS[box - 1] * DAY_MS,
            lastSeen: now,
        },
    };
}

// Higher = needs more practice: weighted toward low accuracy and overdue
// items, but never below 1 so untested items still get their fair share of
// random draws. Used both to bias question generation and to rank "weakest".
export function itemWeight(store: ReviewStore, category: string, answerKey: string, now: number): number {
    const stats = store[reviewItemKey(category, answerKey)];
    if (!stats) return 1;
    const attempts = stats.correct + stats.incorrect;
    const accuracy = attempts > 0 ? stats.correct / attempts : 1;
    const overdueDays = Math.max(0, (now - stats.dueAt) / DAY_MS);
    return 1 + (1 - accuracy) * 3 + Math.min(overdueDays, 5);
}

export interface WeakItem {
    category: string;
    answerKey: string;
    accuracy: number;
    attempts: number;
    dueAt: number;
}

export function weakestItems(store: ReviewStore, now: number, limit = 5): WeakItem[] {
    const candidates = Object.entries(store)
        .map(([key, stats]) => {
            const { category, answerKey } = parseItemKey(key);
            const attempts = stats.correct + stats.incorrect;
            return {
                category,
                answerKey,
                accuracy: attempts > 0 ? stats.correct / attempts : 1,
                attempts,
                dueAt: stats.dueAt,
            };
        })
        .filter((entry) => entry.attempts >= 2); // ignore one-off attempts, too noisy to act on

    return candidates
        .sort((a, b) => itemWeight(store, b.category, b.answerKey, now) - itemWeight(store, a.category, a.answerKey, now))
        .slice(0, limit);
}
