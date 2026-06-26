'use client';

import { useEffect, useRef } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

// Generalizes the "pull cloud copy once per sign-in, merge into localStorage,
// then debounce-push local changes" dance that AuthContext needs for every
// localStorage-backed store (progress, curriculum, ...). Each store stays
// unaware of Supabase entirely - this hook is the only place they meet.
export function useCloudSync<T>(
    supabase: SupabaseClient | null,
    userId: string | undefined,
    table: string,
    load: () => T,
    save: (data: T) => void,
    merge: (local: T, cloud: T) => T,
    subscribe: (listener: (data: T) => void) => () => void
): void {
    const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!supabase || !userId) return;
        let cancelled = false;

        (async () => {
            const { data } = await supabase.from(table).select('data').eq('user_id', userId).maybeSingle();
            if (cancelled) return;
            const cloud = (data?.data ?? {}) as T;
            save(merge(load(), cloud));
        })();

        const unsubscribe = subscribe((current) => {
            if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
            pushTimerRef.current = setTimeout(() => {
                void supabase.from(table).upsert({ user_id: userId, data: current, updated_at: new Date().toISOString() });
            }, 1000);
        });

        return () => {
            cancelled = true;
            unsubscribe();
            if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
        };
    }, [supabase, userId, table, load, save, merge, subscribe]);
}
