'use client';

import React, { useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import type { QuizQuestion } from '@/app/utils/curriculumData';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';

interface LessonQuizProps {
    quiz: QuizQuestion[];
    passThreshold: number;
    onComplete: (score: number) => void;
}

const LessonQuiz: React.FC<LessonQuizProps> = ({ quiz, passThreshold, onComplete }) => {
    const t = useTranslations('social');
    const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.map(() => null));
    const [submitted, setSubmitted] = useState(false);

    const allAnswered = answers.every((answer) => answer !== null);
    const correctCount = quiz.reduce((count, question, i) => (answers[i] === question.correctIndex ? count + 1 : count), 0);
    const score = quiz.length > 0 ? correctCount / quiz.length : 0;
    const passed = score >= passThreshold;

    const selectAnswer = (questionIndex: number, choiceIndex: number) => {
        if (submitted) return;
        setAnswers((current) => current.map((answer, i) => (i === questionIndex ? choiceIndex : answer)));
    };

    const handleSubmit = () => {
        setSubmitted(true);
        if (passed) onComplete(score);
    };

    const handleRetry = () => {
        setAnswers(quiz.map(() => null));
        setSubmitted(false);
    };

    return (
        <div className="space-y-4">
            {quiz.map((question, qi) => {
                const selected = answers[qi];
                return (
                    <div key={qi} className="p-3 md:p-4 rounded-lg theme-muted-bg">
                        <p className="theme-text font-medium mb-2 text-sm">
                            {qi + 1}. {question.question}
                        </p>
                        <div className="space-y-1.5">
                            {question.choices.map((choice, ci) => {
                                const isSelected = selected === ci;
                                const isCorrectChoice = ci === question.correctIndex;
                                let stateClass = 'theme-secondary-bg theme-secondary-text hover:opacity-90';
                                if (submitted && isCorrectChoice) stateClass = 'theme-accent-bg';
                                else if (submitted && isSelected && !isCorrectChoice) stateClass = 'theme-warning-bg theme-warning-text';
                                else if (!submitted && isSelected) stateClass = 'theme-accent-bg';
                                return (
                                    <button
                                        key={ci}
                                        onClick={() => selectAnswer(qi, ci)}
                                        disabled={submitted}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors disabled:cursor-default ${stateClass}`}
                                    >
                                        {choice}
                                    </button>
                                );
                            })}
                        </div>
                        {submitted && <p className="mt-2 text-xs theme-secondary-text opacity-80">{question.explanation}</p>}
                    </div>
                );
            })}

            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    disabled={!allAnswered}
                    className="px-4 py-2 theme-btn rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {t.lessonQuiz.submitQuiz}
                </button>
            ) : (
                <div className="flex flex-wrap items-center gap-3">
                    {passed ? (
                        <span className="flex items-center gap-1.5 text-sm font-semibold theme-text">
                            <CheckCircle2 size={18} /> {t.lessonQuiz.passed(Math.round(score * 100))}
                        </span>
                    ) : (
                        <>
                            <span className="text-sm font-semibold theme-warning-text">
                                {t.lessonQuiz.scoredNeed(Math.round(score * 100), Math.round(passThreshold * 100))}
                            </span>
                            <button
                                onClick={handleRetry}
                                className="flex items-center gap-1.5 px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90"
                            >
                                <RotateCcw size={14} /> {t.lessonQuiz.retry}
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default LessonQuiz;
