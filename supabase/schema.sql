-- Run this once in your Supabase project's SQL editor (Database -> SQL Editor)
-- after creating the project. See README.md for the full setup walkthrough.
--
-- This script is safe to re-run: every CREATE POLICY is preceded by a
-- matching DROP POLICY IF EXISTS, so running it again (e.g. to pick up a
-- schema update) won't abort partway through with a "policy already
-- exists" error and silently skip the statements after it.

-- Ear-training / practice progress, one row per user, synced with the
-- browser's localStorage copy (app/utils/progressStore.ts).
create table if not exists public.progress (
    user_id uuid primary key references auth.users(id) on delete cascade,
    data jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

drop policy if exists "Users can read their own progress" on public.progress;
create policy "Users can read their own progress"
    on public.progress for select
    using (auth.uid() = user_id);

drop policy if exists "Users can upsert their own progress" on public.progress;
create policy "Users can upsert their own progress"
    on public.progress for insert
    with check (auth.uid() = user_id);

drop policy if exists "Users can update their own progress" on public.progress;
create policy "Users can update their own progress"
    on public.progress for update
    using (auth.uid() = user_id);

-- Curriculum lesson completion, one row per user, synced with the browser's
-- localStorage copy (app/utils/curriculumStore.ts).
create table if not exists public.curriculum_progress (
    user_id uuid primary key references auth.users(id) on delete cascade,
    data jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

alter table public.curriculum_progress enable row level security;

drop policy if exists "Users can read their own curriculum progress" on public.curriculum_progress;
create policy "Users can read their own curriculum progress"
    on public.curriculum_progress for select
    using (auth.uid() = user_id);

drop policy if exists "Users can upsert their own curriculum progress" on public.curriculum_progress;
create policy "Users can upsert their own curriculum progress"
    on public.curriculum_progress for insert
    with check (auth.uid() = user_id);

drop policy if exists "Users can update their own curriculum progress" on public.curriculum_progress;
create policy "Users can update their own curriculum progress"
    on public.curriculum_progress for update
    using (auth.uid() = user_id);

-- Per-item spaced-repetition stats (Leitner boxes), one row per user,
-- synced with the browser's localStorage copy (app/utils/reviewStore.ts).
create table if not exists public.review_progress (
    user_id uuid primary key references auth.users(id) on delete cascade,
    data jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

alter table public.review_progress enable row level security;

drop policy if exists "Users can read their own review progress" on public.review_progress;
create policy "Users can read their own review progress"
    on public.review_progress for select
    using (auth.uid() = user_id);

drop policy if exists "Users can upsert their own review progress" on public.review_progress;
create policy "Users can upsert their own review progress"
    on public.review_progress for insert
    with check (auth.uid() = user_id);

drop policy if exists "Users can update their own review progress" on public.review_progress;
create policy "Users can update their own review progress"
    on public.review_progress for update
    using (auth.uid() = user_id);

-- XP, levels, and unlocked achievements, one row per user, synced with the
-- browser's localStorage copy (app/utils/gamificationStore.ts).
create table if not exists public.gamification (
    user_id uuid primary key references auth.users(id) on delete cascade,
    data jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

alter table public.gamification enable row level security;

drop policy if exists "Users can read their own gamification data" on public.gamification;
create policy "Users can read their own gamification data"
    on public.gamification for select
    using (auth.uid() = user_id);

drop policy if exists "Users can upsert their own gamification data" on public.gamification;
create policy "Users can upsert their own gamification data"
    on public.gamification for insert
    with check (auth.uid() = user_id);

drop policy if exists "Users can update their own gamification data" on public.gamification;
create policy "Users can update their own gamification data"
    on public.gamification for update
    using (auth.uid() = user_id);

-- Metadata for Guitar Pro / MIDI files saved from the Play Along feature.
-- The actual file bytes live in the `play-along-files` storage bucket below.
create table if not exists public.uploaded_files (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    file_name text not null,
    storage_path text not null,
    file_kind text not null check (file_kind in ('gp', 'midi')),
    uploaded_at timestamptz not null default now()
);

alter table public.uploaded_files enable row level security;

drop policy if exists "Users can read their own uploaded files" on public.uploaded_files;
create policy "Users can read their own uploaded files"
    on public.uploaded_files for select
    using (auth.uid() = user_id);

drop policy if exists "Users can insert their own uploaded files" on public.uploaded_files;
create policy "Users can insert their own uploaded files"
    on public.uploaded_files for insert
    with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own uploaded files" on public.uploaded_files;
create policy "Users can delete their own uploaded files"
    on public.uploaded_files for delete
    using (auth.uid() = user_id);

-- Storage bucket for the raw uploaded files, kept private; objects are stored
-- under a `<user_id>/...` path prefix so the policies below can scope access.
insert into storage.buckets (id, name, public)
values ('play-along-files', 'play-along-files', false)
on conflict (id) do nothing;

drop policy if exists "Users can read their own play-along files" on storage.objects;
create policy "Users can read their own play-along files"
    on storage.objects for select
    using (bucket_id = 'play-along-files' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can upload their own play-along files" on storage.objects;
create policy "Users can upload their own play-along files"
    on storage.objects for insert
    with check (bucket_id = 'play-along-files' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete their own play-along files" on storage.objects;
create policy "Users can delete their own play-along files"
    on storage.objects for delete
    using (bucket_id = 'play-along-files' and (storage.foldername(name))[1] = auth.uid()::text);

-- Public-facing profile (username, display name, bio), one row per user.
-- Unlike progress/gamification/etc. this is meant to be readable by other
-- users (when is_public = true) to support shareable profile pages and the
-- leaderboard, not just synced privately to its own owner.
create table if not exists public.profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    username text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
    display_name text,
    bio text,
    is_public boolean not null default true,
    created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Anyone can read public profiles" on public.profiles;
create policy "Anyone can read public profiles"
    on public.profiles for select
    using (is_public = true or auth.uid() = user_id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
    on public.profiles for insert
    with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = user_id);

-- Lets a public profile's gamification (XP/level/achievements) row be read
-- by anyone, in addition to the existing owner-only policy above (Postgres
-- combines multiple permissive policies for the same command with OR), so
-- the leaderboard and public profile pages can show it without exposing
-- private users' data.
drop policy if exists "Anyone can read public profiles' gamification data" on public.gamification;
create policy "Anyone can read public profiles' gamification data"
    on public.gamification for select
    using (
        exists (
            select 1 from public.profiles
            where profiles.user_id = gamification.user_id
            and profiles.is_public = true
        )
    );

-- Follow graph for the friends/leaderboard-filter feature. Readable by
-- anyone so follower/following counts and "friends" leaderboard filtering
-- work for any viewer, but only the follower can create/remove their own
-- follow rows.
create table if not exists public.follows (
    follower_id uuid not null references auth.users(id) on delete cascade,
    followee_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (follower_id, followee_id),
    check (follower_id <> followee_id)
);

alter table public.follows enable row level security;

drop policy if exists "Anyone can read follows" on public.follows;
create policy "Anyone can read follows"
    on public.follows for select
    using (true);

drop policy if exists "Users can follow others" on public.follows;
create policy "Users can follow others"
    on public.follows for insert
    with check (auth.uid() = follower_id);

drop policy if exists "Users can unfollow" on public.follows;
create policy "Users can unfollow"
    on public.follows for delete
    using (auth.uid() = follower_id);
