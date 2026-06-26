'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, MessageCircle, Rss } from 'lucide-react';
import { useAuth } from '@/app/utils/AuthContext';
import { getSupabaseClient } from '@/app/utils/supabaseClient';
import { fetchFollowingIds } from '@/app/utils/profileStore';
import {
    addComment,
    fetchActivityFeed,
    fetchComments,
    fetchReactionSummaries,
    removeReaction,
    setReaction,
    type ActivityComment,
    type ActivityFeedItem,
} from '@/app/utils/activityStore';
import { CATEGORY_LABELS, type Category } from '@/app/components/EarTraining';
import { ACHIEVEMENTS } from '@/app/utils/gamificationStore';

type Scope = 'global' | 'following';

const REACTION_EMOJIS = ['👍', '🎉', '🔥', '😮', '❤️'];

function Centered({ children }: { children: React.ReactNode }) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center theme-secondary-text">{children}</div>;
}

function describeActivity(item: ActivityFeedItem): string {
    switch (item.type) {
        case 'achievement_unlocked': {
            const id = item.data.achievementId as string | undefined;
            const title = (item.data.title as string | undefined) ?? ACHIEVEMENTS.find((a) => a.id === id)?.title ?? 'an achievement';
            return `unlocked the "${title}" achievement`;
        }
        case 'level_up':
            return `reached level ${item.data.level ?? '?'}`;
        case 'lesson_complete':
            return 'completed a curriculum lesson';
        case 'challenge_completed': {
            const category = item.data.category as Category | undefined;
            return `finished a ${category ? CATEGORY_LABELS[category] : ''} challenge (${item.data.correct ?? '?'} / ${item.data.total ?? '?'})`;
        }
        default:
            return 'did something noteworthy';
    }
}

