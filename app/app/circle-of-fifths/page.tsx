'use client';

import React, { useState } from 'react';
import { CircleOfFifths } from '@/app/components/CircleOfFifths';
import { usePracticeTools } from '@/app/utils/PracticeToolsContext';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';

export default function CircleOfFifthsPage() {
    const { synth } = usePracticeTools();
    const t = useTranslations('tools');
    const [selectedRoot] = useState('C');

    return (
        <div>
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold theme-text mb-2">{t.circleOfFifthsPage.title}</h1>
                <p className="theme-secondary-text">{t.circleOfFifthsPage.subtitle}</p>
            </div>

            <CircleOfFifths initialSelectedRoot={selectedRoot} mode="bass" synth={synth} />
        </div>
    );
}
