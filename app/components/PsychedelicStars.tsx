"use client";

import { useEffect, useState } from "react";

interface StarElement {
  id: number;
  top: number;
  left: number;
  size: number;
  color: string;
  twinkleDuration: number;
  twinkleDelay: number;
  hueDuration: number;
  hueDelay: number;
}

const STAR_COLORS = [
  "rgba(236, 72, 153, 0.85)",   // pink
  "rgba(139, 92, 246, 0.85)",   // violet
  "rgba(6, 182, 212, 0.85)",    // cyan
  "rgba(249, 115, 22, 0.85)",   // orange
  "rgba(250, 204, 21, 0.85)",   // yellow
  "rgba(52, 211, 153, 0.85)",   // emerald
];

const PsychedelicStars = () => {
  const [stars, setStars] = useState<StarElement[]>([]);

  useEffect(() => {
    const items: StarElement[] = [...Array(55)].map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2.5 + 1,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      twinkleDuration: Math.random() * 3 + 2,
      twinkleDelay: Math.random() * -5,
      hueDuration: Math.random() * 4 + 3,
      hueDelay: Math.random() * -8,
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStars(items);
  }, []);

  return (
    <div className="psy-star-field" aria-hidden="true">
      {stars.map((s) => (
        <div
          key={s.id}
          className="psy-star"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            backgroundColor: s.color,
            animationDuration: `${s.twinkleDuration}s, ${s.hueDuration}s`,
            animationDelay: `${s.twinkleDelay}s, ${s.hueDelay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default PsychedelicStars;
