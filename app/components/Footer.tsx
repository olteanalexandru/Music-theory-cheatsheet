"use client";

import { useEffect, useState } from "react";
import { FacebookIcon, InstagramIcon, LinkedinIcon } from "./icons/SocialIcons";
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
  isLightMode: boolean;
  toggleLightMode: () => void;
}

const Footer = ({ isLightMode, toggleLightMode }: FooterProps) => {
  const [starElements, setStarElements] = useState<StarElement[]>([]);

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
          <div className="flex items-center gap-2">
            {/* Placeholder social links: not yet wired to real profiles, so clicking just refreshes the page. */}
            <button
              onClick={() => window.location.reload()}
              aria-label="Instagram"
              title="Instagram"
              className="p-1.5 rounded-full theme-muted-bg hover:opacity-90"
            >
              <InstagramIcon size={16} />
            </button>
            <button
              onClick={() => window.location.reload()}
              aria-label="Facebook"
              title="Facebook"
              className="p-1.5 rounded-full theme-muted-bg hover:opacity-90"
            >
              <FacebookIcon size={16} />
            </button>
            <button
              onClick={() => window.location.reload()}
              aria-label="LinkedIn"
              title="LinkedIn"
              className="p-1.5 rounded-full theme-muted-bg hover:opacity-90"
            >
              <LinkedinIcon size={16} />
            </button>
          </div>

          <ShareButton
            title="Music Theory Cheatsheet"
            text="Check out Music Theory Cheatsheet — an interactive fretboard, ear training, and play-along practice tool!"
            label="Share"
          />

          <button
            onClick={toggleLightMode}
            className="btn"
          >
            {isLightMode ? 'Dark Mode' : 'Light Mode'}
          </button>
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
