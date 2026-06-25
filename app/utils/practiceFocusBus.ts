'use client';

import type { EarTrainingDifficulty } from '@/app/utils/earTrainingData';
import type { Category } from '@/app/components/EarTraining';

export interface PracticeFocus {
    category: Category;
    difficulty: EarTrainingDifficulty;
}

// Lets a lesson's "Practice this" button tell EarTraining which drill to
// switch to without prop-drilling through page.tsx - mirrors the
// progressStore pub/sub pattern, just for one in-memory value instead of
// persisted state.
type FocusListener = (focus: PracticeFocus) => void;
const listeners = new Set<FocusListener>();

export function requestPracticeFocus(focus: PracticeFocus): void {
    listeners.forEach((listener) => listener(focus));
}

export function subscribeToPracticeFocus(listener: FocusListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
