"use client";

import { useEffect, useState } from "react";

interface Star {
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

const LINKS = [
  { href: "https://www.musictheory.net/", label: "MusicTheory.net" },
  { href: "https://scottsbasslessons.com/", label: "ScottsBassLessons" },
  { href: "https://www.songsterr.com/", label: "Songsterr" },
];

export default function Footer({ isLightMode, toggleLightMode }: FooterProps) {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    setStars(
      Array.from({ length: 50 }, (_, id) => ({
        id,
        width: Math.random() * 3 + 1,
        height: Math.random() * 3 + 1,
        opacity: isLightMode ? Math.random() * 0.4 + 0.2 : Math.random() * 0.5 + 0.3,
        top: Math.random() * 100,
        left: Math.random() * 100,
        duration: Math.random() * 50 + 20,
        delay: Math.random() * -50,
      }))
    );
  }, [isLightMode]);

  return (
    <footer
      className="py-4 relative overflow-hidden"
      style={{ backgroundColor: "var(--card-background)", color: "var(--foreground)" }}
    >
      <div className="container mx-auto flex justify-between items-center relative z-10">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {LINKS.map(({ href, label }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--link-color)" }}>
              {label}
            </a>
          ))}
        </div>
        <button onClick={toggleLightMode} className="btn">
          {isLightMode ? "Dark Mode" : "Light Mode"}
        </button>
      </div>
      <div className="absolute inset-0 z-0">
        {stars.map((star) => (
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
}
