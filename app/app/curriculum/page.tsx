'use client';

import Curriculum from '@/app/components/Curriculum';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';

export default function CurriculumPage() {
    const t = useTranslations('tools');

    return (
        <div>
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold theme-text mb-2">{t.curriculumPage.title}</h1>
                <p className="theme-secondary-text">{t.curriculumPage.subtitle}</p>
            </div>

            <Curriculum />
        </div>
    );
}
