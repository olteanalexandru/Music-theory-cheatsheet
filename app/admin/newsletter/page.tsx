'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Loader2, Mail, Quote, Redo, Underline as UnderlineIcon, Undo } from 'lucide-react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useAuth } from '@/app/utils/AuthContext';
import { getSupabaseClient } from '@/app/utils/supabaseClient';
import { fetchProfileByUserId } from '@/app/utils/profileStore';
import { fetchCampaigns, fetchSubscriberCount, sendNewsletter, type NewsletterCampaign } from '@/app/utils/newsletterStore';

function Centered({ children }: { children: React.ReactNode }) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center theme-secondary-text">{children}</div>;
}

function ToolbarButton({
    active,
    onClick,
    label,
    children,
}: {
    active?: boolean;
    onClick: () => void;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            className={`flex items-center justify-center rounded-md px-2 py-1.5 text-xs font-semibold ${
                active ? 'theme-accent-bg' : 'theme-text hover:opacity-70'
            }`}
        >
            {children}
        </button>
    );
}

const EDITOR_CONTENT_CLASS =
    'theme-text px-3 py-3 min-h-[220px] text-sm leading-relaxed ' +
    '[&_.ProseMirror]:outline-none ' +
    '[&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-2 [&_h2]:mb-1 ' +
    '[&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-2 [&_h3]:mb-1 ' +
    '[&_p]:mb-2 ' +
    '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 ' +
    '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 ' +
    '[&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:opacity-80 ' +
    '[&_a]:underline [&_a]:opacity-90';

