'use client';

import { emitActivityEvent } from '@/app/utils/activityBus';

export interface LessonRecord {
    completed: boolean;
    quizBestScore: number; // 0-1
    completedAt: number | null; // epoch ms
}

export type CurriculumStore = Record<string, LessonRecord>;

const STORAGE_KEY = 'music-theory-cheatsheet-curriculum';

function normalizeRecord(record: Partial<LessonRecord> | undefined): LessonRecord {
    return {
        completed: record?.completed ?? false,
        quizBestScore: record?.quizBestScore ?? 0,
        completedAt: record?.completedAt ?? null,
    };
}

export function loadCurriculum(): CurriculumStore {
    if (typeof window === 'undefined') return {};
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    try {
        const parsed = JSON.parse(saved) as Record<string, Partial<LessonRecord>>;
        const normalized: CurriculumStore = {};
        for (const [lessonId, record] of Object.entries(parsed)) {
            normalized[lessonId] = normalizeRecord(record);
        }
        return normalized;
    } catch {
        return {};
    }
}

type CurriculumListener = (curriculum: CurriculumStore) => void;
const listeners = new Set<CurriculumListener>();

export function saveCurriculum(curriculum: CurriculumStore): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(curriculum));
    listeners.forEach((listener) => listener(curriculum));
}

// Lets the cloud-sync layer (AuthContext) push local changes to Supabase
// without curriculumStore needing to know anything about auth/Supabase itself.
export function subscribeToCurriculumChanges(listener: CurriculumListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

// Reconciles a freshly-pulled cloud copy with what's already on this device,
// per lesson, keeping whichever side finished more recently - so switching
// devices never silently erases completed lessons.
export function mergeCurriculum(local: CurriculumStore, cloud: CurriculumStore): CurriculumStore {
    const merged: CurriculumStore = { ...local };
    for (const [lessonId, cloudRecord] of Object.entries(cloud)) {
        const localRecord = merged[lessonId];
        if (!localRecord || (cloudRecord.completedAt ?? 0) > (localRecord.completedAt ?? 0)) {
            merged[lessonId] = normalizeRecord(cloudRecord);
        }
    }
    return merged;
}

export interface MarkLessonCompleteResult {
    isNewCompletion: boolean;
    isNewPerfect: boolean;
}

export function markLessonComplete(lessonId: string, quizScore: number): MarkLessonCompleteResult {
    const store = loadCurriculum();
    const existing = store[lessonId];
    const isNewCompletion = !existing?.completed;
    const isNewPerfect = quizScore >= 1 && (existing?.quizBestScore ?? 0) < 1;
    store[lessonId] = {
        completed: true,
        quizBestScore: Math.max(existing?.quizBestScore ?? 0, quizScore),
        completedAt: Date.now(),
    };
    saveCurriculum(store);
    if (isNewCompletion) {
        emitActivityEvent({ type: 'lesson_complete', data: { lessonId, quizScore } });
    }
    return { isNewCompletion, isNewPerfect };
}

export function completedLessonIds(store: CurriculumStore): Set<string> {
    return new Set(Object.entries(store).filter(([, record]) => record.completed).map(([lessonId]) => lessonId));
}
