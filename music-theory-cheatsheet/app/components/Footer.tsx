"use client"; // Add this directive to mark as client component

import { useState, useEffect } from 'react';

const Footer = ({ isLightMode, toggleLightMode }) => {
  const [starElements, setStarElements] = useState([]);

  // Generate stars only on client-side after component mounts
  useEffect(() => {
    const stars = [...Array(50)].map((_, i) => ({
      id: i,
      width: Math.random() * 3 + 1,
      height: Math.random() * 3 + 1,
      opacity: isLightMode ? Math.random() * 0.4 + 0.2 : Math.random() * 0.5 + 0.3,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: Math.random() * 50 + 20,
      delay: Math.random() * -50,
    }));
    setStarElements(stars);
  }, [isLightMode]); // Re-generate when light mode changes

  return (
    <footer className={`py-4 relative overflow-hidden`} style={{ backgroundColor: 'var(--card-background)', color: 'var(--foreground)' }}>
      <div className="container mx-auto flex justify-between items-center relative z-10">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <a href="https://www.musictheory.net/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link-color)' }}>MusicTheory.net</a>
          <a href="https://scottsbasslessons.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link-color)' }}>ScottsBassLessons</a>
          <a href="https://www.songsterr.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link-color)' }}>Songsterr</a>
        </div>
        <button
          onClick={toggleLightMode}
          className="btn"
        >
          {isLightMode ? 'Dark Mode' : 'Light Mode'}
        </button>
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
