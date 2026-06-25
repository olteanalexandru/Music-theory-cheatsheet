'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Lock, Trophy } from 'lucide-react';
import {
    ACHIEVEMENTS,
    levelProgress,
    loadGamification,
    subscribeToGamificationChanges,
    type GamificationStore,
} from '@/app/utils/gamificationStore';
import ShareButton from '@/app/components/ShareButton';
import { buildShareCardData, renderShareCard } from '@/app/utils/shareCard';

const GamificationPanel: React.FC = () => {
    const [gamification, setGamification] = useState<GamificationStore>(() => loadGamification());
    const [showAchievements, setShowAchievements] = useState(false);

    useEffect(() => subscribeToGamificationChanges(setGamification), []);

    const { level, xpIntoLevel, xpForNextLevel } = levelProgress(gamification.xp);
    const unlockedCount = Object.keys(gamification.achievements).length;

    return (
        <div className="mb-6 theme-card rounded-xl shadow-lg p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full theme-accent-bg font-bold text-lg shrink-0">
                        {level}
                    </div>
                    <div>
                        <p className="theme-text font-semibold">Level {level}</p>
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
