'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/app/utils/supabaseClient';
import { loadProgress, saveProgress, mergeProgress, subscribeToProgressChanges, type ProgressStore } from '@/app/utils/progressStore';

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

    // Pulls the cloud copy once per sign-in and merges it into localStorage,
    // then keeps pushing local changes up while signed in. progressStore stays
    // unaware of Supabase entirely - this is the only place the two meet.
    const userId = session?.user.id;
    const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (!supabase || !userId) return;
        let cancelled = false;

        (async () => {
            const { data } = await supabase.from('progress').select('data').eq('user_id', userId).maybeSingle();
            if (cancelled) return;
            const cloud = (data?.data ?? {}) as ProgressStore;
            saveProgress(mergeProgress(loadProgress(), cloud));
        })();

        const unsubscribe = subscribeToProgressChanges((progress) => {
            if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
            pushTimerRef.current = setTimeout(() => {
                void supabase
                    .from('progress')
                    .upsert({ user_id: userId, data: progress, updated_at: new Date().toISOString() });
            }, 1000);
        });

        return () => {
            cancelled = true;
            unsubscribe();
            if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
        };
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
