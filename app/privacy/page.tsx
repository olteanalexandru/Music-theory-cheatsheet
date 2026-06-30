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

export default function PrivacyPage() {
    const t = useTranslations('legal');
    const { sections } = t.privacy;

    return (
        <div className="theme-bg">
            <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-20">
                <p className="text-xs font-semibold uppercase tracking-widest theme-secondary-text mb-3">{t.privacy.eyebrow}</p>
                <h1 className="text-3xl md:text-4xl font-bold theme-text tracking-tight mb-2">{t.privacy.title}</h1>
                <p className="text-sm theme-secondary-text mb-12">{t.privacy.lastUpdated(LAST_UPDATED)}</p>

                <Section title={sections.guestMode.title}>
                    <p>{sections.guestMode.body}</p>
                </Section>

                <Section title={sections.accountData.title}>
                    <p>{sections.accountData.intro}</p>
                    <ul className="list-disc pl-5 space-y-1">
                        {sections.accountData.items.map((item) => (
                            <li key={item.label}>
                                <strong>{item.label}</strong> {item.text}
                            </li>
                        ))}
                    </ul>
                </Section>

                <Section title={sections.newsletter.title}>
                    <p>{sections.newsletter.body}</p>
                </Section>

                <Section title={sections.noTracking.title}>
                    <p>{sections.noTracking.body}</p>
                </Section>

                <Section title={sections.thirdParties.title}>
                    <p>{sections.thirdParties.intro}</p>
                    <ul className="list-disc pl-5 space-y-1">
                        {sections.thirdParties.items.map((item) => (
                            <li key={item.label}>
                                <strong>{item.label}</strong> {item.text}
                            </li>
                        ))}
                    </ul>
                    <p>{sections.thirdParties.outro}</p>
                </Section>

                <Section title={sections.retention.title}>
                    <p>{sections.retention.body}</p>
                </Section>

                <Section title={sections.rights.title}>
                    <p>
                        {sections.rights.before}
                        <Link href="/support" className="underline hover:opacity-80">{sections.rights.linkText}</Link>
                        {sections.rights.after}
                    </p>
                </Section>

                <Section title={sections.children.title}>
                    <p>{sections.children.body}</p>
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
                    {t.privacy.seeAlso.before}
                    <Link href="/terms" className="underline hover:opacity-80">{t.privacy.seeAlso.linkText}</Link>.
                </p>
            </div>
        </div>
    );
}
