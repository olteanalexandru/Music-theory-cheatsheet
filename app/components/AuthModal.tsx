'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/app/utils/AuthContext';

interface AuthModalProps {
    onClose: () => void;
}

type Mode = 'signIn' | 'signUp' | 'magicLink';

const MODE_LABEL: Record<Mode, string> = {
    signIn: 'Sign in',
    signUp: 'Create account',
    magicLink: 'Email me a link',
};

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.61z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.85.86-3.06.86-2.35 0-4.34-1.58-5.05-3.71H.9v2.33A8.997 8.997 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.95 10.71A5.41 5.41 0 0 1 3.66 9c0-.59.1-1.17.29-1.71V4.96H.9A8.997 8.997 0 0 0 0 9c0 1.45.35 2.83.9 4.04l3.05-2.33z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A8.59 8.59 0 0 0 9 0 8.997 8.997 0 0 0 .9 4.96L3.95 7.3C4.66 5.16 6.65 3.58 9 3.58z" />
        </svg>
    );
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const { isConfigured, signInWithPassword, signUp, signInWithMagicLink, signInWithGoogle } = useAuth();
    const [mode, setMode] = useState<Mode>('signIn');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setInfo(null);
        setSubmitting(true);
        try {
            if (mode === 'signIn') {
                const result = await signInWithPassword(email, password);
                if (result.error) setError(result.error);
                else onClose();
            } else if (mode === 'signUp') {
                const result = await signUp(email, password);
                if (result.error) setError(result.error);
                else setInfo('Account created — check your email to confirm it, then sign in.');
            } else {
                const result = await signInWithMagicLink(email);
                if (result.error) setError(result.error);
                else setInfo('Check your email for a sign-in link.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogle = async () => {
        setError(null);
        const result = await signInWithGoogle();
        if (result.error) setError(result.error);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="theme-card relative w-full max-w-sm rounded-xl p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={MODE_LABEL[mode]}
            >
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-3 top-3 theme-secondary-text hover:opacity-80"
                >
                    <X size={18} />
                </button>

                <h2 className="text-xl font-bold theme-text mb-1">{MODE_LABEL[mode]}</h2>
                <p className="theme-secondary-text text-sm mb-4">
                    Sign in to save your practice progress and Play Along files across devices.
                </p>

                {!isConfigured && (
                    <p className="mb-4 text-sm theme-warning-text theme-warning-bg border theme-warning-border rounded-lg px-3 py-2">
                        Cloud sync isn&apos;t configured for this deployment yet — sign-in is unavailable.
                    </p>
                )}

                <button
                    onClick={handleGoogle}
                    disabled={!isConfigured || submitting}
                    className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg theme-muted-bg theme-text px-4 py-2 font-medium hover:opacity-90 disabled:opacity-50"
                >
                    <GoogleIcon /> Continue with Google
                </button>

                <div className="mb-4 flex items-center gap-2">
                    <div className="h-px flex-1 theme-muted-bg" />
                    <span className="text-xs theme-secondary-text">or</span>
                    <div className="h-px flex-1 theme-muted-bg" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        type="email"
                        required
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!isConfigured}
                        className="w-full rounded-lg theme-muted-bg theme-text px-3 py-2 text-sm outline-none disabled:opacity-50"
                    />
                    {mode !== 'magicLink' && (
                        <input
                            type="password"
                            required
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={!isConfigured}
                            minLength={6}
                            className="w-full rounded-lg theme-muted-bg theme-text px-3 py-2 text-sm outline-none disabled:opacity-50"
                        />
                    )}

                    {error && <p className="text-sm text-red-400">{error}</p>}
                    {info && <p className="text-sm text-green-400">{info}</p>}

                    <button
                        type="submit"
                        disabled={!isConfigured || submitting}
                        className="w-full rounded-lg theme-btn px-4 py-2 font-medium hover:opacity-90 disabled:opacity-50"
                    >
                        {submitting ? 'Please wait…' : MODE_LABEL[mode]}
                    </button>
                </form>

                <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm">
                    {mode !== 'signIn' && (
                        <button onClick={() => setMode('signIn')} className="text-indigo-400 hover:underline">
                            Sign in
                        </button>
                    )}
                    {mode !== 'signUp' && (
                        <button onClick={() => setMode('signUp')} className="text-indigo-400 hover:underline">
                            Create account
                        </button>
                    )}
                    {mode !== 'magicLink' && (
                        <button onClick={() => setMode('magicLink')} className="text-indigo-400 hover:underline">
                            Email me a link instead
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
