'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, LogIn, LogOut, Music2, UserCircle, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/app/utils/AuthContext';
import { getSupabaseClient } from '@/app/utils/supabaseClient';
import { fetchNotifications, fetchUnreadCount, markAllRead, type AppNotification } from '@/app/utils/notificationStore';
import AuthModal from '@/app/components/AuthModal';
import ScrollHint from '@/app/components/ScrollHint';

const MARKETING_NAV_LINKS = [
    { href: '/features', label: 'Features' },
    { href: '/community', label: 'Community' },
];

const APP_NAV_LINKS = [
    { href: '/app', label: 'Practice' },
    { href: '/plan', label: 'Plan' },
    { href: '/feed', label: 'Feed' },
    { href: '/challenges', label: 'Challenges' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/profile', label: 'Profile' },
];

const MARKETING_ROUTES = new Set(['/', '/features', '/community']);

const NOTIFICATION_POLL_MS = 60_000;

function notificationText(n: AppNotification): string {
    switch (n.type) {
        case 'follow':
            return `${n.actorUsername} started following you`;
        case 'challenge_invite':
            return `${n.actorUsername} challenged you`;
        case 'challenge_result':
            return `Your challenge with ${n.actorUsername} is finished`;
        case 'comment':
            return `${n.actorUsername} commented on your activity`;
        case 'reaction':
            return `${n.actorUsername} reacted to your activity`;
        default:
            return `${n.actorUsername} did something`;
    }
}

function notificationHref(n: AppNotification): string {
    switch (n.type) {
        case 'follow':
            return `/profile?u=${n.actorUsername}`;
        case 'challenge_invite':
        case 'challenge_result':
            return '/challenges';
        case 'comment':
        case 'reaction':
            return '/feed';
        default:
            return '/feed';
    }
}

function notificationTimeAgo(iso: string): string {
    const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

const AppHeader: React.FC = () => {
    const { user, loading, signOut } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const notificationsRef = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();
    const isMarketing = MARKETING_ROUTES.has(pathname ?? '');

    useEffect(() => {
        if (!showMenu) return;
        const onClickAway = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
        };
        document.addEventListener('mousedown', onClickAway);
        return () => document.removeEventListener('mousedown', onClickAway);
    }, [showMenu]);

    useEffect(() => {
        if (!showNotifications) return;
        const onClickAway = (e: MouseEvent) => {
            if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) setShowNotifications(false);
        };
        document.addEventListener('mousedown', onClickAway);
        return () => document.removeEventListener('mousedown', onClickAway);
    }, [showNotifications]);

    const refreshUnreadCount = useCallback(async () => {
        const supabase = getSupabaseClient();
        if (!supabase || !user) return;
        setUnreadCount(await fetchUnreadCount(supabase, user.id));
    }, [user]);

    // Polling, not realtime, to match the rest of this app's pull-based cloud
    // sync (useCloudSync) rather than introducing a new realtime architecture.
    useEffect(() => {
        if (!user) return;
        void (async () => {
            await refreshUnreadCount();
        })();
        const interval = setInterval(refreshUnreadCount, NOTIFICATION_POLL_MS);
        window.addEventListener('focus', refreshUnreadCount);
        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', refreshUnreadCount);
        };
    }, [user, refreshUnreadCount]);

    const handleToggleNotifications = async () => {
        const opening = !showNotifications;
        setShowNotifications(opening);
        const supabase = getSupabaseClient();
        if (!opening || !supabase || !user) return;
        setNotifications(await fetchNotifications(supabase, user.id));
        if (unreadCount > 0) {
            await markAllRead(supabase, user.id);
            setUnreadCount(0);
        }
    };

    const navLink = (href: string, label: string) => (
        <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                pathname === href ? 'nav-link-active' : 'theme-secondary-text hover:opacity-90'
            }`}
        >
            {label}
        </Link>
    );

    const marketingNavLink = (href: string, label: string) => (
        <Link
            key={href}
            href={href}
            className={`px-1 py-1.5 text-[13px] font-semibold uppercase tracking-wide whitespace-nowrap transition-colors border-b-2 ${
                pathname === href
                    ? 'theme-text border-current'
                    : 'theme-secondary-text border-transparent hover:theme-text'
            }`}
        >
            {label}
        </Link>
    );

    return (
        <header className="sticky top-0 z-40 theme-secondary-bg border-b border-white/10 px-4 md:px-8">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
                <Link
                    href={isMarketing ? '/' : '/app'}
                    className="flex items-center gap-2 truncate font-bold tracking-tight theme-text"
                >
                    <span className="flex items-center justify-center h-7 w-7 shrink-0 rounded-lg theme-btn" aria-hidden="true">
                        <Music2 size={15} />
                    </span>
                    Music Theory
                </Link>

                {isMarketing ? (
                    <nav className="hidden sm:flex items-center gap-6">
                        {MARKETING_NAV_LINKS.map((link) => marketingNavLink(link.href, link.label))}
                    </nav>
                ) : (
                    <nav className="hidden sm:flex items-center gap-1">
                        {APP_NAV_LINKS.map((link) => navLink(link.href, link.label))}
                    </nav>
                )}

                <div className="flex items-center gap-3">
                    {isMarketing && (
                        <Link href="/app" className="px-4 py-1.5 theme-btn rounded-md text-sm font-semibold hover:opacity-90">
                            Get Started
                        </Link>
                    )}

                    {!loading && user && !isMarketing && (
                        <div ref={notificationsRef} className="relative">
                            <button
                                onClick={() => void handleToggleNotifications()}
                                className="relative flex items-center justify-center rounded-md theme-muted-bg theme-text p-2 hover:opacity-90"
                                aria-label="Notifications"
                            >
                                <Bell size={16} />
                                {unreadCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-md theme-card shadow-xl">
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <p className="px-4 py-6 text-center text-sm theme-secondary-text">No notifications yet.</p>
                                        ) : (
                                            notifications.map((n) => (
                                                <Link
                                                    key={n.id}
                                                    href={notificationHref(n)}
                                                    onClick={() => setShowNotifications(false)}
                                                    className="block border-b border-white/10 px-4 py-2.5 text-sm theme-text last:border-b-0 hover:theme-muted-bg"
                                                >
                                                    <p>{notificationText(n)}</p>
                                                    <p className="mt-0.5 text-xs theme-secondary-text">{notificationTimeAgo(n.createdAt)}</p>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!loading && (
                        <>
                            {user ? (
                                <div ref={menuRef} className="relative">
                                    <button
                                        onClick={() => setShowMenu((v) => !v)}
                                        className="flex items-center gap-2 rounded-md theme-muted-bg theme-text px-3 py-1.5 text-sm hover:opacity-90"
                                    >
                                        <UserIcon size={16} />
                                        <span className="hidden max-w-[12rem] truncate sm:inline">{user.email}</span>
                                    </button>
                                    {showMenu && (
                                        <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-md theme-card shadow-xl">
                                            <p className="truncate px-4 py-2 text-xs theme-secondary-text sm:hidden">{user.email}</p>
                                            <Link
                                                href="/profile"
                                                onClick={() => setShowMenu(false)}
                                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm theme-text hover:theme-muted-bg"
                                            >
                                                <UserCircle size={16} /> My Profile
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setShowMenu(false);
                                                    void signOut();
                                                }}
                                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm theme-text hover:theme-muted-bg"
                                            >
                                                <LogOut size={16} /> Sign out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : isMarketing ? (
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="rounded-md px-3 py-2 text-sm font-medium theme-secondary-text hover:theme-text"
                                >
                                    Log in
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="flex items-center gap-2 rounded-md theme-btn px-3 py-1.5 text-sm hover:opacity-90"
                                >
                                    <LogIn size={16} /> Sign in
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {isMarketing ? (
                <ScrollHint as="nav" className="flex sm:hidden items-center gap-4 pb-2 -mt-1">
                    {MARKETING_NAV_LINKS.map((link) => marketingNavLink(link.href, link.label))}
                </ScrollHint>
            ) : (
                <ScrollHint as="nav" className="flex sm:hidden items-center gap-1 pb-2 -mt-1">
                    {APP_NAV_LINKS.map((link) => navLink(link.href, link.label))}
                </ScrollHint>
            )}

            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        </header>
    );
};

export default AppHeader;
