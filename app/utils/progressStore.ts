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
