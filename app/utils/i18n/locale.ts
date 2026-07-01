export type Locale = 'en' | 'ro';

export const LOCALES: Locale[] = ['en', 'ro'];

export const LOCALE_LABELS: Record<Locale, string> = {
    en: 'English',
    ro: 'Română',
};

export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: string | null): value is Locale {
    return value === 'en' || value === 'ro';
}
