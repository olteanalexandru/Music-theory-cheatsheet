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

-- Activity feed: an immutable log of noteworthy events (achievement unlocked,
-- level up, lesson complete, challenge completed) a user generates. Readable
-- by anyone when the owner's profile is public, mirroring the gamification
-- public-read policy below, so the feed page can show "people you follow"
-- without exposing private users' activity.
create table if not exists public.activity_events (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    type text not null check (type in ('achievement_unlocked', 'level_up', 'lesson_complete', 'challenge_completed')),
    data jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

alter table public.activity_events enable row level security;

drop policy if exists "Anyone can read public profiles' activity" on public.activity_events;
create policy "Anyone can read public profiles' activity"
    on public.activity_events for select
    using (
        auth.uid() = user_id
        or exists (
            select 1 from public.profiles
            where profiles.user_id = activity_events.user_id
            and profiles.is_public = true
        )
    );

drop policy if exists "Users can record their own activity" on public.activity_events;
create policy "Users can record their own activity"
    on public.activity_events for insert
    with check (auth.uid() = user_id);

-- Comments on activity feed items. Readable by anyone (same "fully public
-- join table" shape as follows below) since the feed item itself is already
-- gated by the policy above.
create table if not exists public.activity_comments (
    id uuid primary key default gen_random_uuid(),
    event_id uuid not null references public.activity_events(id) on delete cascade,
    author_id uuid not null references auth.users(id) on delete cascade,
    body text not null check (char_length(body) <= 500),
    created_at timestamptz not null default now()
);

alter table public.activity_comments enable row level security;

drop policy if exists "Anyone can read activity comments" on public.activity_comments;
create policy "Anyone can read activity comments"
    on public.activity_comments for select
    using (true);

drop policy if exists "Users can comment as themselves" on public.activity_comments;
create policy "Users can comment as themselves"
    on public.activity_comments for insert
    with check (auth.uid() = author_id);

drop policy if exists "Users can delete their own comments" on public.activity_comments;
create policy "Users can delete their own comments"
    on public.activity_comments for delete
    using (auth.uid() = author_id);

-- One reaction (emoji) per user per activity feed item; upsert to change it.
create table if not exists public.activity_reactions (
    event_id uuid not null references public.activity_events(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    emoji text not null,
    created_at timestamptz not null default now(),
    primary key (event_id, user_id)
);

alter table public.activity_reactions enable row level security;

drop policy if exists "Anyone can read activity reactions" on public.activity_reactions;
create policy "Anyone can read activity reactions"
    on public.activity_reactions for select
    using (true);

drop policy if exists "Users can react as themselves" on public.activity_reactions;
create policy "Users can react as themselves"
    on public.activity_reactions for insert
    with check (auth.uid() = user_id);

drop policy if exists "Users can update their own reaction" on public.activity_reactions;
create policy "Users can update their own reaction"
    on public.activity_reactions for update
    using (auth.uid() = user_id);

drop policy if exists "Users can remove their own reaction" on public.activity_reactions;
create policy "Users can remove their own reaction"
    on public.activity_reactions for delete
    using (auth.uid() = user_id);

-- Head-to-head practice challenges between two users. Unlike follows/profiles,
-- challenges are private to their two participants rather than globally
-- readable - there's no leaderboard-style use case for exposing them.
create table if not exists public.challenges (
    id uuid primary key default gen_random_uuid(),
    challenger_id uuid not null references auth.users(id) on delete cascade,
    challengee_id uuid not null references auth.users(id) on delete cascade,
    category text not null,
    difficulty text not null,
    length int not null,
    status text not null default 'pending' check (status in ('pending', 'active', 'declined', 'completed')),
    challenger_score int,
    challengee_score int,
    winner_id uuid references auth.users(id),
    created_at timestamptz not null default now(),
    check (challenger_id <> challengee_id)
);

alter table public.challenges enable row level security;

drop policy if exists "Participants can read their challenges" on public.challenges;
create policy "Participants can read their challenges"
    on public.challenges for select
    using (auth.uid() in (challenger_id, challengee_id));

drop policy if exists "Users can create challenges" on public.challenges;
create policy "Users can create challenges"
    on public.challenges for insert
    with check (auth.uid() = challenger_id);

drop policy if exists "Participants can update their challenges" on public.challenges;
create policy "Participants can update their challenges"
    on public.challenges for update
    using (auth.uid() in (challenger_id, challengee_id));

-- Atomically records the calling user's score for a challenge and, once both
-- sides are in, marks it completed and computes the winner. security invoker
-- (the default) keeps RLS in force, and identity comes from auth.uid() rather
-- than a parameter so a participant can never submit a score on the other
-- side's behalf. The `for update` row lock makes a read-then-write of both
-- scores safe against two concurrent submissions racing each other.
create or replace function public.submit_challenge_score(
    p_challenge_id uuid,
    p_score int
)
returns public.challenges
language plpgsql
security invoker
as $$
declare
    current_row public.challenges;
    new_challenger_score int;
    new_challengee_score int;
    new_status text;
    new_winner_id uuid;
begin
    select * into current_row
    from public.challenges
    where id = p_challenge_id
      and (challenger_id = auth.uid() or challengee_id = auth.uid())
    for update;

    if current_row.id is null then
        return null;
    end if;

    new_challenger_score := case when current_row.challenger_id = auth.uid() then p_score else current_row.challenger_score end;
    new_challengee_score := case when current_row.challengee_id = auth.uid() then p_score else current_row.challengee_score end;

    if new_challenger_score is not null and new_challengee_score is not null then
        new_status := 'completed';
        new_winner_id := case
            when new_challenger_score = new_challengee_score then null
            when new_challenger_score > new_challengee_score then current_row.challenger_id
            else current_row.challengee_id
        end;
    else
        new_status := current_row.status;
        new_winner_id := current_row.winner_id;
    end if;

    update public.challenges
    set challenger_score = new_challenger_score,
        challengee_score = new_challengee_score,
        status = new_status,
        winner_id = new_winner_id
    where id = p_challenge_id
    returning * into current_row;

    return current_row;
end;
$$;

-- In-app notifications (new follower, challenge invite/result, comment,
-- reaction). The recipient (user_id) only ever reads/marks-read their own
-- rows, but the actor who triggered the notification is the one inserting
-- it on the recipient's behalf - same shape as follows.followee_id.
create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    actor_id uuid not null references auth.users(id) on delete cascade,
    type text not null check (type in ('follow', 'challenge_invite', 'challenge_result', 'comment', 'reaction')),
    data jsonb not null default '{}'::jsonb,
    read boolean not null default false,
    created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "Users can read their own notifications" on public.notifications;
create policy "Users can read their own notifications"
    on public.notifications for select
    using (auth.uid() = user_id);

drop policy if exists "Users can notify others" on public.notifications;
create policy "Users can notify others"
    on public.notifications for insert
    with check (auth.uid() = actor_id);

drop policy if exists "Users can mark their own notifications read" on public.notifications;
create policy "Users can mark their own notifications read"
    on public.notifications for update
    using (auth.uid() = user_id);

-- Minimal admin role: lets specific users see/manage every customer support
-- ticket below. Granted manually in the Supabase dashboard (see README) -
-- there is no in-app UI for granting it.
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- Customer support tickets (bug reports, billing questions, general help).
-- Owners can open and read their own; admins (profiles.is_admin) can read
-- and update every ticket, via the same cross-table admin check used by the
-- policies below, mirroring the public-profile policies above but checking
-- is_admin instead of is_public.
create table if not exists public.support_tickets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    subject text not null check (char_length(subject) <= 200),
    category text not null check (category in ('bug', 'billing', 'question', 'other')),
    status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.support_tickets enable row level security;

drop policy if exists "Users can read their own tickets" on public.support_tickets;
create policy "Users can read their own tickets"
    on public.support_tickets for select
    using (auth.uid() = user_id);

drop policy if exists "Admins can read all tickets" on public.support_tickets;
create policy "Admins can read all tickets"
    on public.support_tickets for select
    using (
        exists (
            select 1 from public.profiles
            where profiles.user_id = auth.uid()
            and profiles.is_admin = true
        )
    );

drop policy if exists "Users can open their own tickets" on public.support_tickets;
create policy "Users can open their own tickets"
    on public.support_tickets for insert
    with check (auth.uid() = user_id);

drop policy if exists "Admins can update any ticket" on public.support_tickets;
create policy "Admins can update any ticket"
    on public.support_tickets for update
    using (
        exists (
            select 1 from public.profiles
            where profiles.user_id = auth.uid()
            and profiles.is_admin = true
        )
    );

-- Follow-up messages on a ticket (from its owner or an admin). Visibility
-- and write access both follow the parent ticket's own access rule -
-- whoever can read/manage the ticket can read/post on its thread.
create table if not exists public.support_ticket_messages (
    id uuid primary key default gen_random_uuid(),
    ticket_id uuid not null references public.support_tickets(id) on delete cascade,
    author_id uuid not null references auth.users(id) on delete cascade,
    body text not null check (char_length(body) <= 2000),
    created_at timestamptz not null default now()
);

alter table public.support_ticket_messages enable row level security;

drop policy if exists "Ticket participants can read messages" on public.support_ticket_messages;
create policy "Ticket participants can read messages"
    on public.support_ticket_messages for select
    using (
        exists (
            select 1 from public.support_tickets
            where support_tickets.id = support_ticket_messages.ticket_id
            and support_tickets.user_id = auth.uid()
        )
        or exists (
            select 1 from public.profiles
            where profiles.user_id = auth.uid()
            and profiles.is_admin = true
        )
    );

drop policy if exists "Ticket participants can post messages" on public.support_ticket_messages;
create policy "Ticket participants can post messages"
    on public.support_ticket_messages for insert
    with check (
        auth.uid() = author_id
        and (
            exists (
                select 1 from public.support_tickets
                where support_tickets.id = support_ticket_messages.ticket_id
                and support_tickets.user_id = auth.uid()
            )
            or exists (
                select 1 from public.profiles
                where profiles.user_id = auth.uid()
                and profiles.is_admin = true
            )
        )
    );

-- Extend the notifications type check to cover ticket replies/status changes.
-- Postgres names an inline column check constraint "<table>_<column>_check"
-- by default, so this matches the constraint the table definition above
-- created implicitly.
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
    check (type in ('follow', 'challenge_invite', 'challenge_result', 'comment', 'reaction', 'ticket_reply', 'ticket_status'));
