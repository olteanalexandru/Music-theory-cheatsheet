'use client';

import React from 'react';
import RhythmSection from '@/app/components/RhythmSection';
import { usePracticeTools } from '@/app/utils/PracticeToolsContext';

export default function RhythmPage() {
    const { synth } = usePracticeTools();

    return (
        <div>
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold theme-text mb-2">Rhythm Trainer</h1>
                <p className="theme-secondary-text">Practice reading and counting rhythmic notation</p>
            </div>

            <RhythmSection synth={synth} />
        </div>
    );
}
