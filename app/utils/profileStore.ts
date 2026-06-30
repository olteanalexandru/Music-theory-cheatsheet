import type { SupabaseClient } from '@supabase/supabase-js';
import { normalizeStore, type GamificationStore } from '@/app/utils/gamificationStore';
import { createNotification } from '@/app/utils/notificationStore';

export interface Profile {
    userId: string;
    username: string;
    displayName: string | null;
    bio: string | null;
    isPublic: boolean;
    isAdmin: boolean;
    createdAt: string;
}

interface ProfileRow {
    user_id: string;
    username: string;
    display_name: string | null;
    bio: string | null;
    is_public: boolean;
    is_admin: boolean;
    created_at: string;
}

function toProfile(row: ProfileRow): Profile {
    return {
        userId: row.user_id,
        username: row.username,
        displayName: row.display_name,
        bio: row.bio,
        isPublic: row.is_public,
        isAdmin: row.is_admin,
        createdAt: row.created_at,
    };
}

export async function fetchProfileByUsername(supabase: SupabaseClient, username: string): Promise<Profile | null> {
    const { data } = await supabase.from('profiles').select('*').eq('username', username.toLowerCase()).maybeSingle();
    return data ? toProfile(data as ProfileRow) : null;
}

export async function fetchProfileByUserId(supabase: SupabaseClient, userId: string): Promise<Profile | null> {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
    return data ? toProfile(data as ProfileRow) : null;
}

export interface ProfileEdits {
    username: string;
    displayName: string;
    bio: string;
    isPublic: boolean;
}

// Profiles aren't localStorage-mirrored like progress/curriculum/etc. - the
// row itself is the only copy, so this writes straight to Supabase rather
// than going through the load/save/merge/subscribe cloud-sync pattern.
export async function saveProfile(supabase: SupabaseClient, userId: string, edits: ProfileEdits): Promise<{ error: string | null }> {
    const { error } = await supabase.from('profiles').upsert({
        user_id: userId,
        username: edits.username.toLowerCase(),
        display_name: edits.displayName.trim() || null,
        bio: edits.bio.trim() || null,
        is_public: edits.isPublic,
    });
    return { error: error?.message ?? null };
}

export async function fetchGamificationForUser(supabase: SupabaseClient, userId: string): Promise<GamificationStore | null> {
    const { data } = await supabase.from('gamification').select('data').eq('user_id', userId).maybeSingle();
    return data ? normalizeStore(data.data as Partial<GamificationStore>) : null;
}

export async function fetchFollowerCount(supabase: SupabaseClient, userId: string): Promise<number> {
    const { count } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('followee_id', userId);
    return count ?? 0;
}

export async function fetchFollowingCount(supabase: SupabaseClient, userId: string): Promise<number> {
    const { count } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId);
    return count ?? 0;
}

export async function fetchFollowingIds(supabase: SupabaseClient, followerId: string): Promise<string[]> {
    const { data } = await supabase.from('follows').select('followee_id').eq('follower_id', followerId);
    return (data ?? []).map((row) => row.followee_id as string);
}

export async function isFollowing(supabase: SupabaseClient, followerId: string, followeeId: string): Promise<boolean> {
    const { data } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', followerId)
        .eq('followee_id', followeeId)
        .maybeSingle();
    return !!data;
}

export async function followUser(supabase: SupabaseClient, followerId: string, followeeId: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('follows').insert({ follower_id: followerId, followee_id: followeeId });
    if (!error) {
        await createNotification(supabase, { userId: followeeId, actorId: followerId, type: 'follow' });
    }
    return { error: error?.message ?? null };
}

export async function unfollowUser(supabase: SupabaseClient, followerId: string, followeeId: string): Promise<void> {
    await supabase.from('follows').delete().eq('follower_id', followerId).eq('followee_id', followeeId);
}

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export function isValidUsername(username: string): boolean {
    return USERNAME_PATTERN.test(username.toLowerCase());
}
