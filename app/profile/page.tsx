'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Lock, Pencil, Trophy, UserMinus, UserPlus } from 'lucide-react';
import { useAuth } from '@/app/utils/AuthContext';
import { getSupabaseClient } from '@/app/utils/supabaseClient';
import {
    fetchFollowerCount,
    fetchFollowingCount,
    fetchGamificationForUser,
    fetchProfileByUserId,
    fetchProfileByUsername,
    followUser,
    isFollowing as checkIsFollowing,
    isValidUsername,
    saveProfile,
    unfollowUser,
    type Profile,
} from '@/app/utils/profileStore';
import { ACHIEVEMENTS, levelProgress, levelTitle } from '@/app/utils/gamificationStore';
import { bestStreakAcrossCategories, loadProgress } from '@/app/utils/progressStore';
import LevelBadge from '@/app/components/LevelBadge';

function Centered({ children }: { children: React.ReactNode }) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center theme-secondary-text">{children}</div>;
}

function ProfileContent() {
    const { user, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const requestedUsername = searchParams.get('u');

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [xp, setXp] = useState(0);
    const [achievements, setAchievements] = useState<Record<string, number>>({});
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [following, setFollowing] = useState(false);
    const [followBusy, setFollowBusy] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editUsername, setEditUsername] = useState('');
    const [editDisplayName, setEditDisplayName] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editIsPublic, setEditIsPublic] = useState(true);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const isOwnProfile = !requestedUsername || (profile !== null && profile.userId === user?.id);

    const load = useCallback(async () => {
        const supabase = getSupabaseClient();
        if (!supabase) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setNotFound(false);

        const targetProfile = requestedUsername
            ? await fetchProfileByUsername(supabase, requestedUsername)
            : user
            ? await fetchProfileByUserId(supabase, user.id)
            : null;

        if (requestedUsername && !targetProfile) {
            setNotFound(true);
            setProfile(null);
            setLoading(false);
            return;
        }

        setProfile(targetProfile);

        if (targetProfile) {
            setEditUsername(targetProfile.username);
            setEditDisplayName(targetProfile.displayName ?? '');
            setEditBio(targetProfile.bio ?? '');
            setEditIsPublic(targetProfile.isPublic);

            const viewerIsOwner = !!user && user.id === targetProfile.userId;
            const visible = targetProfile.isPublic || viewerIsOwner;
            if (visible) {
                const [gam, followers, followingN] = await Promise.all([
                    fetchGamificationForUser(supabase, targetProfile.userId),
                    fetchFollowerCount(supabase, targetProfile.userId),
                    fetchFollowingCount(supabase, targetProfile.userId),
                ]);
                setXp(gam?.xp ?? 0);
                setAchievements(gam?.achievements ?? {});
                setFollowerCount(followers);
                setFollowingCount(followingN);
            }
            if (user && !viewerIsOwner) {
                setFollowing(await checkIsFollowing(supabase, user.id, targetProfile.userId));
            }
        } else if (!requestedUsername && user) {
            setEditUsername('');
            setEditDisplayName('');
            setEditBio('');
            setEditIsPublic(true);
            setEditing(true);
        }

        setLoading(false);
    }, [requestedUsername, user]);

    useEffect(() => {
        if (authLoading) return;
        void (async () => {
            await load();
        })();
    }, [authLoading, load]);

    const handleFollow = async () => {
        const supabase = getSupabaseClient();
        if (!supabase || !user || !profile) return;
        setFollowBusy(true);
        if (following) {
            await unfollowUser(supabase, user.id, profile.userId);
            setFollowing(false);
            setFollowerCount((count) => Math.max(0, count - 1));
        } else {
            const result = await followUser(supabase, user.id, profile.userId);
            if (!result.error) {
                setFollowing(true);
                setFollowerCount((count) => count + 1);
            }
        }
        setFollowBusy(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = getSupabaseClient();
        if (!supabase || !user) return;
        if (!isValidUsername(editUsername)) {
            setSaveError('Username must be 3-20 characters: lowercase letters, numbers, underscores.');
            return;
        }
        setSaving(true);
        setSaveError(null);
        const result = await saveProfile(supabase, user.id, {
            username: editUsername,
            displayName: editDisplayName,
            bio: editBio,
            isPublic: editIsPublic,
        });
        setSaving(false);
        if (result.error) {
            setSaveError(result.error.toLowerCase().includes('duplicate') ? 'That username is already taken.' : result.error);
            return;
        }
        setEditing(false);
        void load();
    };

    if (authLoading || loading) {
        return (
            <Centered>
                <Loader2 className="animate-spin mx-auto" size={24} />
            </Centered>
        );
    }

    if (!getSupabaseClient()) {
        return <Centered>Profiles require cloud sync, which isn&apos;t configured for this deployment.</Centered>;
    }

    if (notFound) {
        return <Centered>No profile found for that username.</Centered>;
    }

    if (!requestedUsername && !user) {
        return <Centered>Sign in to view your profile.</Centered>;
    }

    if (profile && !profile.isPublic && !isOwnProfile) {
        return (
            <Centered>
                <Lock className="mx-auto mb-2" size={24} />
                This profile is private.
            </Centered>
        );
    }

    if (isOwnProfile && editing) {
        return (
            <div className="max-w-xl mx-auto px-4 md:px-8 py-10">
                <div className="theme-card rounded-xl shadow-lg p-6">
                    <h1 className="text-xl font-bold theme-text mb-4">{profile ? 'Edit profile' : 'Create your profile'}</h1>
                    <form onSubmit={handleSave} className="space-y-3">
                        <div>
                            <label className="block text-sm theme-secondary-text mb-1">Username</label>
                            <input
                                value={editUsername}
                                onChange={(e) => setEditUsername(e.target.value.toLowerCase())}
                                placeholder="lowercase_username"
                                required
                                className="w-full rounded-lg theme-muted-bg theme-text px-3 py-2 text-sm outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm theme-secondary-text mb-1">Display name</label>
                            <input
                                value={editDisplayName}
                                onChange={(e) => setEditDisplayName(e.target.value)}
                                className="w-full rounded-lg theme-muted-bg theme-text px-3 py-2 text-sm outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm theme-secondary-text mb-1">Bio</label>
                            <textarea
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg theme-muted-bg theme-text px-3 py-2 text-sm outline-none resize-none"
                            />
                        </div>
                        <label className="flex items-center gap-2 text-sm theme-secondary-text">
                            <input type="checkbox" checked={editIsPublic} onChange={(e) => setEditIsPublic(e.target.checked)} />
                            Public profile (visible on the leaderboard and to other users)
                        </label>
                        {saveError && <p className="text-sm text-red-400">{saveError}</p>}
                        <div className="flex items-center gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 theme-btn rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                            >
                                {saving ? 'Saving…' : 'Save profile'}
                            </button>
                            {profile && (
                                <button
                                    type="button"
                                    onClick={() => setEditing(false)}
                                    className="px-4 py-2 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    const { level, xpIntoLevel, xpForNextLevel } = levelProgress(xp);
    const bestStreak = isOwnProfile ? bestStreakAcrossCategories(loadProgress()) : null;

    return (
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
            <div className="theme-card rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold theme-text">{profile.displayName || profile.username}</h1>
                        <p className="theme-secondary-text text-sm">@{profile.username}</p>
                    </div>
                    {isOwnProfile ? (
                        <button
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90 shrink-0"
                        >
                            <Pencil size={16} /> Edit profile
                        </button>
                    ) : (
                        user && (
                            <button
                                onClick={handleFollow}
                                disabled={followBusy}
                                className="flex items-center gap-1.5 px-3 py-1.5 theme-btn rounded-lg text-sm hover:opacity-90 disabled:opacity-50 shrink-0"
                            >
                                {following ? (
                                    <>
                                        <UserMinus size={16} /> Unfollow
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={16} /> Follow
                                    </>
                                )}
                            </button>
                        )
                    )}
                </div>

                {profile.bio && <p className="theme-secondary-text mt-3 text-sm">{profile.bio}</p>}

                <div className="flex items-center gap-4 mt-4 text-sm theme-secondary-text">
                    <span>
                        <strong className="theme-text">{followerCount}</strong> Followers
                    </span>
                    <span>
                        <strong className="theme-text">{followingCount}</strong> Following
                    </span>
                    {bestStreak !== null && (
                        <span>
                            <strong className="theme-text">{bestStreak}</strong> Best Streak
                        </span>
                    )}
                </div>
            </div>

            <div className="theme-card rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <LevelBadge level={level} />
                    <div>
                        <p className="theme-text font-semibold">
                            Level {level} <span className="theme-secondary-text font-normal">· {levelTitle(level)}</span>
                        </p>
                        <p className="theme-secondary-text text-xs">
                            {xpIntoLevel} / {xpForNextLevel} XP to next level
                        </p>
                    </div>
                </div>
                <div className="h-2 rounded-full theme-muted-bg overflow-hidden mb-5">
                    <div
                        className="h-full theme-accent-bg"
                        style={{ width: `${xpForNextLevel > 0 ? Math.min(100, (xpIntoLevel / xpForNextLevel) * 100) : 0}%` }}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {ACHIEVEMENTS.map((achievement) => {
                        const unlocked = !!achievements[achievement.id];
                        return (
                            <div
                                key={achievement.id}
                                className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                                    unlocked ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text opacity-60'
                                }`}
                            >
                                {unlocked ? <Trophy size={16} className="shrink-0 mt-0.5" /> : <Lock size={16} className="shrink-0 mt-0.5" />}
                                <div>
                                    <p className="font-medium">{achievement.title}</p>
                                    <p className="text-xs opacity-80">{achievement.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense
            fallback={
                <Centered>
                    <Loader2 className="animate-spin mx-auto" size={24} />
                </Centered>
            }
        >
            <ProfileContent />
        </Suspense>
    );
}
