'use client';

export interface CategoryStats {
    correct: number;
    total: number;
    currentStreak: number;
    bestStreak: number;
    lastPracticed: number | null; // epoch ms
}

export type ProgressStore = Record<string, CategoryStats>;

const STORAGE_KEY = 'music-theory-cheatsheet-progress';

// Fills in defaults for stats saved by older versions of the app that
// predate streak/last-practiced tracking, so old localStorage data doesn't
// produce NaN/undefined when rendered.
function normalizeStats(stats: Partial<CategoryStats> | undefined): CategoryStats {
    return {
        correct: stats?.correct ?? 0,
        total: stats?.total ?? 0,
        currentStreak: stats?.currentStreak ?? 0,
        bestStreak: stats?.bestStreak ?? 0,
        lastPracticed: stats?.lastPracticed ?? null,
    };
}

export function loadProgress(): ProgressStore {
    if (typeof window === 'undefined') return {};
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    try {
        const parsed = JSON.parse(saved) as Record<string, Partial<CategoryStats>>;
        const normalized: ProgressStore = {};
        for (const [category, stats] of Object.entries(parsed)) {
            normalized[category] = normalizeStats(stats);
        }
        return normalized;
    } catch {
        return {};
    }
}

type ProgressListener = (progress: ProgressStore) => void;
const listeners = new Set<ProgressListener>();

export function saveProgress(progress: ProgressStore): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    listeners.forEach((listener) => listener(progress));
}

// Lets the cloud-sync layer (AuthContext) push local changes to Supabase
// without progressStore needing to know anything about auth/Supabase itself.
export function subscribeToProgressChanges(listener: ProgressListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

// Reconciles a freshly-pulled cloud copy with what's already on this device,
// per category, keeping whichever side was practiced more recently - so
// switching devices never silently erases progress made on the other one.
export function mergeProgress(local: ProgressStore, cloud: ProgressStore): ProgressStore {
    const merged: ProgressStore = { ...local };
    for (const [category, cloudStats] of Object.entries(cloud)) {
        const localStats = merged[category];
        if (!localStats || (cloudStats.lastPracticed ?? 0) > (localStats.lastPracticed ?? 0)) {
            merged[category] = normalizeStats(cloudStats);
        }
    }
    return merged;
}

// Higher = this category deserves more practice: weighted toward low
// accuracy and toward categories that haven't been touched in a while, so a
// "weak areas" mixed session resurfaces both wrong answers and stale ones.
// Never-practiced categories score above average so they get a fair shot.
export function categoryWeaknessScore(stats: CategoryStats | undefined, now: number): number {
    if (!stats || stats.total === 0) return 2;
    const accuracy = stats.correct / stats.total;
    const daysSincePracticed = stats.lastPracticed ? (now - stats.lastPracticed) / (24 * 60 * 60 * 1000) : 30;
    const inaccuracyWeight = (1 - accuracy) * 3;
    const stalenessWeight = Math.min(daysSincePracticed / 3, 4);
    return 1 + inaccuracyWeight + stalenessWeight;
}

// Cross-category rollups, used to evaluate gamification achievements.
export function totalCorrectAnswers(progress: ProgressStore): number {
    return Object.values(progress).reduce((sum, stats) => sum + stats.correct, 0);
}

export function totalQuestionsAnswered(progress: ProgressStore): number {
    return Object.values(progress).reduce((sum, stats) => sum + stats.total, 0);
}

export function bestStreakAcrossCategories(progress: ProgressStore): number {
    return Object.values(progress).reduce((max, stats) => Math.max(max, stats.bestStreak), 0);
}

export function bestCategoryAccuracy(progress: ProgressStore): { accuracy: number; attempts: number } | null {
    let best: { accuracy: number; attempts: number } | null = null;
    for (const stats of Object.values(progress)) {
        if (stats.total === 0) continue;
        const accuracy = stats.correct / stats.total;
        if (!best || accuracy > best.accuracy) best = { accuracy, attempts: stats.total };
    }
    return best;
}
