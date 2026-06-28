import React from 'react';

const SIZE_CLASSES = {
    md: 'w-12 h-12 text-lg',
    lg: 'w-14 h-14 text-xl',
} as const;

const LevelBadge: React.FC<{ level: number; size?: keyof typeof SIZE_CLASSES }> = ({ level, size = 'md' }) => (
    <div
        className={`flex items-center justify-center rounded-full theme-btn font-bold shrink-0 ${SIZE_CLASSES[size]}`}
        title={`Level ${level}`}
    >
        {level}
    </div>
);

export default LevelBadge;
