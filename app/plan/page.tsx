'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Award,
    ArrowRight,
    BarChart3,
    BookOpen,
    CheckCircle2,
    Circle,
    Flame,
    Lock,
    Map as MapIcon,
    Sparkles,
    Target,
    Trophy,
} from 'lucide-react';
import { ALL_LESSONS, CURRICULUM, getUnitForLesson, isLessonUnlocked, upcomingLessons } from '@/app/utils/curriculumData';
import { completedLessonIds, loadCurriculum } from '@/app/utils/curriculumStore';
import { CATEGORIES, CATEGORY_LABELS, type Category } from '@/app/components/EarTraining';
import {
    bestStreakAcrossCategories,
    categoryWeaknessScore,
    loadProgress,
    totalCorrectAnswers,
    totalQuestionsAnswered,
} from '@/app/utils/progressStore';
import { closestAchievements, levelProgress, loadGamification } from '@/app/utils/gamificationStore';
import type { EarTrainingDifficulty } from '@/app/utils/earTrainingData';

export default function PlanPage() {
    const [curriculumStore] = useState(() => loadCurriculum());
    const [progress] = useState(() => loadProgress());
    const [gamification] = useState(() => loadGamification());

    const completed = useMemo(() => completedLessonIds(curriculumStore), [curriculumStore]);
    const totalLessons = ALL_LESSONS.length;
    const completedCount = completed.size;

    const upcoming = useMemo(() => upcomingLessons(completed, 3), [completed]);
    const upNext = upcoming[0] ?? null;
    const laterLessons = upcoming.slice(1);
    const upNextUnit = upNext ? getUnitForLesson(upNext.id) : undefined;

    const totalCorrect = useMemo(() => totalCorrectAnswers(progress), [progress]);
    const totalAnswered = useMemo(() => totalQuestionsAnswered(progress), [progress]);
    const bestStreak = useMemo(() => bestStreakAcrossCategories(progress), [progress]);
    const overallAccuracy = totalAnswered > 0 ? totalCorrect / totalAnswered : null;

    const achievementPreview = useMemo(
        () => closestAchievements(gamification, totalCorrect, bestStreak, 3),
        [gamification, totalCorrect, bestStreak]
    );

    // Date.now() can't run during render, so the "staleness" clock is captured
    // in an effect (deferred a tick to avoid a synchronous setState-in-effect)
    // and weakAreas is only computed once it's available.
    const [now, setNow] = useState<number | null>(null);
    useEffect(() => {
        const timer = setTimeout(() => setNow(Date.now()), 0);
        return () => clearTimeout(timer);
    }, []);

    // The top 3 weakest categories make up "today's practice" - never-practiced
    // categories default to Easy to introduce them, otherwise Medium to push a
    // little past comfortable.
    const weakAreas = useMemo(() => {
        if (now === null) return [];
        return CATEGORIES.map((category) => {
            const stats = progress[category];
            return {
                category,
                score: categoryWeaknessScore(stats, now),
                difficulty: (!stats || stats.total === 0 ? 'easy' : 'medium') as EarTrainingDifficulty,
            };
        })
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
    }, [progress, now]);

    const { level, xpIntoLevel, xpForNextLevel } = levelProgress(gamification.xp);

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold theme-text flex items-center gap-2">
                    <MapIcon size={28} /> Your Learning Plan
                </h1>
                <p className="theme-secondary-text mt-1">
                    A roadmap through the curriculum, plus a daily practice session tuned to your weak spots.
                </p>
            </div>

            <div className="theme-card rounded-xl shadow-lg p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full theme-accent-bg font-bold text-lg shrink-0">
                        {level}
                    </div>
                    <div>
                        <p className="theme-text font-semibold">Level {level}</p>
                        <div className="h-2 w-40 rounded-full theme-muted-bg overflow-hidden mt-1">
                            <div
                                className="h-full theme-accent-bg transition-all"
                                style={{ width: `${xpForNextLevel > 0 ? Math.min(100, (xpIntoLevel / xpForNextLevel) * 100) : 0}%` }}
                            />
                        </div>
                    </div>
                </div>
                <div className="text-sm theme-secondary-text flex items-center gap-2">
                    <Trophy size={16} /> {completedCount} / {totalLessons} lessons complete
                </div>
            </div>

            <section className="theme-card rounded-xl shadow-lg p-5 mb-6">
                <h2 className="text-lg font-bold theme-text flex items-center gap-2 mb-3">
                    <BarChart3 size={20} /> Your Stats
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="theme-secondary-bg rounded-lg p-3">
                        <p className="text-xs theme-secondary-text mb-1">Questions Answered</p>
                        <p className="text-xl font-bold theme-text">{totalAnswered}</p>
                    </div>
                    <div className="theme-secondary-bg rounded-lg p-3">
                        <p className="text-xs theme-secondary-text mb-1">Correct Answers</p>
                        <p className="text-xl font-bold theme-text">{totalCorrect}</p>
                    </div>
                    <div className="theme-secondary-bg rounded-lg p-3">
                        <p className="text-xs theme-secondary-text mb-1">Overall Accuracy</p>
                        <p className="text-xl font-bold theme-text">
                            {overallAccuracy === null ? '—' : `${Math.round(overallAccuracy * 100)}%`}
                        </p>
                    </div>
                    <div className="theme-secondary-bg rounded-lg p-3">
                        <p className="text-xs theme-secondary-text mb-1 flex items-center gap-1">
                            <Flame size={12} /> Best Streak
                        </p>
                        <p className="text-xl font-bold theme-text">{bestStreak}</p>
                    </div>
                </div>
            </section>

            <section className="theme-card rounded-xl shadow-lg p-5 mb-6">
                <h2 className="text-lg font-bold theme-text flex items-center gap-2 mb-3">
                    <Sparkles size={20} /> Up Next
                </h2>
                {upNext ? (
                    <>
                        <p className="text-xs theme-secondary-text mb-1">{upNextUnit?.title}</p>
                        <h3 className="text-xl font-semibold theme-text mb-1">{upNext.title}</h3>
                        <p className="text-sm theme-secondary-text mb-4">{upNext.summary}</p>
                        <Link
                            href="/app/curriculum"
                            className="inline-flex items-center gap-1.5 px-4 py-2 theme-btn rounded-lg text-sm font-medium hover:opacity-90"
                        >
                            Continue Lesson <ArrowRight size={14} />
                        </Link>
                        {laterLessons.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-xs font-semibold theme-secondary-text uppercase tracking-wide mb-2">
                                    Coming Up After This
                                </p>
                                <ul className="space-y-1.5">
                                    {laterLessons.map((lesson, i) => (
                                        <li key={lesson.id} className="flex items-center gap-2 text-sm theme-secondary-text">
                                            <span className="flex items-center justify-center w-5 h-5 rounded-full theme-muted-bg text-[10px] font-semibold shrink-0">
                                                {i + 2}
                                            </span>
                                            {lesson.title}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-sm theme-secondary-text">
                        You&apos;ve completed every lesson in the curriculum. Revisit any unit below, or head to the
                        practice page for Expert-tier drills.
                    </p>
                )}
            </section>

            <section className="theme-card rounded-xl shadow-lg p-5 mb-6">
                <h2 className="text-lg font-bold theme-text flex items-center gap-2 mb-3">
                    <Target size={20} /> Today&apos;s Practice
                </h2>
                <p className="text-sm theme-secondary-text mb-4">
                    A short mixed session targeting the areas that need the most attention right now.
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                    {weakAreas.map(({ category, difficulty }) => (
                        <Link
                            key={category}
                            href={`/app/ear-training?focus=${category}&difficulty=${difficulty}`}
                            className="theme-muted-bg rounded-lg p-4 hover:opacity-90 transition-colors"
                        >
                            <p className="font-semibold theme-text mb-1">{CATEGORY_LABELS[category as Category]}</p>
                            <p className="text-xs theme-secondary-text flex items-center gap-1">
                                Practice Now <ArrowRight size={12} />
                            </p>
                        </Link>
                    ))}
                </div>
            </section>

            {achievementPreview.length > 0 && (
                <section className="theme-card rounded-xl shadow-lg p-5 mb-6">
                    <h2 className="text-lg font-bold theme-text flex items-center gap-2 mb-3">
                        <Award size={20} /> Almost There
                    </h2>
                    <p className="text-sm theme-secondary-text mb-4">
                        The achievements closest to unlocking based on your current progress.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-3">
                        {achievementPreview.map(({ achievement, current }) => {
                            const target = achievement.target ?? 1;
                            const pct = Math.min(100, Math.round((current / target) * 100));
                            return (
                                <div key={achievement.id} className="theme-muted-bg rounded-lg p-3">
                                    <p className="font-semibold theme-text text-sm mb-0.5">{achievement.title}</p>
                                    <p className="text-xs theme-secondary-text mb-2">{achievement.description}</p>
                                    <div className="h-1.5 rounded-full theme-secondary-bg overflow-hidden">
                                        <div className="h-full theme-accent-bg transition-all" style={{ width: `${pct}%` }} />
                                    </div>
                                    <p className="text-xs theme-secondary-text mt-1">
                                        {current} / {target}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            <section className="theme-card rounded-xl shadow-lg p-5">
                <h2 className="text-lg font-bold theme-text flex items-center gap-2 mb-4">
                    <BookOpen size={20} /> Roadmap
                </h2>
                <div className="space-y-4">
                    {CURRICULUM.map((unit) => {
                        const unitCompletedCount = unit.lessons.filter((lesson) => completed.has(lesson.id)).length;
                        const unitDone = unitCompletedCount === unit.lessons.length;
                        return (
                            <div key={unit.id} className="theme-secondary-bg rounded-lg p-4">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <h3 className="font-semibold theme-text">{unit.title}</h3>
                                    <span className="text-xs theme-secondary-text">
                                        {unitCompletedCount}/{unit.lessons.length}
                                    </span>
                                </div>
                                <p className="text-xs theme-secondary-text opacity-80 mb-3">{unit.description}</p>
                                <ul className="space-y-1.5">
                                    {unit.lessons.map((lesson) => {
                                        const isDone = completed.has(lesson.id);
                                        const unlocked = isLessonUnlocked(lesson.id, completed);
                                        const isUpNext = upNext?.id === lesson.id;
                                        return (
                                            <li
                                                key={lesson.id}
                                                className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm ${
                                                    isUpNext ? 'theme-accent-bg' : ''
                                                }`}
                                            >
                                                {isDone ? (
                                                    <CheckCircle2 size={14} className="shrink-0" />
                                                ) : unlocked ? (
                                                    <Circle size={14} className="shrink-0 theme-secondary-text" />
                                                ) : (
                                                    <Lock size={14} className="shrink-0 theme-secondary-text opacity-60" />
                                                )}
                                                <span className={!isUpNext && !unlocked ? 'theme-secondary-text opacity-60' : 'theme-text'}>
                                                    {lesson.title}
                                                </span>
                                                {isUpNext && <span className="text-[10px] uppercase tracking-wide font-semibold ml-auto">Up Next</span>}
                                            </li>
                                        );
                                    })}
                                </ul>
                                {unitDone && (
                                    <p className="text-xs theme-secondary-text mt-2 flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Unit complete
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
