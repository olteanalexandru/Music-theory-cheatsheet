"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import type { AppTheme } from "./ThemeWrapper";
import ShareButton from "./ShareButton";
import { getSupabaseClient } from "@/app/utils/supabaseClient";
import { subscribeToNewsletter } from "@/app/utils/newsletterStore";
import { useLocale, useTranslations } from "@/app/utils/i18n/LocaleContext";
import { LOCALES, LOCALE_LABELS } from "@/app/utils/i18n/locale";

interface StarElement {
  id: number;
  width: number;
  height: number;
  opacity: number;
  top: number;
  left: number;
  duration: number;
  delay: number;
}

interface FooterProps {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const THEME_OPTIONS: { value: AppTheme; label: string; icon: React.ReactNode }[] = [
  { value: "dark", label: "Dark", icon: <Moon size={14} /> },
  { value: "light", label: "Light", icon: <Sun size={14} /> },
  { value: "psychedelic", label: "Psychedelic", icon: <span aria-hidden="true">🍄</span> },
];

const Footer = ({ theme, setTheme }: FooterProps) => {
  const [starElements, setStarElements] = useState<StarElement[]>([]);
  const isLightMode = theme === "light";
  const isConfigured = !!getSupabaseClient();
  const { locale, setLocale } = useLocale();
  const t = useTranslations("common");

  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeResult, setSubscribeResult] = useState<{ ok: boolean; text: string } | null>(null);

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase || !email.trim()) return;
    setSubscribing(true);
    setSubscribeResult(null);
    const { error } = await subscribeToNewsletter(supabase, email.trim());
    if (error) {
      setSubscribeResult({ ok: false, text: error });
    } else {
      setSubscribeResult({ ok: true, text: "You're subscribed!" });
      setEmail("");
    }
    setSubscribing(false);
  };

  // Stars use Math.random(), so they must be generated client-side only,
  // after mount, to avoid a hydration mismatch against the static export.
  useEffect(() => {
    const stars: StarElement[] = [...Array(50)].map((_, i) => ({
      id: i,
      width: Math.random() * 3 + 1,
      height: Math.random() * 3 + 1,
      opacity: isLightMode ? Math.random() * 0.4 + 0.2 : Math.random() * 0.5 + 0.3,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: Math.random() * 50 + 20,
      delay: Math.random() * -50,
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStarElements(stars);
  }, [isLightMode]); // Re-generate when light mode changes

  return (
    <footer className="py-4 relative overflow-hidden" style={{ backgroundColor: 'var(--card-background)', color: 'var(--foreground)' }}>
      <div className="container mx-auto relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-3 mb-3 border-b border-white/10">
          <form onSubmit={handleSubscribe} className="flex flex-col gap-1.5 max-w-sm w-full sm:w-auto">
            <label htmlFor="newsletter-email" className="text-sm font-medium">
              {t.footer.newsletterTitle}
            </label>
            <div className="flex gap-2">
              <input
                id="newsletter-email"
                type="email"
                required
                disabled={!isConfigured || subscribing}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.footer.emailPlaceholder}
                className="flex-1 min-w-0 rounded-md theme-muted-bg theme-text px-3 py-1.5 text-sm outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isConfigured || subscribing}
                className="shrink-0 px-3 py-1.5 theme-btn rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {t.footer.subscribe}
              </button>
            </div>
            {!isConfigured ? (
              <p className="text-xs theme-secondary-text">{t.footer.newsletterUnconfigured}</p>
            ) : (
              <>
                {subscribeResult && (
                  <p className={`text-xs ${subscribeResult.ok ? 'text-green-500' : 'text-red-500'}`}>{subscribeResult.text}</p>
                )}
                <p className="text-xs theme-secondary-text">
                  {t.footer.privacyAgreement} <Link href="/privacy" className="underline hover:opacity-80">{t.footer.privacy}</Link>. Unsubscribe anytime.
                </p>
              </>
            )}
          </form>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <Link href="/terms" style={{ color: 'var(--link-color)' }}>{t.footer.terms}</Link>
            <Link href="/privacy" style={{ color: 'var(--link-color)' }}>{t.footer.privacy}</Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <a href="https://www.musictheory.net/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link-color)' }}>MusicTheory.net</a>
            <a href="https://scottsbasslessons.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link-color)' }}>ScottsBassLessons</a>
            <a href="https://www.songsterr.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link-color)' }}>Songsterr</a>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ShareButton
              title="Music Theory Cheatsheet"
              text="Check out Music Theory Cheatsheet — an interactive fretboard, ear training, and play-along practice tool!"
              label={t.footer.share}
            />

            <div role="group" aria-label={t.footer.themeLabel} className="flex items-center gap-1 p-1 rounded-lg theme-muted-bg">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  aria-pressed={theme === option.value}
                  title={t.footer.themes[option.value]}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm transition-colors ${
                    theme === option.value ? 'theme-btn' : 'theme-secondary-text hover:opacity-80'
                  }`}
                >
                  {option.icon}
                  {option.value !== 'psychedelic' && (
                    <span className="hidden sm:inline">{t.footer.themes[option.value]}</span>
                  )}
                </button>
              ))}
            </div>

            <div role="group" aria-label={t.language.label} className="flex items-center gap-1 p-1 rounded-lg theme-muted-bg">
              {LOCALES.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocale(loc)}
                  aria-pressed={locale === loc}
                  title={LOCALE_LABELS[loc]}
                  className={`px-2.5 py-1 rounded-md text-sm font-medium uppercase transition-colors ${
                    locale === loc ? 'theme-btn' : 'theme-secondary-text hover:opacity-80'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 z-0">
        {starElements.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full animate-galaxy"
            style={{
              width: `${star.width}px`,
              height: `${star.height}px`,
              backgroundColor: isLightMode
                ? `rgba(0, 0, 0, ${star.opacity})`
                : `rgba(255, 255, 255, ${star.opacity})`,
              top: `${star.top}%`,
              left: `${star.left}%`,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>
    </footer>
  );
};

export default Footer;
