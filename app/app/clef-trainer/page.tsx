'use client';

import React from 'react';
import ClefTrainer from '@/app/components/ClefTrainer';
import { usePracticeTools } from '@/app/utils/PracticeToolsContext';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';

export default function ClefTrainerPage() {
    const { synth, midi } = usePracticeTools();
    const t = useTranslations('tools');

    return (
        <div>
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold theme-text mb-2">{t.clefTrainerPage.title}</h1>
                <p className="theme-secondary-text">{t.clefTrainerPage.subtitle}</p>
            </div>

            <ClefTrainer synth={synth} midi={midi} />
        </div>
    );
}
