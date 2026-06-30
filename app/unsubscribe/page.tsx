'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { getSupabaseClient } from '@/app/utils/supabaseClient';
import { unsubscribeFromNewsletter } from '@/app/utils/newsletterStore';

function Centered({ children }: { children: React.ReactNode }) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center theme-secondary-text">{children}</div>;
}

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [state, setState] = useState<'loading' | 'done' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        void (async () => {
            const supabase = getSupabaseClient();
            if (!supabase) {
                setState('error');
                setMessage("This deployment doesn't have cloud sync configured, so unsubscribing isn't available.");
                return;
            }
            if (!token) {
                setState('error');
                setMessage('Missing unsubscribe token.');
                return;
            }
            const { error } = await unsubscribeFromNewsletter(supabase, token);
            if (error) {
                setState('error');
                setMessage(error);
            } else {
                setState('done');
            }
        })();
    }, [token]);

    if (state === 'loading') {
        return (
            <Centered>
                <Loader2 className="animate-spin mx-auto" size={24} />
            </Centered>
        );
    }

    if (state === 'error') {
        return (
            <Centered>
                <XCircle className="mx-auto mb-3 text-red-500" size={32} />
                <p className="theme-text font-medium mb-1">Couldn&apos;t unsubscribe</p>
                <p>{message}</p>
            </Centered>
        );
    }

    return (
        <Centered>
            <CheckCircle2 className="mx-auto mb-3 text-green-500" size={32} />
            <p className="theme-text font-medium mb-1">You&apos;re unsubscribed</p>
            <p>You won&apos;t receive any more newsletter emails from us.</p>
        </Centered>
    );
}

export default function UnsubscribePage() {
    return (
        <Suspense
            fallback={
                <Centered>
                    <Loader2 className="animate-spin mx-auto" size={24} />
                </Centered>
            }
        >
            <UnsubscribeContent />
        </Suspense>
    );
}
