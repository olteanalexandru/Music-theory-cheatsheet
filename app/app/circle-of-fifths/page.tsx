'use client';

import React, { useState } from 'react';
import { CircleOfFifths } from '@/app/components/CircleOfFifths';
import { usePracticeTools } from '@/app/utils/PracticeToolsContext';

export default function CircleOfFifthsPage() {
    const { synth } = usePracticeTools();
    const [selectedRoot] = useState('C');

    return (
        <div>
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold theme-text mb-2">Circle of Fifths</h1>
                <p className="theme-secondary-text">Click around the circle to hear and explore key relationships</p>
            </div>

            <CircleOfFifths initialSelectedRoot={selectedRoot} mode="bass" synth={synth} />
        </div>
    );
}
