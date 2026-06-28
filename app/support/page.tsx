'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, LifeBuoy, Loader2, Send } from 'lucide-react';
import { useAuth } from '@/app/utils/AuthContext';
import { getSupabaseClient } from '@/app/utils/supabaseClient';
import {
    createTicket,
    fetchTickets,
    fetchTicketMessages,
    postTicketMessage,
    TICKET_CATEGORIES,
    TICKET_CATEGORY_LABELS,
    TICKET_STATUS_LABELS,
    type SupportTicket,
    type TicketCategory,
    type TicketMessage,
} from '@/app/utils/ticketStore';

function Centered({ children }: { children: React.ReactNode }) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center theme-secondary-text">{children}</div>;
}

const STATUS_BADGE_CLASS: Record<string, string> = {
    open: 'theme-accent-bg',
    in_progress: 'theme-accent-bg',
    resolved: 'theme-muted-bg theme-secondary-text',
    closed: 'theme-muted-bg theme-secondary-text',
};

export default function SupportPage() {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selected, setSelected] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<TicketMessage[]>([]);
    const [messagesLoading, setMessagesLoading] = useState(false);

    const [showNewTicket, setShowNewTicket] = useState(false);
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState<TicketCategory>(TICKET_CATEGORIES[0]);
    const [body, setBody] = useState('');
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);

    const load = useCallback(async () => {
        const supabase = getSupabaseClient();
        if (!supabase || !user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setTickets(await fetchTickets(supabase, user.id));
        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (authLoading) return;
        void (async () => {
            await load();
        })();
    }, [authLoading, load]);

    const openTicket = async (ticket: SupportTicket) => {
        setSelected(ticket);
        setMessagesLoading(true);
        const supabase = getSupabaseClient();
        if (supabase) setMessages(await fetchTicketMessages(supabase, ticket.id));
        setMessagesLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = getSupabaseClient();
        if (!supabase || !user || !subject.trim() || !body.trim()) return;
        setCreating(true);
        setCreateError(null);
        const { ticket, error } = await createTicket(supabase, user.id, { subject, category, body });
        setCreating(false);
        if (error || !ticket) {
            setCreateError(error ?? 'Could not create ticket');
            return;
        }
        setShowNewTicket(false);
        setSubject('');
        setBody('');
        await load();
        await openTicket(ticket);
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

    if (authLoading || loading) {
        return (
            <Centered>
                <Loader2 className="animate-spin mx-auto" size={24} />
            </Centered>
        );
    }

    if (!getSupabaseClient()) {
        return <Centered>Support tickets require cloud sync, which isn&apos;t configured for this deployment.</Centered>;
    }

    if (!user) {
        return <Centered>Sign in to contact support.</Centered>;
    }

    if (selected) {
        return (
            <div className="max-w-2xl mx-auto px-4 md:px-8 py-10">
                <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm theme-secondary-text hover:theme-text mb-4">
                    <ArrowLeft size={14} /> Back to tickets
                </button>
                <div className="theme-card rounded-xl shadow-lg p-6 mb-4">
                    <div className="flex items-center justify-between gap-4 mb-1">
                        <h1 className="text-xl font-bold theme-text">{selected.subject}</h1>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_CLASS[selected.status]}`}>
                            {TICKET_STATUS_LABELS[selected.status]}
                        </span>
                    </div>
                    <p className="text-xs theme-secondary-text">{TICKET_CATEGORY_LABELS[selected.category]}</p>
                </div>

                {messagesLoading ? (
                    <Loader2 className="animate-spin mx-auto my-8" size={20} />
                ) : (
                    <ul className="space-y-3 mb-4">
                        {messages.map((m) => (
                            <li key={m.id} className="theme-card rounded-xl p-4">
                                <p className="text-xs theme-secondary-text mb-1">
                                    {m.authorId === user.id ? 'You' : m.authorUsername} · {new Date(m.createdAt).toLocaleString()}
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
                        placeholder="Write a reply…"
                        className="flex-1 rounded-lg theme-muted-bg theme-text px-3 py-2 text-sm outline-none"
                    />
                    <button
                        type="submit"
                        disabled={sending || !reply.trim()}
                        className="flex items-center gap-1 px-4 py-2 theme-btn rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                        <Send size={14} /> Send
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-10">
            <div className="flex items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold theme-text flex items-center gap-2">
                    <LifeBuoy size={24} /> Support
                </h1>
                <button onClick={() => setShowNewTicket((v) => !v)} className="px-4 py-2 theme-btn rounded-lg text-sm font-medium hover:opacity-90">
                    New Ticket
                </button>
            </div>

            {showNewTicket && (
                <form onSubmit={handleCreate} className="theme-card rounded-xl shadow-lg p-6 mb-6 space-y-3">
                    <div>
                        <label className="block text-sm theme-secondary-text mb-1">Subject</label>
                        <input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                            maxLength={200}
                            className="w-full rounded-lg theme-muted-bg theme-text px-3 py-2 text-sm outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm theme-secondary-text mb-1">Category</label>
                        <div className="flex flex-wrap gap-2">
                            {TICKET_CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                        category === cat ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'
                                    }`}
                                >
                                    {TICKET_CATEGORY_LABELS[cat]}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm theme-secondary-text mb-1">How can we help?</label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            required
                            rows={4}
                            maxLength={2000}
                            className="w-full rounded-lg theme-muted-bg theme-text px-3 py-2 text-sm outline-none resize-none"
                        />
                    </div>
                    {createError && <p className="text-sm text-red-400">{createError}</p>}
                    <button
                        type="submit"
                        disabled={creating}
                        className="px-4 py-2 theme-btn rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                        {creating ? 'Sending…' : 'Submit Ticket'}
                    </button>
                </form>
            )}

            {tickets.length === 0 ? (
                <p className="theme-secondary-text text-center py-16">No tickets yet — open one above if you need help.</p>
            ) : (
                <ul className="theme-card rounded-xl shadow-lg divide-y divide-white/10 overflow-hidden">
                    {tickets.map((ticket) => (
                        <li key={ticket.id}>
                            <button onClick={() => void openTicket(ticket)} className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:theme-muted-bg">
                                <div>
                                    <p className="theme-text font-medium">{ticket.subject}</p>
                                    <p className="theme-secondary-text text-xs">
                                        {TICKET_CATEGORY_LABELS[ticket.category]} · {new Date(ticket.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_CLASS[ticket.status]}`}>
                                    {TICKET_STATUS_LABELS[ticket.status]}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
