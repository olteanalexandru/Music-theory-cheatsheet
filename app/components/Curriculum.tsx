'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown, ChevronRight, Circle, Lock, Sparkles } from 'lucide-react';
import {
    ALL_LESSONS,
    CURRICULUM,
    QUIZ_PASS_THRESHOLD,
    getUnitForLesson,
    isLessonUnlocked,
    nextIncompleteLesson,
    type Lesson,
} from '@/app/utils/curriculumData';
import { completedLessonIds, loadCurriculum, markLessonComplete, saveCurriculum, type CurriculumStore } from '@/app/utils/curriculumStore';
import { applyXpAndAchievements, XP_LESSON_COMPLETE, XP_QUIZ_PERFECT_BONUS } from '@/app/utils/gamificationStore';
import LessonQuiz from '@/app/components/LessonQuiz';

const Curriculum: React.FC = () => {
    const router = useRouter();
    const [store, setStore] = useState<CurriculumStore>(() => loadCurriculum());
    const completed = useMemo(() => completedLessonIds(store), [store]);

    const [selectedLessonId, setSelectedLessonId] = useState<string>(
        () => nextIncompleteLesson(completedLessonIds(loadCurriculum()))?.id ?? ALL_LESSONS[0].id
    );
    const [expandedUnitId, setExpandedUnitId] = useState<string | null>(() => getUnitForLesson(selectedLessonId)?.id ?? null);

    // Persist completed lessons across sessions, mirroring progressStore's pattern.
    useEffect(() => {
        saveCurriculum(store);
    }, [store]);

    const selectedLesson = useMemo<Lesson | undefined>(
        () => ALL_LESSONS.find((lesson) => lesson.id === selectedLessonId),
        [selectedLessonId]
    );

    const totalCount = ALL_LESSONS.length;
    const completedCount = completed.size;
    const selectedIndex = ALL_LESSONS.findIndex((lesson) => lesson.id === selectedLessonId);

    const selectLesson = (lesson: Lesson) => {
        if (!isLessonUnlocked(lesson.id, completed)) return;
        setSelectedLessonId(lesson.id);
        setExpandedUnitId(getUnitForLesson(lesson.id)?.id ?? null);
    };

    const handleQuizComplete = (score: number) => {
        const { isNewCompletion, isNewPerfect } = markLessonComplete(selectedLessonId, score);
        const updatedStore = loadCurriculum();
        setStore(updatedStore);

        // Only award XP/achievement progress for genuinely new milestones - otherwise
        // retaking an already-completed lesson's quiz would farm XP indefinitely.
        if (!isNewCompletion && !isNewPerfect) return;

        const completedIds = completedLessonIds(updatedStore);
        const unit = getUnitForLesson(selectedLessonId);
        applyXpAndAchievements((isNewCompletion ? XP_LESSON_COMPLETE : 0) + (isNewPerfect ? XP_QUIZ_PERFECT_BONUS : 0), {
            lessonCompleted: isNewCompletion,
            quizPerfect: isNewPerfect,
            curriculumUnitCompleted: isNewCompletion && !!unit && unit.lessons.every((lesson) => completedIds.has(lesson.id)),
            curriculumAllCompleted: isNewCompletion && completedIds.size >= ALL_LESSONS.length,
        });
    };

    const handlePracticeClick = () => {
        if (!selectedLesson?.practice) return;
        router.push(`/app/ear-training?focus=${selectedLesson.practice.category}&difficulty=${selectedLesson.practice.difficulty}`);
    };

    const goToNextLesson = () => {
        const next = ALL_LESSONS[selectedIndex + 1];
        if (next) selectLesson(next);
    };

    return (
        <div id="curriculum-section" className="mt-8 theme-card rounded-lg p-4 md:p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <h2 className="text-2xl font-bold theme-text flex items-center gap-2">
                    <BookOpen size={24} /> Curriculum
                </h2>
                <span className="text-sm theme-secondary-text">
                    {completedCount} / {totalCount} lessons complete
                </span>
            </div>
            <div className="h-2 rounded-full theme-muted-bg overflow-hidden mb-6">
                <div
                    className="h-full theme-accent-bg transition-all"
                    style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                />
            </div>

            <div className="space-y-3 mb-6">
                {CURRICULUM.map((unit) => {
                    const unitCompletedCount = unit.lessons.filter((lesson) => completed.has(lesson.id)).length;
                    const isExpanded = expandedUnitId === unit.id;
                    return (
                        <div key={unit.id} className="rounded-lg theme-secondary-bg overflow-hidden">
                            <button
                                onClick={() => setExpandedUnitId(isExpanded ? null : unit.id)}
                                className="w-full flex items-center justify-between gap-2 p-3 text-left hover:opacity-90"
                                aria-expanded={isExpanded}
                            >
                                <span>
                                    <span className="theme-text font-semibold">{unit.title}</span>
                                    <span className="ml-2 text-xs theme-secondary-text">
                                        {unitCompletedCount}/{unit.lessons.length}
                                    </span>
                                </span>
                                {isExpanded ? (
                                    <ChevronDown size={18} className="theme-secondary-text" />
                                ) : (
                                    <ChevronRight size={18} className="theme-secondary-text" />
                                )}
                            </button>

                            {isExpanded && (
                                <div className="px-3 pb-3 pt-1 space-y-1">
                                    <p className="text-xs theme-secondary-text opacity-80 mb-2">{unit.description}</p>
                                    {unit.lessons.map((lesson) => {
                                        const isDone = completed.has(lesson.id);
                                        const unlocked = isLessonUnlocked(lesson.id, completed);
                                        const isSelected = lesson.id === selectedLessonId;
                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => selectLesson(lesson)}
                                                disabled={!unlocked}
                                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                                                    isSelected
                                                        ? 'theme-accent-bg'
                                                        : unlocked
                                                        ? 'theme-muted-bg theme-secondary-text hover:opacity-90'
                                                        : 'theme-muted-bg theme-secondary-text opacity-50 cursor-not-allowed'
                                                }`}
                                            >
                                                {isDone ? (
                                                    <CheckCircle2 size={16} className="shrink-0" />
                                                ) : unlocked ? (
                                                    <Circle size={16} className="shrink-0" />
                                                ) : (
                                                    <Lock size={16} className="shrink-0" />
                                                )}
                                                {lesson.title}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedLesson && (
                <div className="rounded-lg theme-secondary-bg p-4 md:p-5">
                    <h3 className="text-xl font-bold theme-text mb-1">{selectedLesson.title}</h3>
                    <p className="text-sm theme-secondary-text mb-4">{selectedLesson.summary}</p>

                    <div className="space-y-3 mb-4">
                        {selectedLesson.content.map((paragraph, i) => (
                            <p key={i} className="theme-text text-sm leading-relaxed">
                                {paragraph}
                            </p>
                        ))}
                    </div>

                    {selectedLesson.practice && (
                        <button
                            onClick={handlePracticeClick}
                            className="mb-5 flex items-center gap-2 px-4 py-2 theme-btn rounded-lg text-sm font-medium hover:opacity-90"
                        >
                            <Sparkles size={16} /> Practice: {selectedLesson.practice.label}
                        </button>
                    )}

                    <h4 className="text-sm font-semibold theme-text mb-3">Concept Check</h4>
                    <LessonQuiz
                        key={selectedLesson.id}
                        quiz={selectedLesson.quiz}
                        passThreshold={QUIZ_PASS_THRESHOLD}
                        onComplete={handleQuizComplete}
                    />

                    {completed.has(selectedLesson.id) && selectedIndex < ALL_LESSONS.length - 1 && (
                        <button
                            onClick={goToNextLesson}
                            className="mt-4 flex items-center gap-1.5 px-3 py-1.5 theme-btn rounded-lg text-sm hover:opacity-90"
                        >
                            Next Lesson <ArrowRight size={14} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Curriculum;
