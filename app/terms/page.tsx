'use client';

import Link from 'next/link';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';

const LAST_UPDATED = 'June 28, 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-10">
            <h2 className="text-xl font-bold theme-text tracking-tight mb-3">{title}</h2>
            <div className="theme-secondary-text space-y-3 leading-relaxed">{children}</div>
        </section>
    );
}

export default function TermsPage() {
    const t = useTranslations('legal');
    const { sections } = t.terms;

    return (
        <div className="theme-bg">
            <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-20">
                <p className="text-xs font-semibold uppercase tracking-widest theme-secondary-text mb-3">{t.terms.eyebrow}</p>
                <h1 className="text-3xl md:text-4xl font-bold theme-text tracking-tight mb-2">{t.terms.title}</h1>
                <p className="text-sm theme-secondary-text mb-12">{t.terms.lastUpdated(LAST_UPDATED)}</p>

                <Section title={sections.acceptance.title}>
                    <p>{sections.acceptance.body}</p>
                </Section>

                <Section title={sections.service.title}>
                    {sections.service.body.map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                    ))}
                </Section>

                <Section title={sections.accounts.title}>
                    <p>{sections.accounts.body}</p>
                </Section>

                <Section title={sections.content.title}>
                    {sections.content.body.map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                    ))}
                </Section>

                <Section title={sections.newsletter.title}>
                    <p>{sections.newsletter.body}</p>
                </Section>

                <Section title={sections.disclaimer.title}>
                    <p>{sections.disclaimer.body}</p>
                </Section>

                <Section title={sections.liability.title}>
                    <p>{sections.liability.body}</p>
                </Section>

                <Section title={sections.changes.title}>
                    <p>{sections.changes.body}</p>
                </Section>

                <Section title={sections.contact.title}>
                    <p>
                        {sections.contact.before}
                        <Link href="/support" className="underline hover:opacity-80">{sections.contact.linkText}</Link>.
                    </p>
                </Section>

                <p className="text-sm theme-secondary-text">
                    {t.terms.seeAlso.before}
                    <Link href="/privacy" className="underline hover:opacity-80">{t.terms.seeAlso.linkText}</Link>.
                </p>
            </div>
        </div>
    );
}
