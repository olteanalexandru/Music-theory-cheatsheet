'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Send, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/app/utils/AuthContext';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';
import { getSupabaseClient } from '@/app/utils/supabaseClient';
import { fetchProfileByUserId } from '@/app/utils/profileStore';
import {
    fetchAllTickets,
    fetchTicketMessages,
    postTicketMessage,
    updateTicketStatus,
    TICKET_CATEGORY_LABELS,
    TICKET_STATUSES,
    TICKET_STATUS_LABELS,
    type SupportTicket,
    type TicketMessage,
    type TicketStatus,
} from '@/app/utils/ticketStore';

interface ProfileRow {
    user_id: string;
    username: string;
    display_name: string | null;
}

function Centered({ children }: { children: React.ReactNode }) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center theme-secondary-text">{children}</div>;
}

const STATUS_BADGE_CLASS: Record<string, string> = {
    open: 'theme-accent-bg',
    in_progress: 'theme-accent-bg',
    resolved: 'theme-muted-bg theme-secondary-text',
    closed: 'theme-muted-bg theme-secondary-text',
};

export default function AdminTicketsPage() {
    const t = useTranslations('legal');
    const { user, loading: authLoading } = useAuth();
    const [checkingAdmin, setCheckingAdmin] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [ownersById, setOwnersById] = useState<Map<string, ProfileRow>>(new Map());
    const [selected, setSelected] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<TicketMessage[]>([]);
    const [messagesLoading, setMessagesLoading] = useState(false);

    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        void (async () => {
            const supabase = getSupabaseClient();
            if (!supabase || !user) {
                setCheckingAdmin(false);
                return;
            }
            const profile = await fetchProfileByUserId(supabase, user.id);
            setIsAdmin(!!profile?.isAdmin);
            setCheckingAdmin(false);
        })();
    }, [authLoading, user]);

    const load = useCallback(async () => {
        const supabase = getSupabaseClient();
        if (!supabase || !isAdmin) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const rows = await fetchAllTickets(supabase);
        setTickets(rows);

        const ownerIds = Array.from(new Set(rows.map((t) => t.userId)));
        if (ownerIds.length > 0) {
            const { data } = await supabase.from('profiles').select('user_id, username, display_name').in('user_id', ownerIds);
            setOwnersById(new Map(((data ?? []) as ProfileRow[]).map((row) => [row.user_id, row])));
        } else {
            setOwnersById(new Map());
        }
        setLoading(false);
    }, [isAdmin]);

    useEffect(() => {
        if (checkingAdmin) return;
        void (async () => {
            await load();
        })();
    }, [checkingAdmin, load]);

    const openTicket = async (ticket: SupportTicket) => {
        setSelected(ticket);
        setMessagesLoading(true);
        const supabase = getSupabaseClient();
        if (supabase) setMessages(await fetchTicketMessages(supabase, ticket.id));
        setMessagesLoading(false);
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = getSupabaseClient();
        if (!supabase || !user || !selected || !reply.trim()) return;
        setSending(true);
        await postTicketMessage(supabase, user.id, selected, reply);
        setReply('');
        setMessages(await fetchTicketMessages(supabase, selected.id));
        setSending(false);
    };

    const handleStatusChange = async (status: TicketStatus) => {
        const supabase = getSupabaseClient();
        if (!supabase || !user || !selected || status === selected.status) return;
        setUpdatingStatus(true);
        const { error } = await updateTicketStatus(supabase, user.id, selected, status);
        if (!error) {
            const updated = { ...selected, status };
            setSelected(updated);
            setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        }
        setUpdatingStatus(false);
    };

    if (authLoading || checkingAdmin || (isAdmin && loading)) {
        return (
            <Centered>
                <Loader2 className="animate-spin mx-auto" size={24} />
            </Centered>
        );
    }

    if (!getSupabaseClient()) {
        return <Centered>{t.adminTickets.requiresCloudSync}</Centered>;
    }

    if (!user) {
        return <Centered>{t.adminTickets.signInRequired}</Centered>;
    }

    if (!isAdmin) {
        return <Centered>{t.adminTickets.noAccess}</Centered>;
    }

    if (selected) {
        const owner = ownersById.get(selected.userId);
        return (
            <div className="max-w-2xl mx-auto px-4 md:px-8 py-10">
                <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm theme-secondary-text hover:theme-text mb-4">
                    <ArrowLeft size={14} /> {t.adminTickets.backToInbox}
                </button>
                <div className="theme-card rounded-xl shadow-lg p-6 mb-4">
                    <div className="flex items-center justify-between gap-4 mb-1">
                        <h1 className="text-xl font-bold theme-text">{selected.subject}</h1>
                    </div>
                    <p className="text-xs theme-secondary-text mb-3">
                        {owner?.display_name || owner?.username || t.adminTickets.unknownUser} · {TICKET_CATEGORY_LABELS[selected.category]}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {TICKET_STATUSES.map((status) => (
                            <button
                                key={status}
                                type="button"
                                disabled={updatingStatus}
                                onClick={() => void handleStatusChange(status)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 ${
                                    selected.status === status ? STATUS_BADGE_CLASS[status] : 'theme-muted-bg theme-secondary-text hover:opacity-90'
                                }`}
                            >
                                {TICKET_STATUS_LABELS[status]}
                            </button>
                        ))}
                    </div>
                </div>

                {messagesLoading ? (
                    <Loader2 className="animate-spin mx-auto my-8" size={20} />
                ) : (
                    <ul className="space-y-3 mb-4">
                        {messages.map((m) => (
                            <li key={m.id} className="theme-card rounded-xl p-4">
                                <p className="text-xs theme-secondary-text mb-1">
                                    {m.authorId === user.id ? t.adminTickets.you : m.authorUsername} · {new Date(m.createdAt).toLocaleString()}
                                </p>
                                <p className="theme-text text-sm whitespace-pre-wrap">{m.body}</p>
                            </li>
                        ))}
                    </ul>
                )}

                <form onSubmit={handleReply} className="flex gap-2">
                    <input
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder={t.adminTickets.writeReply}
                        className="flex-1 rounded-lg theme-muted-bg theme-text px-3 py-2 text-sm outline-none"
                    />
                    <button
                        type="submit"
                        disabled={sending || !reply.trim()}
                        className="flex items-center gap-1 px-4 py-2 theme-btn rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                        <Send size={14} /> {t.adminTickets.send}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
            <h1 className="text-2xl font-bold theme-text flex items-center gap-2 mb-6">
                <ShieldCheck size={24} /> {t.adminTickets.supportInbox}
            </h1>

            {tickets.length === 0 ? (
                <p className="theme-secondary-text text-center py-16">{t.adminTickets.noTickets}</p>
            ) : (
                <ul className="theme-card rounded-xl shadow-lg divide-y divide-white/10 overflow-hidden">
                    {tickets.map((ticket) => {
                        const owner = ownersById.get(ticket.userId);
                        return (
                            <li key={ticket.id}>
                                <button onClick={() => void openTicket(ticket)} className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:theme-muted-bg">
                                    <div>
                                        <p className="theme-text font-medium">{ticket.subject}</p>
                                        <p className="theme-secondary-text text-xs">
                                            {owner?.display_name || owner?.username || t.adminTickets.unknownUser} · {TICKET_CATEGORY_LABELS[ticket.category]} ·{' '}
                                            {new Date(ticket.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_CLASS[ticket.status]}`}>
                                        {TICKET_STATUS_LABELS[ticket.status]}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
