'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Loader2, Swords, X } from 'lucide-react';
import { useAuth } from '@/app/utils/AuthContext';
import { getSupabaseClient } from '@/app/utils/supabaseClient';
import { fetchFollowingIds } from '@/app/utils/profileStore';
import { acceptChallenge, createChallenge, declineChallenge, fetchChallenges, type Challenge } from '@/app/utils/challengeStore';
import { CATEGORIES, CATEGORY_LABELS, DIFFICULTY_LABELS, type Category } from '@/app/components/EarTraining';
import { DIFFICULTY_LEVELS, type EarTrainingDifficulty } from '@/app/utils/earTrainingData';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';

const CHALLENGE_LENGTHS = [10, 20, 50];

interface ProfileRow {
    user_id: string;
    username: string;
    display_name: string | null;
}

interface FriendOption {
    userId: string;
    username: string;
    displayName: string | null;
}

function Centered({ children }: { children: React.ReactNode }) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center theme-secondary-text">{children}</div>;
}

export default function ChallengesPage() {
    const { user, loading: authLoading } = useAuth();
    const t = useTranslations('social');
    const [loading, setLoading] = useState(true);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [profilesById, setProfilesById] = useState<Map<string, ProfileRow>>(new Map());
    const [friends, setFriends] = useState<FriendOption[]>([]);
    const [showNewChallenge, setShowNewChallenge] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState('');
    const [category, setCategory] = useState<Category>(CATEGORIES[0]);
    const [difficulty, setDifficulty] = useState<EarTrainingDifficulty>(DIFFICULTY_LEVELS[0]);
    const [length, setLength] = useState(CHALLENGE_LENGTHS[0]);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    // Same two-query-then-join-in-memory shape as the leaderboard page: pull
    // the challenge rows, then separately fetch profiles for everyone
    // involved, since challenges has no FK to profiles to embed via.
    const load = useCallback(async () => {
        const supabase = getSupabaseClient();
        if (!supabase || !user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const [challengeRows, followingIds] = await Promise.all([
            fetchChallenges(supabase, user.id),
            fetchFollowingIds(supabase, user.id),
        ]);
        setChallenges(challengeRows);

        const involvedIds = Array.from(new Set(challengeRows.flatMap((c) => [c.challengerId, c.challengeeId])));
        if (involvedIds.length > 0) {
            const { data } = await supabase.from('profiles').select('user_id, username, display_name').in('user_id', involvedIds);
            setProfilesById(new Map(((data ?? []) as ProfileRow[]).map((row) => [row.user_id, row])));
        } else {
            setProfilesById(new Map());
        }

        if (followingIds.length > 0) {
            const { data } = await supabase.from('profiles').select('user_id, username, display_name').in('user_id', followingIds);
            setFriends(((data ?? []) as ProfileRow[]).map((row) => ({ userId: row.user_id, username: row.username, displayName: row.display_name })));
        } else {
            setFriends([]);
        }

        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (authLoading) return;
        void (async () => {
            await load();
        })();
    }, [authLoading, load]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = getSupabaseClient();
        if (!supabase || !user || !selectedFriend) return;
        setCreating(true);
        setCreateError(null);
        const result = await createChallenge(supabase, user.id, selectedFriend, { category, difficulty, length });
        setCreating(false);
        if (result.error) {
            setCreateError(result.error);
            return;
        }
        setShowNewChallenge(false);
        setSelectedFriend('');
        void load();
    };

    const handleAccept = async (challengeId: string) => {
        const supabase = getSupabaseClient();
        if (!supabase) return;
        setBusyId(challengeId);
        await acceptChallenge(supabase, challengeId);
        await load();
        setBusyId(null);
    };

    const handleDecline = async (challengeId: string) => {
        const supabase = getSupabaseClient();
        if (!supabase) return;
        setBusyId(challengeId);
        await declineChallenge(supabase, challengeId);
        await load();
        setBusyId(null);
    };

    if (authLoading || loading) {
        return (
            <Centered>
                <Loader2 className="animate-spin mx-auto" size={24} />
            </Centered>
        );
    }

    if (!getSupabaseClient()) {
        return <Centered>{t.challenges.cloudSyncRequired}</Centered>;
    }

    if (!user) {
        return <Centered>{t.challenges.signInToChallenge}</Centered>;
    }

    return (
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
            <div className="flex items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold theme-text flex items-center gap-2">
                    <Swords size={24} /> {t.challenges.title}
                </h1>
                <button
                    onClick={() => setShowNewChallenge((v) => !v)}
                    className="px-4 py-2 theme-btn rounded-lg text-sm font-medium hover:opacity-90"
                >
                    {t.challenges.newChallenge}
                </button>
            </div>

            {showNewChallenge && (
                <form onSubmit={handleCreate} className="theme-card rounded-xl shadow-lg p-6 mb-6 space-y-3">
                    <div>
                        <label className="block text-sm theme-secondary-text mb-1">{t.challenges.challengeWho}</label>
                        {friends.length === 0 ? (
                            <p className="text-sm theme-secondary-text">
                                {t.challenges.notFollowingAnyone}
                            </p>
                        ) : (
                            <select
                                value={selectedFriend}
                                onChange={(e) => setSelectedFriend(e.target.value)}
                                required
                                className="w-full rounded-lg theme-muted-bg theme-text px-3 py-2 text-sm outline-none"
                            >
                                <option value="">{t.challenges.selectFriend}</option>
                                {friends.map((friend) => (
                                    <option key={friend.userId} value={friend.userId}>
                                        {friend.displayName || friend.username}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm theme-secondary-text mb-1">{t.challenges.category}</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                        category === cat ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'
                                    }`}
                                >
                                    {CATEGORY_LABELS[cat]}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm theme-secondary-text mb-1">{t.challenges.difficulty}</label>
                        <div className="flex flex-wrap gap-2">
                            {DIFFICULTY_LEVELS.map((level) => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setDifficulty(level)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                        difficulty === level ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'
                                    }`}
                                >
                                    {DIFFICULTY_LABELS[level]}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm theme-secondary-text mb-1">{t.challenges.length}</label>
                        <div className="flex flex-wrap gap-2">
                            {CHALLENGE_LENGTHS.map((len) => (
                                <button
                                    key={len}
                                    type="button"
                                    onClick={() => setLength(len)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                        length === len ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'
                                    }`}
                                >
                                    {len}
                                </button>
                            ))}
                        </div>
                    </div>
                    {createError && <p className="text-sm text-red-400">{createError}</p>}
                    <button
                        type="submit"
                        disabled={creating || friends.length === 0}
                        className="px-4 py-2 theme-btn rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                        {creating ? t.challenges.sending : t.challenges.sendChallenge}
                    </button>
                </form>
            )}

            {challenges.length === 0 ? (
                <p className="theme-secondary-text text-center py-16">{t.challenges.noChallengesYet}</p>
            ) : (
                <ul className="theme-card rounded-xl shadow-lg divide-y divide-white/10 overflow-hidden">
                    {challenges.map((challenge) => {
                        const isChallenger = challenge.challengerId === user.id;
                        const opponentId = isChallenger ? challenge.challengeeId : challenge.challengerId;
                        const opponent = profilesById.get(opponentId);
                        const opponentName = opponent?.display_name || opponent?.username || t.challenges.unknownOpponent;
                        const myScore = isChallenger ? challenge.challengerScore : challenge.challengeeScore;
                        const opponentScore = isChallenger ? challenge.challengeeScore : challenge.challengerScore;

                        return (
                            <li key={challenge.id} className="flex items-center justify-between gap-4 px-4 py-3">
                                <div>
                                    <p className="theme-text font-medium">
                                        {isChallenger ? t.challenges.youChallenged : t.challenges.challengeFrom}
                                        {opponentName}
                                    </p>
                                    <p className="theme-secondary-text text-xs">
                                        {CATEGORY_LABELS[challenge.category]} · {DIFFICULTY_LABELS[challenge.difficulty]} · {t.challenges.questionsCount(challenge.length)}
                                    </p>
                                    {challenge.status === 'completed' && (
                                        <p className="theme-secondary-text text-xs mt-1">
                                            {t.challenges.scoreLine(myScore ?? 0, opponentScore ?? 0)}
                                            {challenge.winnerId === user.id
                                                ? t.challenges.youWon
                                                : challenge.winnerId === opponentId
                                                ? t.challenges.youLost
                                                : t.challenges.tie}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {challenge.status === 'pending' && !isChallenger && (
                                        <>
                                            <button
                                                onClick={() => handleAccept(challenge.id)}
                                                disabled={busyId === challenge.id}
                                                className="flex items-center gap-1 px-3 py-1.5 theme-btn rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                                            >
                                                <Check size={14} /> {t.challenges.accept}
                                            </button>
                                            <button
                                                onClick={() => handleDecline(challenge.id)}
                                                disabled={busyId === challenge.id}
                                                className="flex items-center gap-1 px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                                            >
                                                <X size={14} /> {t.challenges.decline}
                                            </button>
                                        </>
                                    )}
                                    {challenge.status === 'pending' && isChallenger && (
                                        <span className="theme-secondary-text text-sm">{t.challenges.waiting}</span>
                                    )}
                                    {challenge.status === 'active' && myScore === null && (
                                        <Link
                                            href={`/app/ear-training?focus=${challenge.category}&difficulty=${challenge.difficulty}&length=${challenge.length}&challenge=${challenge.id}`}
                                            className="px-3 py-1.5 theme-btn rounded-lg text-sm hover:opacity-90"
                                        >
                                            {t.challenges.play}
                                        </Link>
                                    )}
                                    {challenge.status === 'active' && myScore !== null && (
                                        <span className="theme-secondary-text text-sm">{t.challenges.waitingForOpponent}</span>
                                    )}
                                    {challenge.status === 'declined' && <span className="theme-secondary-text text-sm">{t.challenges.declined}</span>}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
