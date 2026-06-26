'use client';

import { emitActivityEvent } from '@/app/utils/activityBus';

// XP, levels, and achievements, layered on top of progressStore/curriculumStore.
// Callers (EarTraining.tsx, Curriculum.tsx) don't hold gamification in React
// state themselves - they just call applyXpAndAchievements() as a fire-and-
// forget side effect, the same way curriculumStore's markLessonComplete()
// works. GamificationPanel.tsx is the sole reader, via the pub/sub listeners.

export interface GamificationStore {
    xp: number;
    achievements: Record<string, number>; // achievement id -> unlockedAt epoch ms
}

const STORAGE_KEY = 'music-theory-cheatsheet-gamification';

// Exported so profileStore.ts can normalize a gamification row fetched
// directly from Supabase (for viewing someone else's level/achievements)
// without duplicating the defaulting logic.
export function normalizeStore(data: Partial<GamificationStore> | undefined): GamificationStore {
    return {
        xp: data?.xp ?? 0,
        achievements: data?.achievements ?? {},
    };
}

export function loadGamification(): GamificationStore {
    if (typeof window === 'undefined') return normalizeStore(undefined);
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return normalizeStore(undefined);
    try {
        return normalizeStore(JSON.parse(saved) as Partial<GamificationStore>);
    } catch {
        return normalizeStore(undefined);
    }
}

type GamificationListener = (store: GamificationStore) => void;
const listeners = new Set<GamificationListener>();

export function saveGamification(store: GamificationStore): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    listeners.forEach((listener) => listener(store));
}

