import Link from 'next/link';

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
    return (
        <div className="theme-bg">
            <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-20">
                <p className="text-xs font-semibold uppercase tracking-widest theme-secondary-text mb-3">Legal</p>
                <h1 className="text-3xl md:text-4xl font-bold theme-text tracking-tight mb-2">Privacy Policy</h1>
                <p className="text-sm theme-secondary-text mb-12">Last updated: {LAST_UPDATED}</p>

                <Section title="1. Guest mode: nothing leaves your device">
                    <p>
                        Most of the app works without an account. In guest mode, your practice progress, achievements,
                        curriculum progress, and preferences are stored only in your browser&apos;s local storage. We
                        never see this data — it isn&apos;t sent to us at all.
                    </p>
                </Section>

                <Section title="2. What we collect if you create an account">
                    <p>Creating an account is optional. If you do, we store:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Account credentials</strong> — your email and password, managed by our authentication provider (Supabase).</li>
                        <li><strong>Profile info</strong> — username, display name, bio, and your public/private setting.</li>
                        <li><strong>Practice data</strong> — progress, curriculum completion, spaced-repetition review state, and gamification data (XP, level, achievements), so it can sync across your devices.</li>
                        <li><strong>Social activity</strong> — follows, activity feed posts, comments, reactions, and challenge records, if you use those features.</li>
                        <li><strong>Uploaded files</strong> — any MIDI/Guitar Pro files you upload to Play Along.</li>
                        <li><strong>Support tickets</strong> — the subject, category, and messages of any ticket you open.</li>
                    </ul>
                </Section>

                <Section title="3. Newsletter">
                    <p>
                        If you subscribe to the newsletter, we store only your email address. It&apos;s used solely
                        to send the newsletter. Clicking the unsubscribe link in any newsletter email deletes your
                        email from our list immediately — there&apos;s no separate request needed.
                    </p>
                </Section>

                <Section title="4. No tracking, no advertising">
                    <p>
                        We don&apos;t use analytics cookies, advertising trackers, or any third-party tracking
                        scripts. We don&apos;t sell or share your data with advertisers.
                    </p>
                </Section>

                <Section title="5. Who else sees your data">
                    <p>We use a small number of service providers to run the app, who process data on our behalf:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Supabase</strong> — hosts our database, authentication, and file storage.</li>
                        <li><strong>Resend</strong> — delivers newsletter emails. Only the email address and newsletter content are shared with it for that purpose.</li>
                    </ul>
                    <p>
                        Public profile info, public activity, and the leaderboard are visible to other users of the
                        app if you set your profile to public — that&apos;s a feature you control, not data shared
                        with a third party.
                    </p>
                </Section>

                <Section title="6. How long we keep your data">
                    <p>
                        Account data is kept for as long as your account exists. Newsletter subscriptions are
                        hard-deleted (not just marked inactive) the moment you unsubscribe.
                    </p>
                </Section>

                <Section title="7. Your rights">
                    <p>
                        You can edit or delete most of your own content directly in the app — your profile, your
                        public/private setting, your posts, comments, and uploaded files. For anything else,
                        including a full export or deletion of your account data, or any other GDPR data request,{' '}
                        <Link href="/support" className="underline hover:opacity-80">open a support ticket</Link> and
                        we&apos;ll handle it.
                    </p>
                </Section>

                <Section title="8. Children">
                    <p>The app isn&apos;t directed at children under 13, and we don&apos;t knowingly collect data from them.</p>
                </Section>

                <Section title="9. Changes to this policy">
                    <p>
                        We may update this policy from time to time. Material changes will be reflected by updating
                        the &quot;Last updated&quot; date above.
                    </p>
                </Section>

                <Section title="10. Contact">
                    <p>
                        Questions about this policy or your data? <Link href="/support" className="underline hover:opacity-80">Open a support ticket</Link>.
                    </p>
                </Section>

                <p className="text-sm theme-secondary-text">
                    See also our <Link href="/terms" className="underline hover:opacity-80">Terms &amp; Conditions</Link>.
                </p>
            </div>
        </div>
    );
}
