"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import type { AppTheme } from "./ThemeWrapper";
import ShareButton from "./ShareButton";

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
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <a href="https://www.musictheory.net/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link-color)' }}>MusicTheory.net</a>
          <a href="https://scottsbasslessons.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link-color)' }}>ScottsBassLessons</a>
          <a href="https://www.songsterr.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link-color)' }}>Songsterr</a>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ShareButton
            title="Music Theory Cheatsheet"
            text="Check out Music Theory Cheatsheet — an interactive fretboard, ear training, and play-along practice tool!"
            label="Share"
          />

          <div role="group" aria-label="Theme" className="flex items-center gap-1 p-1 rounded-lg theme-muted-bg">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                aria-pressed={theme === option.value}
                title={option.label}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm transition-colors ${
                  theme === option.value ? 'theme-btn' : 'theme-secondary-text hover:opacity-80'
                }`}
              >
                {option.icon}
                <span className="hidden sm:inline">{option.label}</span>
              </button>
            ))}
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
