'use client';

import React from 'react';
import PlayAlong from '@/app/components/PlayAlong';
import { usePracticeTools } from '@/app/utils/PracticeToolsContext';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';

export default function PlayAlongPage() {
    const { midi, audio, synth } = usePracticeTools();
    const t = useTranslations('tools');

    return (
        <div>
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold theme-text mb-2">{t.playAlongPage.title}</h1>
                <p className="theme-secondary-text">{t.playAlongPage.subtitle}</p>
            </div>

            <PlayAlong midi={midi} audio={audio} synth={synth} />
        </div>
    );
}
