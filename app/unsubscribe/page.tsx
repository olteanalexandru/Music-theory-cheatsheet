'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { getSupabaseClient } from '@/app/utils/supabaseClient';
import { unsubscribeFromNewsletter } from '@/app/utils/newsletterStore';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';

function Centered({ children }: { children: React.ReactNode }) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center theme-secondary-text">{children}</div>;
}

function UnsubscribeContent() {
    const t = useTranslations('legal');
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [state, setState] = useState<'loading' | 'done' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        void (async () => {
            const supabase = getSupabaseClient();
            if (!supabase) {
                setState('error');
                setMessage(t.unsubscribe.noCloudSync);
                return;
            }
            if (!token) {
                setState('error');
                setMessage(t.unsubscribe.missingToken);
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
    }, [token, t]);

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
                <p className="theme-text font-medium mb-1">{t.unsubscribe.couldNotUnsubscribe}</p>
                <p>{message}</p>
            </Centered>
        );
    }

    return (
        <Centered>
            <CheckCircle2 className="mx-auto mb-3 text-green-500" size={32} />
            <p className="theme-text font-medium mb-1">{t.unsubscribe.unsubscribed}</p>
            <p>{t.unsubscribe.noMoreEmails}</p>
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
