'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/app/utils/AuthContext';
import AuthModal from '@/app/components/AuthModal';

const AppHeader: React.FC = () => {
    const { user, loading, signOut } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!showMenu) return;
        const onClickAway = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
        };
        document.addEventListener('mousedown', onClickAway);
        return () => document.removeEventListener('mousedown', onClickAway);
    }, [showMenu]);

    return (
        <header className="sticky top-0 z-40 theme-secondary-bg border-b border-white/10 px-4 md:px-8">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4">
                <span className="truncate font-semibold theme-text">🎵 Music Theory Cheatsheet</span>

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

            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        </header>
    );
};

export default AppHeader;
