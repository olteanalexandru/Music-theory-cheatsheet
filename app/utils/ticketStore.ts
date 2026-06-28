import type { SupabaseClient } from '@supabase/supabase-js';
import { createNotification } from '@/app/utils/notificationStore';

export type TicketCategory = 'bug' | 'billing' | 'question' | 'other';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export const TICKET_CATEGORIES: TicketCategory[] = ['bug', 'billing', 'question', 'other'];
export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
    bug: 'Bug report',
    billing: 'Billing',
    question: 'Question',
    other: 'Other',
};

export const TICKET_STATUSES: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed'];
export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
    open: 'Open',
    in_progress: 'In progress',
    resolved: 'Resolved',
    closed: 'Closed',
};

export interface SupportTicket {
    id: string;
    userId: string;
    subject: string;
    category: TicketCategory;
    status: TicketStatus;
    createdAt: string;
    updatedAt: string;
}

interface TicketRow {
    id: string;
    user_id: string;
    subject: string;
    category: TicketCategory;
    status: TicketStatus;
    created_at: string;
    updated_at: string;
}

function toTicket(row: TicketRow): SupportTicket {
    return {
        id: row.id,
        userId: row.user_id,
        subject: row.subject,
        category: row.category,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export interface TicketMessage {
    id: string;
    ticketId: string;
    authorId: string;
    authorUsername: string;
    body: string;
    createdAt: string;
}

interface TicketMessageRow {
    id: string;
    ticket_id: string;
    author_id: string;
    body: string;
    created_at: string;
}

export async function createTicket(
    supabase: SupabaseClient,
    userId: string,
    fields: { subject: string; category: TicketCategory; body: string }
): Promise<{ ticket: SupportTicket | null; error: string | null }> {
    const { data, error } = await supabase
        .from('support_tickets')
        .insert({ user_id: userId, subject: fields.subject.trim(), category: fields.category })
        .select()
        .single();
    if (error || !data) return { ticket: null, error: error?.message ?? 'Could not create ticket' };
    const ticket = toTicket(data as TicketRow);

    const { error: messageError } = await supabase
        .from('support_ticket_messages')
        .insert({ ticket_id: ticket.id, author_id: userId, body: fields.body.trim() });
    return { ticket, error: messageError?.message ?? null };
}

export async function fetchTickets(supabase: SupabaseClient, userId: string): Promise<SupportTicket[]> {
    const { data } = await supabase.from('support_tickets').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
    return ((data ?? []) as TicketRow[]).map(toTicket);
}

// Admins only - RLS additionally grants this select to anyone with
// profiles.is_admin = true, so this returns every user's tickets rather than
// just the caller's own.
export async function fetchAllTickets(supabase: SupabaseClient): Promise<SupportTicket[]> {
    const { data } = await supabase.from('support_tickets').select('*').order('updated_at', { ascending: false });
    return ((data ?? []) as TicketRow[]).map(toTicket);
}

export async function fetchTicket(supabase: SupabaseClient, ticketId: string): Promise<SupportTicket | null> {
    const { data } = await supabase.from('support_tickets').select('*').eq('id', ticketId).maybeSingle();
    return data ? toTicket(data as TicketRow) : null;
}

export async function fetchTicketMessages(supabase: SupabaseClient, ticketId: string): Promise<TicketMessage[]> {
    const { data } = await supabase
        .from('support_ticket_messages')
        .select('id, ticket_id, author_id, body, created_at')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
    const rows = (data ?? []) as TicketMessageRow[];
    if (rows.length === 0) return [];

    const authorIds = Array.from(new Set(rows.map((row) => row.author_id)));
    const { data: profileRows } = await supabase.from('profiles').select('user_id, username').in('user_id', authorIds);
    const usernameById = new Map((profileRows ?? []).map((row) => [row.user_id as string, row.username as string]));

    return rows.map((row) => ({
        id: row.id,
        ticketId: row.ticket_id,
        authorId: row.author_id,
        authorUsername: usernameById.get(row.author_id) ?? 'someone',
        body: row.body,
        createdAt: row.created_at,
    }));
}

// Posted by either the ticket's own owner (a follow-up) or an admin (a
// reply). Only notifies the owner, and only when an admin is the one
// writing - admins are expected to check the /admin/tickets inbox directly
// rather than being notified of every new ticket or owner follow-up.
export async function postTicketMessage(supabase: SupabaseClient, userId: string, ticket: SupportTicket, body: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('support_ticket_messages').insert({ ticket_id: ticket.id, author_id: userId, body: body.trim() });
    if (error) return { error: error.message };

    if (userId !== ticket.userId) {
        await createNotification(supabase, {
            userId: ticket.userId,
            actorId: userId,
            type: 'ticket_reply',
            data: { ticketId: ticket.id, subject: ticket.subject },
        });
    }
    return { error: null };
}

// Update RLS denials filter the row out rather than raising an error, so a
// non-admin's update matches zero rows with no `error` set - select the row
// back to confirm it actually changed before notifying the owner.
export async function updateTicketStatus(supabase: SupabaseClient, adminId: string, ticket: SupportTicket, status: TicketStatus): Promise<{ error: string | null }> {
    const { data, error } = await supabase
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', ticket.id)
        .select()
        .maybeSingle();
    if (error) return { error: error.message };
    if (!data) return { error: null };

    if (status !== ticket.status) {
        await createNotification(supabase, {
            userId: ticket.userId,
            actorId: adminId,
            type: 'ticket_status',
            data: { ticketId: ticket.id, subject: ticket.subject, status },
        });
    }
    return { error: null };
}
