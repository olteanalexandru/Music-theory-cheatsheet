'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Lock, Sparkles, Trophy } from 'lucide-react';
import {
    ACHIEVEMENTS,
    levelProgress,
    levelTitle,
    loadGamification,
    normalizeStore,
    subscribeToGamificationChanges,
    type GamificationStore,
} from '@/app/utils/gamificationStore';
import ShareButton from '@/app/components/ShareButton';
import { buildShareCardData, renderShareCard } from '@/app/utils/shareCard';
import LevelBadge from '@/app/components/LevelBadge';

const GamificationPanel: React.FC = () => {
    // Starts from the SSR-safe default and loads the real localStorage value
    // in an effect (not the initializer) so the client's first render matches
    // what the server sent, avoiding a hydration mismatch for returning users.
    const [gamification, setGamification] = useState<GamificationStore>(() => normalizeStore(undefined));
    const [showAchievements, setShowAchievements] = useState(false);
    const [leveledUpTo, setLeveledUpTo] = useState<number | null>(null);
    const previousLevelRef = useRef<number | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            const initial = loadGamification();
            previousLevelRef.current = levelProgress(initial.xp).level;
            setGamification(initial);
        }, 0);

        const unsubscribe = subscribeToGamificationChanges((store) => {
            const newLevel = levelProgress(store.xp).level;
            if (previousLevelRef.current !== null && newLevel > previousLevelRef.current) setLeveledUpTo(newLevel);
            previousLevelRef.current = newLevel;
            setGamification(store);
        });

        return () => {
            clearTimeout(timer);
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (leveledUpTo === null) return;
        const timer = setTimeout(() => setLeveledUpTo(null), 4000);
        return () => clearTimeout(timer);
    }, [leveledUpTo]);

    const { level, xpIntoLevel, xpForNextLevel } = levelProgress(gamification.xp);
    const unlockedCount = Object.keys(gamification.achievements).length;

    return (
        <div className="relative mb-6 theme-card rounded-xl shadow-lg p-4 md:p-5">
            {leveledUpTo !== null && (
                <div className="animate-level-up absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full theme-btn text-sm font-semibold shadow-lg whitespace-nowrap">
                    <Sparkles size={14} /> Level Up! You&apos;re now Level {leveledUpTo}
                </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                    <LevelBadge level={level} />
                    <div>
                        <p className="theme-text font-semibold">
                            Level {level} <span className="theme-secondary-text font-normal">· {levelTitle(level)}</span>
                        </p>
                        <p className="theme-secondary-text text-xs">
                            {xpIntoLevel} / {xpForNextLevel} XP to next level
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAchievements((current) => !current)}
                        className="flex items-center gap-1.5 px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90"
                        aria-expanded={showAchievements}
                    >
                        <Trophy size={16} />
                        {unlockedCount} / {ACHIEVEMENTS.length} Achievements
                        {showAchievements ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <ShareButton
                        title="Music Theory Cheatsheet"
                        text={`I'm Level ${level} with ${unlockedCount}/${ACHIEVEMENTS.length} achievements unlocked on Music Theory Cheatsheet! 🎵`}
                        label="Share progress"
                        canvasRenderer={() => renderShareCard(buildShareCardData(gamification))}
                    />
                </div>
            </div>

            <div className="h-2 rounded-full theme-muted-bg overflow-hidden">
                <div
                    className="h-full theme-accent-bg transition-all"
                    style={{ width: `${xpForNextLevel > 0 ? Math.min(100, (xpIntoLevel / xpForNextLevel) * 100) : 0}%` }}
                />
            </div>

            {showAchievements && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
                    {ACHIEVEMENTS.map((achievement) => {
                        const unlocked = !!gamification.achievements[achievement.id];
                        return (
                            <div
                                key={achievement.id}
                                className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                                    unlocked ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text opacity-60'
                                }`}
                            >
                                {unlocked ? (
                                    <Trophy size={16} className="shrink-0 mt-0.5" />
                                ) : (
                                    <Lock size={16} className="shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <p className="font-medium">{achievement.title}</p>
                                    <p className="text-xs opacity-80">{achievement.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default GamificationPanel;
