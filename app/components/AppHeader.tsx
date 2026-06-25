'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, LogOut, UserCircle, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/app/utils/AuthContext';
import AuthModal from '@/app/components/AuthModal';

const APP_NAV_LINKS = [
    { href: '/app', label: 'Practice' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/profile', label: 'Profile' },
];

const AppHeader: React.FC = () => {
    const { user, loading, signOut } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();
    const isMarketing = pathname === '/';

    useEffect(() => {
        if (!showMenu) return;
        const onClickAway = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
        };
        document.addEventListener('mousedown', onClickAway);
        return () => document.removeEventListener('mousedown', onClickAway);
    }, [showMenu]);

    const navLink = (href: string, label: string, extraClass = '') => (
        <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                pathname === href ? 'theme-accent-bg' : 'theme-secondary-text hover:opacity-90'
            } ${extraClass}`}
        >
            {label}
        </Link>
    );

    return (
        <header className="sticky top-0 z-40 theme-secondary-bg border-b border-white/10 px-4 md:px-8">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4">
                <Link href={isMarketing ? '/' : '/app'} className="truncate font-semibold theme-text">
                    🎵 Music Theory Cheatsheet
                </Link>

                {!isMarketing && (
                    <nav className="hidden sm:flex items-center gap-1">
                        {APP_NAV_LINKS.map((link) => navLink(link.href, link.label))}
                    </nav>
                )}

                <div className="flex items-center gap-3">
                    {isMarketing && (
                        <Link href="/app" className="px-3 py-1.5 theme-btn rounded-lg text-sm font-medium hover:opacity-90">
                            Get Started
                        </Link>
                    )}

                    {!loading && (
                        <>
                            {user ? (
                                <div ref={menuRef} className="relative">
                                    <button
                                        onClick={() => setShowMenu((v) => !v)}
                                        className="flex items-center gap-2 rounded-lg theme-muted-bg theme-text px-3 py-1.5 text-sm hover:opacity-90"
                                    >
                                        <UserIcon size={16} />
                                        <span className="hidden max-w-[12rem] truncate sm:inline">{user.email}</span>
                                    </button>
                                    {showMenu && (
                                        <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-lg theme-card shadow-xl">
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
                            ) : (
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="flex items-center gap-2 rounded-lg theme-btn px-3 py-1.5 text-sm hover:opacity-90"
                                >
                                    <LogIn size={16} /> Sign in
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {!isMarketing && (
                <nav className="flex sm:hidden items-center gap-1 pb-2 -mt-1 overflow-x-auto">
                    {APP_NAV_LINKS.map((link) => navLink(link.href, link.label))}
                </nav>
            )}

            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        </header>
    );
};

export default AppHeader;
