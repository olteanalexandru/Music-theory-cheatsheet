'use client';

import type { EarTrainingDifficulty } from '@/app/utils/earTrainingData';
import type { Category } from '@/app/components/EarTraining';

export interface ChallengeSession {
    challengeId: string;
    category: Category;
    difficulty: EarTrainingDifficulty;
    length: number;
}

export interface ChallengeResult {
    challengeId: string;
    correct: number;
    total: number;
}

// Two-way counterpart to practiceFocusBus.ts: the challenges page asks
// EarTraining to start a specific challenge's session (requestChallengeSession),
// and EarTraining reports the finished score back the same way
// (reportChallengeResult) so AuthContext can write it to Supabase without
// either side importing the other.
type ChallengeSessionListener = (session: ChallengeSession) => void;
const sessionListeners = new Set<ChallengeSessionListener>();

export function requestChallengeSession(session: ChallengeSession): void {
    sessionListeners.forEach((listener) => listener(session));
}

export function subscribeToChallengeSession(listener: ChallengeSessionListener): () => void {
    sessionListeners.add(listener);
    return () => sessionListeners.delete(listener);
}

type ChallengeResultListener = (result: ChallengeResult) => void;
const resultListeners = new Set<ChallengeResultListener>();

export function reportChallengeResult(result: ChallengeResult): void {
    resultListeners.forEach((listener) => listener(result));
}

export function subscribeToChallengeResults(listener: ChallengeResultListener): () => void {
    resultListeners.add(listener);
    return () => resultListeners.delete(listener);
}
