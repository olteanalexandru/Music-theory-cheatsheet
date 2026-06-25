# Music-theory-cheatsheet

This project is designed to help musicians explore and understand various musical patterns, scales, and arpeggios on the bass guitar. The interactive interface allows users to visualize these patterns on a virtual fretboard and learn about their theoretical background.

## Features

- **Interactive Bass Fretboard**: Visualize notes, scales, and arpeggios on a bass guitar fretboard.
- **Interactive Guitar Fretboard**: Visualize notes, scales, and arpeggios on a guitar fretboard.
- **Pattern Selection**: Choose from a variety of scales and arpeggios to see their patterns on the fretboard.
- **Root Note Selection**: Select a root note to see how different patterns are constructed from that note.
- **Theory Information**: Toggle to show detailed theoretical information about the selected pattern.
- **Circle of Fifths**: Visual representation of the Circle of Fifths, showing key signatures and primary chords.
- **Accounts & Cloud Sync**: Optionally sign in (email/password, magic link, or Google) to sync practice progress and saved Play Along files across devices — see [Cloud Sync Setup](#cloud-sync-setup-optional) below.

## Future Expansion

We plan to expand this project to include more advanced features. This will involve adding features such as:

- **Extended Pattern Library**: More scales, modes, and arpeggios specific to both bass and guitar.
- **Chord Diagrams**: Visual representations of common guitar chords and their fingerings.
- **Advanced Theory Lessons**: In-depth lessons on music theory concepts relevant to both guitar and bass.
- **Custom Tuning Options**: Allow users to select and visualize patterns in custom tunings for both bass and guitar.

## Guitar Mode

The new guitar mode allows users to switch between bass and guitar fretboards. This mode includes:

- **Interactive Guitar Fretboard**: Visualize notes, scales, and arpeggios on a guitar fretboard.
- **Pattern Selection**: Choose from a variety of scales and arpeggios to see their patterns on the guitar fretboard.
- **Root Note Selection**: Select a root note to see how different patterns are constructed from that note on the guitar.
- **Theory Information**: Toggle to show detailed theoretical information about the selected pattern for guitar.
- **Circle of Fifths**: Visual representation of the Circle of Fifths, showing key signatures and primary chords for guitar.

## Getting Started

To get started with the project, clone the repository and install the necessary dependencies:

```bash
git clone https://github.com/olteanalexandru/Music-theory-cheatsheet.git
cd music-theory-cheatsheet
npm install
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Cloud Sync Setup (Optional)

Sign-in, practice progress sync, and saved Play Along files are powered by [Supabase](https://supabase.com). Without it configured, the app works fully as a guest-only, localStorage-only experience — the "Sign in" button stays disabled with an explanatory note. To turn cloud sync on:

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (the free tier is enough).
2. **Run the schema migration**: open your project's *SQL Editor* and run the contents of [`supabase/schema.sql`](./supabase/schema.sql). This creates the `progress`, `curriculum_progress`, `review_progress`, `gamification`, and `uploaded_files` tables (with row-level security so each user can only see their own data) and a private `play-along-files` storage bucket for saved Guitar Pro / MIDI files.
3. **Copy your API credentials**: in *Project Settings -> API*, copy the *Project URL* and the *anon public* key.
4. **Set environment variables**: copy `.env.example` to `.env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
   Restart `npm run dev` (or rebuild, for a static export deploy) after changing these — they're inlined at build time.
5. **Enable email sign-in** (on by default): in *Authentication -> Providers*, the Email provider is already enabled, which covers password sign-up and magic-link sign-in. If you want to skip email confirmation for quicker testing, turn off "Confirm email" under *Authentication -> Settings*.
6. **Enable Google sign-in (optional)**: the "Continue with Google" button is already wired up — it just needs a provider:
   - In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an OAuth 2.0 Client ID (type: Web application). Add `https://<your-project-ref>.supabase.co/auth/v1/callback` as an authorized redirect URI.
   - In Supabase, go to *Authentication -> Providers -> Google*, enable it, and paste in the Client ID and Client Secret from Google Cloud.
   - That's it — no code changes needed once the provider is enabled.

Once configured, signing in will automatically merge any existing localStorage progress into the cloud, then keep both in sync going forward.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
