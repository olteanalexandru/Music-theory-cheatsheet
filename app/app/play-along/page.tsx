'use client';

import React from 'react';
import PlayAlong from '@/app/components/PlayAlong';
import { usePracticeTools } from '@/app/utils/PracticeToolsContext';

export default function PlayAlongPage() {
    const { midi, synth } = usePracticeTools();

    return (
        <div>
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold theme-text mb-2">Play Along</h1>
                <p className="theme-secondary-text">Load a MIDI or Guitar Pro file and play along with real-time feedback</p>
            </div>

            <PlayAlong midi={midi} synth={synth} />
        </div>
    );
}
