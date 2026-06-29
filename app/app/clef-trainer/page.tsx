'use client';

import React from 'react';
import ClefTrainer from '@/app/components/ClefTrainer';
import { usePracticeTools } from '@/app/utils/PracticeToolsContext';

export default function ClefTrainerPage() {
    const { synth, midi } = usePracticeTools();

    return (
        <div>
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold theme-text mb-2">Clef Trainer</h1>
                <p className="theme-secondary-text">Drill note names on the treble, bass, and grand staff with stats and speed runs</p>
            </div>

            <ClefTrainer synth={synth} midi={midi} />
        </div>
    );
}
