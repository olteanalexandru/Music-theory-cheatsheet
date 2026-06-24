'use client';

export interface CategoryStats {
    correct: number;
    total: number;
}

export type ProgressStore = Record<string, CategoryStats>;

const STORAGE_KEY = 'music-theory-cheatsheet-progress';

export function loadProgress(): ProgressStore {
    if (typeof window === 'undefined') return {};
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    try {
        return JSON.parse(saved) as ProgressStore;
    } catch {
        return {};
    }
}

export function saveProgress(progress: ProgressStore): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}
