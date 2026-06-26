'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/app/utils/supabaseClient';
import { loadProgress, saveProgress, mergeProgress, subscribeToProgressChanges } from '@/app/utils/progressStore';
import { loadCurriculum, saveCurriculum, mergeCurriculum, subscribeToCurriculumChanges } from '@/app/utils/curriculumStore';
import { loadReview, saveReview, mergeReview, subscribeToReviewChanges } from '@/app/utils/reviewStore';
import { loadGamification, saveGamification, mergeGamification, subscribeToGamificationChanges } from '@/app/utils/gamificationStore';
import { useCloudSync } from '@/app/utils/useCloudSync';
import { subscribeToActivityEvents } from '@/app/utils/activityBus';
import { recordActivityEvent } from '@/app/utils/activityStore';
import { subscribeToChallengeResults } from '@/app/utils/challengeBus';
import { submitChallengeScore } from '@/app/utils/challengeStore';

interface AuthResult {
    error: string | null;
}

interface AuthContextValue {
    isConfigured: boolean;
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string) => Promise<AuthResult>;
    signInWithPassword: (email: string, password: string) => Promise<AuthResult>;
    signInWithMagicLink: (email: string) => Promise<AuthResult>;
    signInWithGoogle: () => Promise<AuthResult>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const NOT_CONFIGURED: AuthResult = { error: 'Cloud sync isn’t configured for this deployment yet.' };

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const supabase = useMemo(() => getSupabaseClient(), []);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(() => !!supabase);

    useEffect(() => {
        if (!supabase) return;
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        });
        const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession);
        });
        return () => subscription.subscription.unsubscribe();
    }, [supabase]);

    // Pulls each cloud copy once per sign-in and merges it into localStorage,
    // then keeps pushing local changes up while signed in - see useCloudSync.
    const userId = session?.user.id;
    useCloudSync(supabase, userId, 'progress', loadProgress, saveProgress, mergeProgress, subscribeToProgressChanges);
    useCloudSync(supabase, userId, 'curriculum_progress', loadCurriculum, saveCurriculum, mergeCurriculum, subscribeToCurriculumChanges);
    useCloudSync(supabase, userId, 'review_progress', loadReview, saveReview, mergeReview, subscribeToReviewChanges);
    useCloudSync(supabase, userId, 'gamification', loadGamification, saveGamification, mergeGamification, subscribeToGamificationChanges);

    // Bridges the Supabase-agnostic gamification/curriculum stores' activity
    // events (achievement unlocked, level up, lesson complete, challenge
    // completed) to the activity_events table - this is the only place those
    // events touch the network, mirroring useCloudSync's agnostic-stores rule.
    useEffect(() => {
        if (!supabase || !userId) return;
        return subscribeToActivityEvents((event) => {
            void recordActivityEvent(supabase, userId, event);
        });
    }, [supabase, userId]);

    // Same bridge for challenge results EarTraining reports via challengeBus
    // once a challenge session finishes.
    useEffect(() => {
        if (!supabase || !userId) return;
        return subscribeToChallengeResults(({ challengeId, correct, total }) => {
            void submitChallengeScore(supabase, userId, challengeId, correct, total);
        });
    }, [supabase, userId]);

    const signUp = useCallback<AuthContextValue['signUp']>(
        async (email, password) => {
            if (!supabase) return NOT_CONFIGURED;
            const { error } = await supabase.auth.signUp({ email, password });
            return { error: error?.message ?? null };
        },
        [supabase]
    );

    const signInWithPassword = useCallback<AuthContextValue['signInWithPassword']>(
        async (email, password) => {
            if (!supabase) return NOT_CONFIGURED;
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            return { error: error?.message ?? null };
        },
        [supabase]
    );

    const signInWithMagicLink = useCallback<AuthContextValue['signInWithMagicLink']>(
        async (email) => {
            if (!supabase) return NOT_CONFIGURED;
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: window.location.origin },
            });
            return { error: error?.message ?? null };
        },
        [supabase]
    );

    const signInWithGoogle = useCallback<AuthContextValue['signInWithGoogle']>(async () => {
        if (!supabase) return NOT_CONFIGURED;
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin },
        });
        return { error: error?.message ?? null };
    }, [supabase]);

    const signOut = useCallback(async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
    }, [supabase]);

    const value: AuthContextValue = {
        isConfigured: !!supabase,
        user: session?.user ?? null,
        loading,
        signUp,
        signInWithPassword,
        signInWithMagicLink,
        signInWithGoogle,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
