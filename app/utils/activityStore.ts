import type { SupabaseClient } from '@supabase/supabase-js';
import type { ActivityEvent, ActivityEventType } from '@/app/utils/activityBus';
import { createNotification } from '@/app/utils/notificationStore';

export interface ActivityFeedItem {
    id: string;
    userId: string;
    username: string;
    displayName: string | null;
    type: ActivityEventType;
    data: Record<string, unknown>;
    createdAt: string;
}

interface ActivityEventRow {
    id: string;
    user_id: string;
    type: ActivityEventType;
    data: Record<string, unknown>;
    created_at: string;
}

interface ProfileLookupRow {
    user_id: string;
    username: string;
    display_name: string | null;
}

export async function recordActivityEvent(supabase: SupabaseClient, userId: string, event: ActivityEvent): Promise<void> {
    await supabase.from('activity_events').insert({ user_id: userId, type: event.type, data: event.data });
}

// Fetches the most recent events for a set of users (the "Following" scope)
// or, when userIds is omitted, every public profile's events (the "Global"
// scope) - same two-query-then-join-in-memory shape as the leaderboard page,
// since activity_events has no direct foreign key to profiles to embed via.
export async function fetchActivityFeed(
    supabase: SupabaseClient,
    options: { userIds?: string[]; limit?: number } = {}
): Promise<ActivityFeedItem[]> {
    const limit = options.limit ?? 50;
    let query = supabase.from('activity_events').select('id, user_id, type, data, created_at').order('created_at', { ascending: false }).limit(limit);
    if (options.userIds) {
        if (options.userIds.length === 0) return [];
        query = query.in('user_id', options.userIds);
    }
    const { data } = await query;
    const rows = (data ?? []) as ActivityEventRow[];
    if (rows.length === 0) return [];

    const uniqueUserIds = Array.from(new Set(rows.map((row) => row.user_id)));
    const { data: profileRows } = await supabase.from('profiles').select('user_id, username, display_name').in('user_id', uniqueUserIds);
    const profileById = new Map((profileRows ?? []).map((row) => [(row as ProfileLookupRow).user_id, row as ProfileLookupRow]));

    return rows
        .filter((row) => profileById.has(row.user_id))
        .map((row) => {
            const profile = profileById.get(row.user_id)!;
            return {
                id: row.id,
                userId: row.user_id,
                username: profile.username,
                displayName: profile.display_name,
                type: row.type,
                data: row.data,
                createdAt: row.created_at,
            };
        });
}

export interface ActivityComment {
    id: string;
    eventId: string;
    authorId: string;
    authorUsername: string;
    body: string;
    createdAt: string;
}

interface ActivityCommentRow {
    id: string;
    event_id: string;
    author_id: string;
    body: string;
    created_at: string;
}

export async function fetchComments(supabase: SupabaseClient, eventId: string): Promise<ActivityComment[]> {
    const { data } = await supabase
        .from('activity_comments')
        .select('id, event_id, author_id, body, created_at')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });
    const rows = (data ?? []) as ActivityCommentRow[];
    if (rows.length === 0) return [];

    const authorIds = Array.from(new Set(rows.map((row) => row.author_id)));
    const { data: profileRows } = await supabase.from('profiles').select('user_id, username').in('user_id', authorIds);
    const usernameById = new Map((profileRows ?? []).map((row) => [row.user_id as string, row.username as string]));

    return rows.map((row) => ({
        id: row.id,
        eventId: row.event_id,
        authorId: row.author_id,
        authorUsername: usernameById.get(row.author_id) ?? 'unknown',
        body: row.body,
        createdAt: row.created_at,
    }));
}

export async function addComment(supabase: SupabaseClient, eventId: string, authorId: string, body: string): Promise<{ error: string | null }> {
    const trimmed = body.trim();
    if (!trimmed) return { error: 'Comment cannot be empty.' };
    const { error } = await supabase.from('activity_comments').insert({ event_id: eventId, author_id: authorId, body: trimmed.slice(0, 500) });
    if (!error) await notifyEventOwner(supabase, eventId, authorId, 'comment');
    return { error: error?.message ?? null };
}

// Looks up who an activity_events row belongs to so comments/reactions can
// notify that person - createNotification's own auth.uid()=actor_id guard
// already no-ops this when the owner is reacting/commenting on their own event.
async function notifyEventOwner(supabase: SupabaseClient, eventId: string, actorId: string, type: 'comment' | 'reaction'): Promise<void> {
    const { data } = await supabase.from('activity_events').select('user_id').eq('id', eventId).maybeSingle();
    if (!data) return;
    await createNotification(supabase, { userId: (data as { user_id: string }).user_id, actorId, type, data: { eventId } });
}

export async function deleteComment(supabase: SupabaseClient, commentId: string): Promise<void> {
    await supabase.from('activity_comments').delete().eq('id', commentId);
}

// Reaction counts per event, plus which emoji (if any) the current viewer
// already picked, for a batch of events on one feed page load.
export async function fetchReactionSummaries(
    supabase: SupabaseClient,
    eventIds: string[],
    viewerId: string | null
): Promise<Map<string, { counts: Record<string, number>; viewerEmoji: string | null }>> {
    const summaries = new Map<string, { counts: Record<string, number>; viewerEmoji: string | null }>();
    if (eventIds.length === 0) return summaries;

    const { data } = await supabase.from('activity_reactions').select('event_id, user_id, emoji').in('event_id', eventIds);
    for (const row of (data ?? []) as { event_id: string; user_id: string; emoji: string }[]) {
        const summary = summaries.get(row.event_id) ?? { counts: {}, viewerEmoji: null };
        summary.counts[row.emoji] = (summary.counts[row.emoji] ?? 0) + 1;
        if (viewerId && row.user_id === viewerId) summary.viewerEmoji = row.emoji;
        summaries.set(row.event_id, summary);
    }
    return summaries;
}

export async function setReaction(supabase: SupabaseClient, eventId: string, userId: string, emoji: string): Promise<void> {
    await supabase.from('activity_reactions').upsert({ event_id: eventId, user_id: userId, emoji });
    await notifyEventOwner(supabase, eventId, userId, 'reaction');
}

export async function removeReaction(supabase: SupabaseClient, eventId: string, userId: string): Promise<void> {
    await supabase.from('activity_reactions').delete().eq('event_id', eventId).eq('user_id', userId);
}
