import type { SupabaseClient } from '@supabase/supabase-js';

export type NotificationType =
    | 'follow'
    | 'challenge_invite'
    | 'challenge_result'
    | 'comment'
    | 'reaction'
    | 'ticket_reply'
    | 'ticket_status';

export interface AppNotification {
    id: string;
    userId: string;
    actorId: string;
    actorUsername: string;
    type: NotificationType;
    data: Record<string, unknown>;
    read: boolean;
    createdAt: string;
}

interface NotificationRow {
    id: string;
    user_id: string;
    actor_id: string;
    type: NotificationType;
    data: Record<string, unknown>;
    read: boolean;
    created_at: string;
}

// The actor (whoever triggered the notification) is always the signed-in
// caller - RLS on notifications requires auth.uid() = actor_id - so this can
// only ever address a notification to someone *other* than the caller.
export async function createNotification(
    supabase: SupabaseClient,
    params: { userId: string; actorId: string; type: NotificationType; data?: Record<string, unknown> }
): Promise<void> {
    if (params.userId === params.actorId) return;
    await supabase.from('notifications').insert({
        user_id: params.userId,
        actor_id: params.actorId,
        type: params.type,
        data: params.data ?? {},
    });
}

export async function fetchNotifications(supabase: SupabaseClient, userId: string, limit = 20): Promise<AppNotification[]> {
    const { data } = await supabase
        .from('notifications')
        .select('id, user_id, actor_id, type, data, read, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
    const rows = (data ?? []) as NotificationRow[];
    if (rows.length === 0) return [];

    const actorIds = Array.from(new Set(rows.map((row) => row.actor_id)));
    const { data: profileRows } = await supabase.from('profiles').select('user_id, username').in('user_id', actorIds);
    const usernameById = new Map((profileRows ?? []).map((row) => [row.user_id as string, row.username as string]));

    return rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        actorId: row.actor_id,
        actorUsername: usernameById.get(row.actor_id) ?? 'someone',
        type: row.type,
        data: row.data,
        read: row.read,
        createdAt: row.created_at,
    }));
}

export async function fetchUnreadCount(supabase: SupabaseClient, userId: string): Promise<number> {
    const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('read', false);
    return count ?? 0;
}

export async function markAllRead(supabase: SupabaseClient, userId: string): Promise<void> {
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
}
