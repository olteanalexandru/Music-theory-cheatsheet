'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Crown, Loader2, Trophy } from 'lucide-react';
import { useAuth } from '@/app/utils/AuthContext';
import { getSupabaseClient } from '@/app/utils/supabaseClient';
import { fetchFollowingIds } from '@/app/utils/profileStore';
import { levelFromXp, levelTitle } from '@/app/utils/gamificationStore';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';

type Scope = 'global' | 'friends';

interface LeaderboardEntry {
    userId: string;
    username: string;
    displayName: string | null;
    xp: number;
}

interface ProfileRow {
    user_id: string;
    username: string;
    display_name: string | null;
}

export default function LeaderboardPage() {
    const { user } = useAuth();
    const t = useTranslations('social');
    const [scope, setScope] = useState<Scope>('global');
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(() => !!getSupabaseClient());

    useEffect(() => {
        const supabase = getSupabaseClient();
        if (!supabase) return;
        let cancelled = false;

        (async () => {
            setLoading(true);
            let profileRows: ProfileRow[] = [];

            if (scope === 'global') {
                const { data } = await supabase.from('profiles').select('user_id, username, display_name').eq('is_public', true).limit(200);
                profileRows = (data ?? []) as ProfileRow[];
            } else if (user) {
                const followeeIds = await fetchFollowingIds(supabase, user.id);
                if (followeeIds.length > 0) {
                    const { data } = await supabase.from('profiles').select('user_id, username, display_name').in('user_id', followeeIds);
                    profileRows = (data ?? []) as ProfileRow[];
                }
            }

            if (cancelled) return;
            if (profileRows.length === 0) {
                setEntries([]);
                setLoading(false);
                return;
            }

            const { data: gamRows } = await supabase
                .from('gamification')
                .select('user_id, data')
                .in('user_id', profileRows.map((row) => row.user_id));

            if (cancelled) return;

            const xpByUser = new Map<string, number>();
            for (const row of gamRows ?? []) {
                xpByUser.set(row.user_id as string, (row.data as { xp?: number } | null)?.xp ?? 0);
            }

            const ranked = profileRows
                .map((row) => ({
                    userId: row.user_id,
                    username: row.username,
                    displayName: row.display_name,
                    xp: xpByUser.get(row.user_id) ?? 0,
                }))
                .sort((a, b) => b.xp - a.xp);

            setEntries(ranked);
            setLoading(false);
        })();

        return () => {
            cancelled = true;
        };
    }, [scope, user]);

    return (
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
            <div className="flex items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold theme-text flex items-center gap-2">
                    <Trophy size={24} /> {t.leaderboard.title}
                </h1>
                <div className="flex items-center gap-1 theme-muted-bg rounded-lg p-1">
                    <button
                        onClick={() => setScope('global')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                            scope === 'global' ? 'theme-accent-bg' : 'theme-secondary-text hover:opacity-90'
                        }`}
                    >
                        {t.leaderboard.global}
                    </button>
                    <button
                        onClick={() => setScope('friends')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                            scope === 'friends' ? 'theme-accent-bg' : 'theme-secondary-text hover:opacity-90'
                        }`}
                    >
                        {t.leaderboard.friends}
                    </button>
                </div>
            </div>

            {!getSupabaseClient() ? (
                <p className="theme-secondary-text text-center py-16">
                    {t.leaderboard.cloudSyncRequired}
                </p>
            ) : loading ? (
                <div className="flex items-center justify-center py-16 theme-secondary-text">
                    <Loader2 className="animate-spin" size={24} />
                </div>
            ) : scope === 'friends' && !user ? (
                <p className="theme-secondary-text text-center py-16">{t.leaderboard.signInForFriends}</p>
            ) : entries.length === 0 ? (
                <p className="theme-secondary-text text-center py-16">
                    {scope === 'friends' ? t.leaderboard.noFriendsPublic : t.leaderboard.noPublicProfiles}
                </p>
            ) : (
                <ol className="theme-card rounded-xl shadow-lg divide-y divide-white/10 overflow-hidden">
                    {entries.map((entry, index) => {
                        const isMe = entry.userId === user?.id;
                        return (
                            <li key={entry.userId}>
                                <Link
                                    href={`/profile?u=${entry.username}`}
                                    className={`flex items-center gap-4 px-4 py-3 hover:opacity-90 ${isMe ? 'theme-accent-bg' : ''}`}
                                >
                                    <span className="w-8 text-center font-semibold theme-secondary-text">
                                        {index === 0 ? <Crown size={18} className="mx-auto text-yellow-400" /> : index + 1}
                                    </span>
                                    <span className="flex-1 truncate theme-text font-medium">
                                        {entry.displayName || entry.username}
                                        {isMe && <span className="theme-secondary-text font-normal"> ({t.leaderboard.you})</span>}
                                    </span>
                                    <span className="theme-secondary-text text-sm whitespace-nowrap">
                                        {t.leaderboard.levelLine(levelFromXp(entry.xp), levelTitle(levelFromXp(entry.xp)), entry.xp)}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ol>
            )}
        </div>
    );
}