export default function AdminNewsletterPage() {
    const { user, loading: authLoading } = useAuth();
    const [checkingAdmin, setCheckingAdmin] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [subscriberCount, setSubscriberCount] = useState(0);
    const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);

    const [subject, setSubject] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

    const editor = useEditor({
        extensions: [StarterKit.configure({ link: { openOnClick: false, autolink: true } })],
        content: '',
        immediatelyRender: false,
    });

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
        const [count, history] = await Promise.all([fetchSubscriberCount(supabase), fetchCampaigns(supabase)]);
        setSubscriberCount(count);
        setCampaigns(history);
        setLoading(false);
    }, [isAdmin]);

    useEffect(() => {
        if (checkingAdmin) return;
        void (async () => {
            await load();
        })();
    }, [checkingAdmin, load]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt('Link URL', previousUrl ?? 'https://');
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const handleSend = async () => {
        const supabase = getSupabaseClient();
        if (!supabase || !editor || !subject.trim() || editor.isEmpty) return;
        setSending(true);
        setResult(null);
        const { error, recipientCount } = await sendNewsletter(supabase, { subject: subject.trim(), html: editor.getHTML() });
        if (error) {
            setResult({ ok: false, message: error });
        } else {
            const sentCount = recipientCount ?? subscriberCount;
            setResult({ ok: true, message: `Sent to ${sentCount} subscriber${sentCount === 1 ? '' : 's'}.` });
            setSubject('');
            editor.commands.clearContent();
            await load();
        }
        setSending(false);
        setConfirming(false);
    };

    if (authLoading || checkingAdmin || (isAdmin && loading)) {
        return (
            <Centered>
                <Loader2 className="animate-spin mx-auto" size={24} />
            </Centered>
        );
    }

    if (!getSupabaseClient()) {
        return <Centered>The newsletter composer requires cloud sync, which isn&apos;t configured for this deployment.</Centered>;
    }

    if (!user) {
        return <Centered>Sign in to access the newsletter composer.</Centered>;
    }

    if (!isAdmin) {
        return <Centered>You don&apos;t have access to this page.</Centered>;
    }

    const canSend = subject.trim().length > 0 && !!editor && !editor.isEmpty && subscriberCount > 0;

    return (
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
            <h1 className="text-2xl font-bold theme-text flex items-center gap-2 mb-1">
                <Mail size={24} /> Newsletter
            </h1>
            <p className="theme-secondary-text text-sm mb-6">
                {subscriberCount} subscriber{subscriberCount === 1 ? '' : 's'}.
            </p>

            <div className="theme-card rounded-xl shadow-lg p-4 mb-6">
                <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject"
                    className="w-full rounded-lg theme-muted-bg theme-text px-3 py-2 text-sm font-medium outline-none mb-3"
                />

                <div className="flex flex-wrap items-center gap-1 rounded-t-lg theme-muted-bg px-2 py-1.5">
                    <ToolbarButton label="Bold" active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()}>
                        <Bold size={15} />
                    </ToolbarButton>
                    <ToolbarButton label="Italic" active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()}>
                        <Italic size={15} />
                    </ToolbarButton>
                    <ToolbarButton label="Underline" active={editor?.isActive('underline')} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
                        <UnderlineIcon size={15} />
                    </ToolbarButton>
                    <ToolbarButton label="Heading" active={editor?.isActive('heading', { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
                        H2
                    </ToolbarButton>
                    <ToolbarButton label="Bullet list" active={editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
                        <List size={15} />
                    </ToolbarButton>
                    <ToolbarButton label="Numbered list" active={editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
                        <ListOrdered size={15} />
                    </ToolbarButton>
                    <ToolbarButton label="Quote" active={editor?.isActive('blockquote')} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
                        <Quote size={15} />
                    </ToolbarButton>
                    <ToolbarButton label="Link" active={editor?.isActive('link')} onClick={setLink}>
                        <LinkIcon size={15} />
                    </ToolbarButton>
                    <span className="mx-1 h-4 w-px theme-secondary-text opacity-30" />
                    <ToolbarButton label="Undo" onClick={() => editor?.chain().focus().undo().run()}>
                        <Undo size={15} />
                    </ToolbarButton>
                    <ToolbarButton label="Redo" onClick={() => editor?.chain().focus().redo().run()}>
                        <Redo size={15} />
                    </ToolbarButton>
                </div>
                <EditorContent editor={editor} className={`rounded-b-lg theme-muted-bg ${EDITOR_CONTENT_CLASS}`} />
            </div>

            {result && <p className={`text-sm mb-4 ${result.ok ? 'text-green-500' : 'text-red-500'}`}>{result.message}</p>}

            {!confirming ? (
                <button
                    type="button"
                    disabled={!canSend}
                    onClick={() => setConfirming(true)}
                    className="px-4 py-2 theme-btn rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                >
                    Send to {subscriberCount} subscriber{subscriberCount === 1 ? '' : 's'}
                </button>
            ) : (
                <div className="theme-card rounded-xl p-4 flex flex-wrap items-center gap-3">
                    <p className="theme-text text-sm">
                        Send &ldquo;{subject.trim()}&rdquo; to all {subscriberCount} subscriber{subscriberCount === 1 ? '' : 's'}? This can&apos;t be undone.
                    </p>
                    <div className="flex gap-2 ml-auto">
                        <button
                            type="button"
                            onClick={() => setConfirming(false)}
                            disabled={sending}
                            className="px-3 py-1.5 theme-muted-bg theme-text rounded-lg text-sm disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => void handleSend()}
                            disabled={sending}
                            className="flex items-center gap-1 px-3 py-1.5 theme-btn rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                            {sending && <Loader2 className="animate-spin" size={14} />} Confirm send
                        </button>
                    </div>
                </div>
            )}

            <h2 className="text-lg font-bold theme-text mt-10 mb-3">Send history</h2>
            {campaigns.length === 0 ? (
                <p className="theme-secondary-text text-sm">No newsletters sent yet.</p>
            ) : (
                <ul className="theme-card rounded-xl shadow-lg divide-y divide-white/10 overflow-hidden">
                    {campaigns.map((c) => (
                        <li key={c.id} className="px-4 py-3">
                            <p className="theme-text font-medium">{c.subject}</p>
                            <p className="theme-secondary-text text-xs">
                                {new Date(c.sentAt).toLocaleString()} · {c.recipientCount} recipient{c.recipientCount === 1 ? '' : 's'}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
