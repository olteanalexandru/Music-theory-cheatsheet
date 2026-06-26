"use client";

import { useEffect, useState } from "react";

interface MushroomElement {
  id: number;
  left: number;
  size: number;
  riseDuration: number;
  riseDelay: number;
  hueDuration: number;
  hueDelay: number;
  drift: number;
}

const Mushrooms = () => {
  const [mushrooms, setMushrooms] = useState<MushroomElement[]>([]);

  // Math.random()-driven, so generated client-side only after mount to avoid
  // a hydration mismatch (same approach as Footer's star field).
  useEffect(() => {
    const items: MushroomElement[] = [...Array(10)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 14 + 12,
      riseDuration: Math.random() * 14 + 14,
      riseDelay: Math.random() * -28,
      hueDuration: Math.random() * 6 + 4,
      hueDelay: Math.random() * -10,
      drift: Math.random() * 80 - 40,
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMushrooms(items);
  }, []);

  return (
    <div className="psychedelic-mushroom-field" aria-hidden="true">
      {mushrooms.map((m) => (
        <span
          key={m.id}
          className="psychedelic-mushroom"
          style={
            {
              left: `${m.left}%`,
              fontSize: `${m.size}px`,
              animationDuration: `${m.riseDuration}s, ${m.hueDuration}s`,
              animationDelay: `${m.riseDelay}s, ${m.hueDelay}s`,
              "--mushroom-drift": `${m.drift}px`,
            } as React.CSSProperties
          }
        >
          🍄
        </span>
      ))}
    </div>
  );
};

export default Mushrooms;
