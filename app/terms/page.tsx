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

export default function TermsPage() {
    return (
        <div className="theme-bg">
            <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-20">
                <p className="text-xs font-semibold uppercase tracking-widest theme-secondary-text mb-3">Legal</p>
                <h1 className="text-3xl md:text-4xl font-bold theme-text tracking-tight mb-2">Terms &amp; Conditions</h1>
                <p className="text-sm theme-secondary-text mb-12">Last updated: {LAST_UPDATED}</p>

                <Section title="1. Acceptance of terms">
                    <p>
                        By using Music Theory Cheatsheet (&quot;the app&quot;), you agree to these terms. If you
                        don&apos;t agree, please don&apos;t use the app.
                    </p>
                </Section>

                <Section title="2. The service">
                    <p>
                        The app provides interactive music theory practice tools — fretboard, staff notation, ear
                        training, rhythm, play-along, and a guided curriculum — along with optional social features
                        (public profiles, follows, an activity feed, friend challenges, and a leaderboard).
                    </p>
                    <p>
                        You can use most of the app in guest mode, with no account: your progress is stored only on
                        your own device. Creating an account is optional and adds cloud sync (so your progress
                        follows you across devices) plus the social features.
                    </p>
                    <p>
                        The app is currently free to use. We may introduce paid or subscription tiers in the future;
                        if we do, we&apos;ll announce it clearly before any existing functionality is put behind a
                        paywall.
                    </p>
                </Section>

                <Section title="3. Accounts">
                    <p>
                        If you create an account, you&apos;re responsible for keeping your credentials secure and for
                        any activity under your account. Provide an email address you actually control — we use it
                        for sign-in and, if something goes wrong with your account, to reach you.
                    </p>
                </Section>

                <Section title="4. Your content">
                    <p>
                        Profile details (username, bio), activity feed posts, comments, reactions, and challenge
                        results are visible to other users when your profile is set to public. You can switch your
                        profile to private at any time from your profile page.
                    </p>
                    <p>
                        Don&apos;t post anything illegal, harassing, or that infringes someone else&apos;s rights. We
                        may remove content or suspend accounts that violate this.
                    </p>
                </Section>

                <Section title="5. Newsletter">
                    <p>
                        Subscribing to the newsletter is opt-in and requires only an email address. Every newsletter
                        email includes a one-click unsubscribe link; using it removes your email from our list
                        immediately.
                    </p>
                </Section>

                <Section title="6. Disclaimer">
                    <p>
                        The app is provided &quot;as is,&quot; without warranties of any kind. We try hard to keep
                        the music theory content accurate, but we don&apos;t guarantee it&apos;s error-free or fit
                        for any particular purpose.
                    </p>
                </Section>

                <Section title="7. Limitation of liability">
                    <p>
                        To the fullest extent permitted by law, we aren&apos;t liable for any indirect, incidental,
                        or consequential damages arising from your use of the app.
                    </p>
                </Section>

                <Section title="8. Changes to these terms">
                    <p>
                        We may update these terms from time to time. Material changes will be reflected by updating
                        the &quot;Last updated&quot; date above.
                    </p>
                </Section>

                <Section title="9. Contact">
                    <p>
                        Questions about these terms? <Link href="/support" className="underline hover:opacity-80">Open a support ticket</Link>.
                    </p>
                </Section>

                <p className="text-sm theme-secondary-text">
                    See also our <Link href="/privacy" className="underline hover:opacity-80">Privacy Policy</Link>.
                </p>
            </div>
        </div>
    );
}
