'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Locale, DEFAULT_LOCALE, isLocale } from './locale';
import { dictionaries } from './dictionaries';

interface LocaleContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = 'locale';

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

    // Reads localStorage only after mount, matching this codebase's existing
    // hydration-safety convention (see Footer.tsx's star generation) so the
    // server-rendered/static-export markup always matches the initial client render.
    // Falls back to the browser's preferred language when no stored preference exists.
    useEffect(() => {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (isLocale(stored)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLocaleState(stored);
        } else {
            const browserLang = (navigator.language ?? '').toLowerCase();
            if (browserLang.startsWith('ro')) setLocaleState('ro');
        }
    }, []);

    const setLocale = useCallback((next: Locale) => {
        setLocaleState(next);
        window.localStorage.setItem(STORAGE_KEY, next);
    }, []);

    return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
    const ctx = useContext(LocaleContext);
    if (!ctx) throw new Error('useLocale must be used within a LocaleProvider');
    return ctx;
}

export function useTranslations<K extends keyof typeof dictionaries>(namespace: K): (typeof dictionaries)[K][Locale] {
    const { locale } = useLocale();
    return dictionaries[namespace][locale];
}