export function subscribeToGamificationChanges(listener: GamificationListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

// XP only ever grows, and achievements only ever get unlocked - so merging
// just means taking the higher XP total and the union of achievements
// (earliest unlock time wins, for whichever device got there first).
export function mergeGamification(local: GamificationStore, cloud: GamificationStore): GamificationStore {
    const achievements = { ...local.achievements };
    for (const [id, unlockedAt] of Object.entries(cloud.achievements)) {
        if (!achievements[id] || unlockedAt < achievements[id]) achievements[id] = unlockedAt;
    }
    return { xp: Math.max(local.xp, cloud.xp), achievements };
}

function addXp(store: GamificationStore, amount: number): GamificationStore {
    return amount > 0 ? { ...store, xp: store.xp + amount } : store;
}

function unlockAchievements(store: GamificationStore, ids: string[]): { store: GamificationStore; newIds: string[] } {
    const newIds = ids.filter((id) => !store.achievements[id]);
    if (newIds.length === 0) return { store, newIds };
    const now = Date.now();
    const achievements = { ...store.achievements };
    for (const id of newIds) achievements[id] = now;
    return { store: { ...store, achievements }, newIds };
}

// Cumulative XP needed to *reach* a level follows a triangular curve: level 1
// is free, and each subsequent level costs 50 more XP than the last step did
// (level 2 at 100 total, level 3 at 300, level 4 at 600, level 5 at 1000...).
function cumulativeXpForLevel(level: number): number {
    return 50 * level * (level - 1);
}

export function levelFromXp(xp: number): number {
    return Math.max(1, Math.floor((1 + Math.sqrt(1 + (4 * xp) / 50)) / 2));
}

export interface LevelProgress {
    level: number;
    xpIntoLevel: number;
    xpForNextLevel: number;
}

export function levelProgress(xp: number): LevelProgress {
    const level = levelFromXp(xp);
    const levelStart = cumulativeXpForLevel(level);
    return {
        level,
        xpIntoLevel: xp - levelStart,
        xpForNextLevel: cumulativeXpForLevel(level + 1) - levelStart,
    };
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
}

export const ACHIEVEMENTS: Achievement[] = [
    { id: 'first_steps', title: 'First Steps', description: 'Answer your first ear-training question correctly.' },
    { id: 'ten_correct', title: 'Getting the Hang of It', description: 'Answer 10 questions correctly.' },
    { id: 'fifty_correct', title: 'Sharpening Up', description: 'Answer 50 questions correctly.' },
    { id: 'hundred_correct', title: 'Century Club', description: 'Answer 100 questions correctly.' },
    { id: 'streak_3', title: 'Building a Habit', description: 'Get a 3-answer streak in one category.' },
    { id: 'streak_7', title: 'One Week Strong', description: 'Get a 7-answer streak in one category.' },
    { id: 'streak_30', title: 'Dedicated', description: 'Get a 30-answer streak in one category.' },
    { id: 'sharp_ear', title: 'Sharp Ear', description: 'Reach 90% accuracy in a category (15+ attempts).' },
    { id: 'session_finisher', title: 'Session Finisher', description: 'Complete a practice session.' },
    { id: 'marathon', title: 'Marathon', description: 'Complete a 50-question practice session.' },
    { id: 'weak_area_warrior', title: 'Weak Area Warrior', description: 'Complete a Weak Areas Review session.' },
    { id: 'lesson_complete', title: 'Lesson Learned', description: 'Complete your first curriculum lesson.' },
    { id: 'quiz_ace', title: 'Quiz Ace', description: 'Score 100% on a lesson quiz.' },
    { id: 'curriculum_unit', title: 'Unit Cleared', description: 'Complete every lesson in a curriculum unit.' },
    { id: 'curriculum_complete', title: 'Theory Graduate', description: 'Complete the entire curriculum.' },
];

export interface AchievementContext {
    totalCorrect?: number;
    bestStreak?: number;
    bestCategoryAccuracy?: { accuracy: number; attempts: number } | null;
    sessionCompleted?: { length: number; weak: boolean };
    lessonCompleted?: boolean;
    quizPerfect?: boolean;
    curriculumUnitCompleted?: boolean;
    curriculumAllCompleted?: boolean;
}

function evaluateAchievements(ctx: AchievementContext): string[] {
    const unlocked: string[] = [];
    const totalCorrect = ctx.totalCorrect ?? 0;
    if (totalCorrect >= 1) unlocked.push('first_steps');
    if (totalCorrect >= 10) unlocked.push('ten_correct');
    if (totalCorrect >= 50) unlocked.push('fifty_correct');
    if (totalCorrect >= 100) unlocked.push('hundred_correct');

    const bestStreak = ctx.bestStreak ?? 0;
    if (bestStreak >= 3) unlocked.push('streak_3');
    if (bestStreak >= 7) unlocked.push('streak_7');
    if (bestStreak >= 30) unlocked.push('streak_30');

    if (ctx.bestCategoryAccuracy && ctx.bestCategoryAccuracy.attempts >= 15 && ctx.bestCategoryAccuracy.accuracy >= 0.9) {
        unlocked.push('sharp_ear');
    }

    if (ctx.sessionCompleted) {
        unlocked.push('session_finisher');
        if (ctx.sessionCompleted.length >= 50) unlocked.push('marathon');
        if (ctx.sessionCompleted.weak) unlocked.push('weak_area_warrior');
    }

    if (ctx.lessonCompleted) unlocked.push('lesson_complete');
    if (ctx.quizPerfect) unlocked.push('quiz_ace');
    if (ctx.curriculumUnitCompleted) unlocked.push('curriculum_unit');
    if (ctx.curriculumAllCompleted) unlocked.push('curriculum_complete');

    return unlocked;
}

export const XP_CORRECT_ANSWER = 5;
export const XP_SESSION_COMPLETE = 20;
export const XP_SESSION_COMPLETE_MARATHON = 40;
export const XP_WEAK_REVIEW_BONUS = 15;
export const XP_LESSON_COMPLETE = 25;
export const XP_QUIZ_PERFECT_BONUS = 15;

// The one entry point callers reach for: load the current store, add XP,
// unlock whatever the given context newly qualifies for, and persist -
// mirroring curriculumStore's markLessonComplete() load/mutate/save shape.
export function applyXpAndAchievements(xpAmount: number, ctx: AchievementContext): void {
    const current = loadGamification();
    const withXp = addXp(current, xpAmount);
    const { store: next, newIds } = unlockAchievements(withXp, evaluateAchievements(ctx));
    saveGamification(next);

    if (levelFromXp(next.xp) > levelFromXp(current.xp)) {
        emitActivityEvent({ type: 'level_up', data: { level: levelFromXp(next.xp) } });
    }
    for (const id of newIds) {
        const achievement = ACHIEVEMENTS.find((a) => a.id === id);
        emitActivityEvent({ type: 'achievement_unlocked', data: { achievementId: id, title: achievement?.title ?? id } });
    }
}
