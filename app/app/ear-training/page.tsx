'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import EarTraining, { CATEGORIES, type Category } from '@/app/components/EarTraining';
import { usePracticeTools } from '@/app/utils/PracticeToolsContext';
import { DIFFICULTY_LEVELS, type EarTrainingDifficulty } from '@/app/utils/earTrainingData';
import { requestPracticeFocus } from '@/app/utils/practiceFocusBus';
import { requestChallengeSession } from '@/app/utils/challengeBus';

function EarTrainingPageContent() {
    const { midi, synth } = usePracticeTools();
    const searchParams = useSearchParams();

    // Cross-page deep link (e.g. from /plan or /challenges):
    // /app/ear-training?focus=<category>&difficulty=<level>[&length=<n>&challenge=<id>]
    const focusParam = searchParams.get('focus');
    const focusCategory = focusParam && CATEGORIES.includes(focusParam as Category) ? (focusParam as Category) : null;
    const focusDifficultyParam = searchParams.get('difficulty');
    const focusLengthParam = searchParams.get('length');
    const challengeIdParam = searchParams.get('challenge');

    useEffect(() => {
        if (!focusCategory) return;
        const difficulty: EarTrainingDifficulty = (DIFFICULTY_LEVELS as string[]).includes(focusDifficultyParam ?? '')
            ? (focusDifficultyParam as EarTrainingDifficulty)
            : 'medium';
        if (challengeIdParam) {
            const length = Number(focusLengthParam);
            requestChallengeSession({
                challengeId: challengeIdParam,
                category: focusCategory,
                difficulty,
                length: Number.isFinite(length) && length > 0 ? length : 10,
            });
        } else {
            requestPracticeFocus({ category: focusCategory, difficulty });
        }
    }, [focusCategory, focusDifficultyParam, focusLengthParam, challengeIdParam]);

    return (
        <div>
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold theme-text mb-2">Ear Training</h1>
                <p className="theme-secondary-text">Drill intervals, chords, scales, and progressions by ear</p>
            </div>

            <EarTraining midi={midi} synth={synth} />
        </div>
    );
}

export default function EarTrainingPage() {
    return (
        <Suspense fallback={null}>
            <EarTrainingPageContent />
        </Suspense>
    );
}
