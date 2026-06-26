'use client';

// Lets the Supabase-agnostic gamification/curriculum stores announce
// noteworthy events (achievement unlocked, level up, lesson complete,
// challenge completed) without importing Supabase themselves - mirrors
// practiceFocusBus.ts's one-listener-set pub/sub shape. AuthContext is the
// only subscriber that turns these into activity_events rows.
export type ActivityEventType = 'achievement_unlocked' | 'level_up' | 'lesson_complete' | 'challenge_completed';

export interface ActivityEvent {
    type: ActivityEventType;
    data: Record<string, unknown>;
}

type ActivityListener = (event: ActivityEvent) => void;
const listeners = new Set<ActivityListener>();

export function emitActivityEvent(event: ActivityEvent): void {
    listeners.forEach((listener) => listener(event));
}

export function subscribeToActivityEvents(listener: ActivityListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
