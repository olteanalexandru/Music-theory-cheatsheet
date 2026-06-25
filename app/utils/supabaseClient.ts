import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// NEXT_PUBLIC_* vars are inlined at build time (this app uses `output: 'export'`,
// so there's no server runtime to read them from later). Deployments that don't
// set them get a fully-functional guest-only app rather than a crash - every
// caller must go through this getter and handle a null return.
let cachedClient: SupabaseClient | null | undefined;

export function getSupabaseClient(): SupabaseClient | null {
    if (cachedClient !== undefined) return cachedClient;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    cachedClient = url && anonKey ? createClient(url, anonKey) : null;
    return cachedClient;
}
