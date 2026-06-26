'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle2, Circle, Lock, Map as MapIcon, Sparkles, Target, Trophy } from 'lucide-react';
import {
    ALL_LESSONS,
    CURRICULUM,
    getUnitForLesson,
    isLessonUnlocked,
    nextIncompleteLesson,
} from '@/app/utils/curriculumData';
import { completedLessonIds, loadCurriculum } from '@/app/utils/curriculumStore';
import { CATEGORIES, CATEGORY_LABELS, type Category } from '@/app/components/EarTraining';
import { categoryWeaknessScore, loadProgress } from '@/app/utils/progressStore';
import { levelProgress, loadGamification } from '@/app/utils/gamificationStore';
import type { EarTrainingDifficulty } from '@/app/utils/earTrainingData';

export default function PlanPage() {
    const [curriculumStore] = useState(() => loadCurriculum());
    const [progress] = useState(() => loadProgress());
    const [gamification] = useState(() => loadGamification());

    const completed = useMemo(() => completedLessonIds(curriculumStore), [curriculumStore]);
    const totalLessons = ALL_LESSONS.length;
    const completedCount = completed.size;

    const upNext = useMemo(() => nextIncompleteLesson(completed), [completed]);
    const upNextUnit = upNext ? getUnitForLesson(upNext.id) : undefined;

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
                    <Sparkles size={20} /> Up Next
                </h2>
                {upNext ? (
                    <>
                        <p className="text-xs theme-secondary-text mb-1">{upNextUnit?.title}</p>
                        <h3 className="text-xl font-semibold theme-text mb-1">{upNext.title}</h3>
                        <p className="text-sm theme-secondary-text mb-4">{upNext.summary}</p>
                        <Link
                            href="/app#curriculum-section"
                            className="inline-flex items-center gap-1.5 px-4 py-2 theme-btn rounded-lg text-sm font-medium hover:opacity-90"
                        >
                            Continue Lesson <ArrowRight size={14} />
                        </Link>
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
                            href={`/app?focus=${category}&difficulty=${difficulty}`}
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
