-- Run this once in your Supabase project's SQL editor (Database -> SQL Editor)
-- after creating the project. See README.md for the full setup walkthrough.

-- Ear-training / practice progress, one row per user, synced with the
-- browser's localStorage copy (app/utils/progressStore.ts).
create table if not exists public.progress (
    user_id uuid primary key references auth.users(id) on delete cascade,
    data jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

create policy "Users can read their own progress"
    on public.progress for select
    using (auth.uid() = user_id);

create policy "Users can upsert their own progress"
    on public.progress for insert
    with check (auth.uid() = user_id);

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

create policy "Users can read their own curriculum progress"
    on public.curriculum_progress for select
    using (auth.uid() = user_id);

create policy "Users can upsert their own curriculum progress"
    on public.curriculum_progress for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own curriculum progress"
    on public.curriculum_progress for update
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

create policy "Users can read their own uploaded files"
    on public.uploaded_files for select
    using (auth.uid() = user_id);

create policy "Users can insert their own uploaded files"
    on public.uploaded_files for insert
    with check (auth.uid() = user_id);

create policy "Users can delete their own uploaded files"
    on public.uploaded_files for delete
    using (auth.uid() = user_id);

-- Storage bucket for the raw uploaded files, kept private; objects are stored
-- under a `<user_id>/...` path prefix so the policies below can scope access.
insert into storage.buckets (id, name, public)
values ('play-along-files', 'play-along-files', false)
on conflict (id) do nothing;

create policy "Users can read their own play-along files"
    on storage.objects for select
    using (bucket_id = 'play-along-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can upload their own play-along files"
    on storage.objects for insert
    with check (bucket_id = 'play-along-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own play-along files"
    on storage.objects for delete
    using (bucket_id = 'play-along-files' and (storage.foldername(name))[1] = auth.uid()::text);