function timeAgo(iso: string): string {
    const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function FeedPage() {
    const { user, loading: authLoading } = useAuth();
    const [scope, setScope] = useState<Scope>('global');
    const [items, setItems] = useState<ActivityFeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [reactions, setReactions] = useState<Map<string, { counts: Record<string, number>; viewerEmoji: string | null }>>(new Map());
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [comments, setComments] = useState<Map<string, ActivityComment[]>>(new Map());
    const [commentDrafts, setCommentDrafts] = useState<Map<string, string>>(new Map());

    // Same two-query-then-join-in-memory shape as the leaderboard page:
    // activity_events has no FK to profiles, so fetchActivityFeed already
    // joins usernames in; this just adds the Following-scope user id filter.
    const load = useCallback(async () => {
        const supabase = getSupabaseClient();
        if (!supabase) {
            setLoading(false);
            return;
        }
        setLoading(true);
        let userIds: string[] | undefined;
        if (scope === 'following') {
            if (!user) {
                setItems([]);
                setLoading(false);
                return;
            }
            userIds = await fetchFollowingIds(supabase, user.id);
            if (userIds.length === 0) {
                setItems([]);
                setLoading(false);
                return;
            }
        }
        const feed = await fetchActivityFeed(supabase, { userIds });
        setItems(feed);
        const summaries = await fetchReactionSummaries(supabase, feed.map((item) => item.id), user?.id ?? null);
        setReactions(summaries);
        setLoading(false);
    }, [scope, user]);

    useEffect(() => {
        if (authLoading) return;
        void (async () => {
            await load();
        })();
    }, [authLoading, load]);

    const toggleComments = async (eventId: string) => {
        const supabase = getSupabaseClient();
        if (!supabase) return;
        setExpanded((current) => {
            const next = new Set(current);
            if (next.has(eventId)) next.delete(eventId);
            else next.add(eventId);
            return next;
        });
        if (!comments.has(eventId)) {
            const fetched = await fetchComments(supabase, eventId);
            setComments((current) => new Map(current).set(eventId, fetched));
        }
    };

    const handleAddComment = async (eventId: string) => {
        const supabase = getSupabaseClient();
        if (!supabase || !user) return;
        const body = commentDrafts.get(eventId) ?? '';
        if (!body.trim()) return;
        const result = await addComment(supabase, eventId, user.id, body);
        if (result.error) return;
        setCommentDrafts((current) => new Map(current).set(eventId, ''));
        const fetched = await fetchComments(supabase, eventId);
        setComments((current) => new Map(current).set(eventId, fetched));
    };

    const handleReact = async (eventId: string, emoji: string) => {
        const supabase = getSupabaseClient();
        if (!supabase || !user) return;
        const current = reactions.get(eventId);
        const isSame = current?.viewerEmoji === emoji;
        if (isSame) {
            await removeReaction(supabase, eventId, user.id);
        } else {
            await setReaction(supabase, eventId, user.id, emoji);
        }
        const summaries = await fetchReactionSummaries(supabase, [eventId], user.id);
        setReactions((prev) => {
            const next = new Map(prev);
            next.set(eventId, summaries.get(eventId) ?? { counts: {}, viewerEmoji: null });
            return next;
        });
    };

    if (!getSupabaseClient()) {
        return <Centered>The activity feed requires cloud sync, which isn&apos;t configured for this deployment.</Centered>;
    }

    return (
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-10">
            <div className="flex items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold theme-text flex items-center gap-2">
                    <Rss size={24} /> Activity Feed
                </h1>
                <div className="flex items-center gap-1 theme-muted-bg rounded-lg p-1">
                    <button
                        onClick={() => setScope('global')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                            scope === 'global' ? 'theme-accent-bg' : 'theme-secondary-text hover:opacity-90'
                        }`}
                    >
                        Global
                    </button>
                    <button
                        onClick={() => setScope('following')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                            scope === 'following' ? 'theme-accent-bg' : 'theme-secondary-text hover:opacity-90'
                        }`}
                    >
                        Following
                    </button>
                </div>
            </div>

            {authLoading || loading ? (
                <div className="flex items-center justify-center py-16 theme-secondary-text">
                    <Loader2 className="animate-spin" size={24} />
                </div>
            ) : scope === 'following' && !user ? (
                <p className="theme-secondary-text text-center py-16">Sign in to see activity from people you follow.</p>
            ) : items.length === 0 ? (
                <p className="theme-secondary-text text-center py-16">
                    {scope === 'following' ? "No activity yet from people you follow." : 'No activity yet.'}
                </p>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => {
                        const summary = reactions.get(item.id) ?? { counts: {}, viewerEmoji: null };
                        return (
                            <div key={item.id} className="theme-card rounded-xl shadow-lg p-4">
                                <div className="flex items-center justify-between gap-2">
                                    <Link href={`/profile?u=${item.username}`} className="theme-text font-medium hover:opacity-90">
                                        {item.displayName || item.username}
                                    </Link>
                                    <span className="theme-secondary-text text-xs">{timeAgo(item.createdAt)}</span>
                                </div>
                                <p className="theme-secondary-text text-sm mt-1">{describeActivity(item)}</p>

                                <div className="flex flex-wrap items-center gap-1 mt-3">
                                    {REACTION_EMOJIS.map((emoji) => {
                                        const count = summary.counts[emoji] ?? 0;
                                        const isMine = summary.viewerEmoji === emoji;
                                        return (
                                            <button
                                                key={emoji}
                                                onClick={() => handleReact(item.id, emoji)}
                                                disabled={!user}
                                                className={`px-2 py-1 rounded-lg text-sm transition-colors disabled:opacity-50 ${
                                                    isMine ? 'theme-accent-bg' : 'theme-muted-bg hover:opacity-90'
                                                }`}
                                            >
                                                {emoji} {count > 0 && <span className="text-xs">{count}</span>}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => toggleComments(item.id)}
                                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm theme-muted-bg theme-secondary-text hover:opacity-90 ml-auto"
                                    >
                                        <MessageCircle size={14} /> Comments
                                    </button>
                                </div>

                                {expanded.has(item.id) && (
                                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                                        {(comments.get(item.id) ?? []).map((comment) => (
                                            <p key={comment.id} className="text-sm theme-secondary-text">
                                                <span className="theme-text font-medium">{comment.authorUsername}</span> {comment.body}
                                            </p>
                                        ))}
                                        {(comments.get(item.id) ?? []).length === 0 && (
                                            <p className="text-sm theme-secondary-text">No comments yet.</p>
                                        )}
                                        {user && (
                                            <div className="flex items-center gap-2 pt-1">
                                                <input
                                                    value={commentDrafts.get(item.id) ?? ''}
                                                    onChange={(e) =>
                                                        setCommentDrafts((current) => new Map(current).set(item.id, e.target.value))
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') void handleAddComment(item.id);
                                                    }}
                                                    placeholder="Add a comment…"
                                                    maxLength={500}
                                                    className="flex-1 rounded-lg theme-muted-bg theme-text px-3 py-1.5 text-sm outline-none"
                                                />
                                                <button
                                                    onClick={() => handleAddComment(item.id)}
                                                    className="px-3 py-1.5 theme-btn rounded-lg text-sm hover:opacity-90"
                                                >
                                                    Post
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
