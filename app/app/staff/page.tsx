'use client';

import React, { useState } from 'react';
import StaffSection from '@/app/components/StaffSection';
import { CHROMATIC_SCALE } from '@/app/utils/fretboardTheory';
import { usePracticeTools } from '@/app/utils/PracticeToolsContext';

export default function StaffPage() {
    const { synth } = usePracticeTools();
    const [selectedRoot, setSelectedRoot] = useState('C');

    return (
        <div>
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold theme-text mb-2">Interactive Staff</h1>
                <p className="theme-secondary-text">Read and play notes on a standard staff in any key</p>
            </div>

            <StaffSection
                chromaticScale={CHROMATIC_SCALE}
                selectedRoot={selectedRoot}
                setSelectedRoot={setSelectedRoot}
                synth={synth}
            />
        </div>
    );
}
