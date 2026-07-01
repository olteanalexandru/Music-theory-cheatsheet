'use client';

import React from 'react';
import RhythmSection from '@/app/components/RhythmSection';
import { usePracticeTools } from '@/app/utils/PracticeToolsContext';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';

export default function RhythmPage() {
    const { synth, midi, audio } = usePracticeTools();
    const t = useTranslations('tools');

    return (
        <div>
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold theme-text mb-2">{t.rhythmPage.title}</h1>
                <p className="theme-secondary-text">{t.rhythmPage.subtitle}</p>
            </div>

            <RhythmSection synth={synth} midi={midi} audio={audio} />
        </div>
    );
}
