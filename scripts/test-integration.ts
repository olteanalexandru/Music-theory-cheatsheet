// Exercises the Supabase data layer end-to-end against a real project, the
// same way the browser app does - this repo has no API routes (next.config.ts
// sets output: 'export'), so "integration test" here means signing in as
// disposable test accounts with the anon key and calling the same store
// functions (profileStore.ts, activityStore.ts, challengeStore.ts,
// notificationStore.ts) the UI calls, so RLS is exercised for real rather
// than bypassed with the service-role key.
//
// Usage: npm run test:integration
// Requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and
// SUPABASE_SERVICE_ROLE_KEY in .env.local (see README.md's Cloud Sync Setup
// section). The service-role key is only ever read here, never by the app.

import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import {
    isValidUsername,
    saveProfile,
    fetchProfileByUsername,
    fetchProfileByUserId,
    fetchGamificationForUser,
    fetchFollowerCount,
    fetchFollowingCount,
    fetchFollowingIds,
    isFollowing,
    followUser,
    unfollowUser,
} from '../app/utils/profileStore';
import {
    recordActivityEvent,
    fetchActivityFeed,
    addComment,
    fetchComments,
    setReaction,
    removeReaction,
    fetchReactionSummaries,
} from '../app/utils/activityStore';
import { createChallenge, fetchChallenges, acceptChallenge, submitChallengeScore } from '../app/utils/challengeStore';
import { fetchNotifications, fetchUnreadCount, markAllRead } from '../app/utils/notificationStore';
import { createTicket, fetchTicket, fetchTicketMessages, fetchAllTickets, postTicketMessage, updateTicketStatus } from '../app/utils/ticketStore';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
    console.error(
        'Missing Supabase credentials.\n' +
            'Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in .env.local\n' +
            '(Project Settings -> API; the service role key is test-only and is never read by the app itself).'
    );
    process.exit(1);
}

let failed = 0;

async function scenario(name: string, fn: () => Promise<void>): Promise<void> {
    try {
        await fn();
        console.log(`  PASS  ${name}`);
    } catch (err) {
        failed++;
        console.error(`  FAIL  ${name}`);
        console.error(`        ${err instanceof Error ? err.message : String(err)}`);
    }
}

interface TestUser {
    id: string;
    client: SupabaseClient;
}

async function createTestUser(admin: SupabaseClient, label: string): Promise<TestUser> {
    const email = `test-integration-${label}-${Date.now()}-${randomUUID().slice(0, 8)}@example.com`;
    const password = randomUUID();
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !data.user) throw new Error(`Failed to create test user "${label}": ${error?.message}`);

    const client = createClient(SUPABASE_URL!, ANON_KEY!);
    const { error: signInError } = await client.auth.signInWithPassword({ email, password });
    if (signInError) throw new Error(`Failed to sign in test user "${label}": ${signInError.message}`);

    return { id: data.user.id, client };
}

async function main(): Promise<void> {
    const admin = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
    const users: TestUser[] = [];

    try {
        console.log('Creating disposable test users...');
        const [a, b, c] = await Promise.all([createTestUser(admin, 'a'), createTestUser(admin, 'b'), createTestUser(admin, 'c')]);
        users.push(a, b, c);
        console.log(`Created ${users.length} test users.\n`);

        const usernameA = `itest_a_${a.id.slice(0, 8)}`;
        const usernameB = `itest_b_${b.id.slice(0, 8)}`;
        const usernameC = `itest_c_${c.id.slice(0, 8)}`;

        console.log('Profiles');
        await scenario('isValidUsername rejects bad formats, accepts good ones', async () => {
            assert.equal(isValidUsername('ab'), false);
            assert.equal(isValidUsername('Has-Dash'), false);
            assert.equal(isValidUsername(usernameA), true);
        });

        await scenario('owner can create and read their own public profile', async () => {
            const { error } = await saveProfile(a.client, a.id, { username: usernameA, displayName: 'Test A', bio: 'public bio', isPublic: true });
            assert.equal(error, null);
            const fetched = await fetchProfileByUserId(a.client, a.id);
            assert.equal(fetched?.username, usernameA);
        });

        await scenario('owner can create a private profile', async () => {
            const { error } = await saveProfile(b.client, b.id, { username: usernameB, displayName: 'Test B', bio: 'private bio', isPublic: false });
            assert.equal(error, null);
        });

        await scenario('a third profile is created for cross-user checks', async () => {
            const { error } = await saveProfile(c.client, c.id, { username: usernameC, displayName: 'Test C', bio: '', isPublic: true });
            assert.equal(error, null);
        });

        await scenario('a duplicate username is rejected', async () => {
            const { error } = await saveProfile(c.client, c.id, { username: usernameA, displayName: 'Test C', bio: '', isPublic: true });
            assert.ok(error, 'expected a duplicate-username error');
        });

        await scenario('a stranger can read a public profile by username', async () => {
            const fetched = await fetchProfileByUsername(c.client, usernameA);
            assert.equal(fetched?.userId, a.id);
        });

        await scenario('a stranger cannot read a private profile', async () => {
            const fetched = await fetchProfileByUserId(c.client, b.id);
            assert.equal(fetched, null);
        });

        console.log('\nFollow graph');
        await scenario('users can follow each other', async () => {
            assert.equal((await followUser(a.client, a.id, b.id)).error, null);
            assert.equal((await followUser(c.client, c.id, b.id)).error, null);
        });

        await scenario('follower/following counts and ids reflect the graph', async () => {
            assert.equal(await fetchFollowerCount(a.client, b.id), 2);
            assert.equal(await fetchFollowingCount(a.client, a.id), 1);
            assert.ok((await fetchFollowingIds(a.client, a.id)).includes(b.id));
            assert.equal(await isFollowing(a.client, a.id, b.id), true);
        });

        await scenario('a self-follow is rejected by the database check constraint', async () => {
            const { error } = await followUser(a.client, a.id, a.id);
            assert.ok(error, 'expected a check-constraint error');
        });

        await scenario('unfollow removes the edge', async () => {
            await unfollowUser(a.client, a.id, b.id);
            assert.equal(await isFollowing(a.client, a.id, b.id), false);
        });

        console.log('\nGamification');
        await scenario('owner can upsert and read their own gamification data', async () => {
            const { error } = await a.client.from('gamification').upsert({ user_id: a.id, data: { xp: 120, achievements: { first_steps: Date.now() } } });
            assert.equal(error, null);
            const fetched = await fetchGamificationForUser(a.client, a.id);
            assert.equal(fetched?.xp, 120);
        });

        await scenario("anyone can read a public profile's gamification data", async () => {
            const fetched = await fetchGamificationForUser(c.client, a.id);
            assert.equal(fetched?.xp, 120);
        });

        await scenario("a private profile's gamification data is hidden from strangers", async () => {
            await b.client.from('gamification').upsert({ user_id: b.id, data: { xp: 50, achievements: {} } });
            const fetched = await fetchGamificationForUser(c.client, b.id);
            assert.equal(fetched, null);
        });

        console.log('\nSync tables (progress / curriculum_progress / review_progress)');
        for (const table of ['progress', 'curriculum_progress', 'review_progress'] as const) {
            await scenario(`${table}: owner upsert + read, stranger read returns empty`, async () => {
                const { error } = await a.client.from(table).upsert({ user_id: a.id, data: { marker: table } });
                assert.equal(error, null);
                const { data: ownRead } = await a.client.from(table).select('data').eq('user_id', a.id).maybeSingle();
                assert.equal((ownRead?.data as { marker?: string } | null)?.marker, table);
                const { data: strangerRead } = await c.client.from(table).select('data').eq('user_id', a.id).maybeSingle();
                assert.equal(strangerRead, null);
            });
        }

        console.log('\nLeaderboard query shape');
        await scenario('leaderboard-style query joins public profiles with gamification', async () => {
            const { data: profileRows, error: profileError } = await c.client
                .from('profiles')
                .select('user_id, username, display_name')
                .eq('is_public', true)
                .limit(200);
            assert.equal(profileError, null);
            assert.ok((profileRows ?? []).some((row) => row.user_id === a.id));
            const ids = (profileRows ?? []).map((row) => row.user_id as string);
            const { data: gamRows, error: gamError } = await c.client.from('gamification').select('user_id, data').in('user_id', ids);
            assert.equal(gamError, null);
            assert.ok((gamRows ?? []).some((row) => row.user_id === a.id));
        });

        console.log('\nActivity feed (events / comments / reactions)');
        let eventId = '';
        await scenario('a user can record their own activity event', async () => {
            await recordActivityEvent(a.client, a.id, { type: 'achievement_unlocked', data: { achievementId: 'first_steps', title: 'First Steps' } });
            const feed = await fetchActivityFeed(a.client, { userIds: [a.id], limit: 1 });
            assert.equal(feed.length, 1);
            eventId = feed[0].id;
        });

        await scenario('a user cannot record an activity event as someone else', async () => {
            const { error } = await a.client.from('activity_events').insert({ user_id: b.id, type: 'level_up', data: {} });
            assert.ok(error, 'expected an RLS error');
        });

        await scenario("the global feed hides a private user's events from strangers", async () => {
            await recordActivityEvent(b.client, b.id, { type: 'level_up', data: { level: 2 } });
            const globalFeed = await fetchActivityFeed(c.client, {});
            assert.ok(!globalFeed.some((item) => item.userId === b.id));
        });

        await scenario('anyone can comment on and react to an activity event', async () => {
            assert.equal((await addComment(c.client, eventId, c.id, 'Nice work!')).error, null);
            const fetchedComments = await fetchComments(a.client, eventId);
            assert.equal(fetchedComments.length, 1);
            await setReaction(c.client, eventId, c.id, '🔥');
            const summaries = await fetchReactionSummaries(a.client, [eventId], c.id);
            assert.equal(summaries.get(eventId)?.viewerEmoji, '🔥');
            await removeReaction(c.client, eventId, c.id);
        });

        await scenario('a user cannot comment as someone else', async () => {
            const { error } = await addComment(c.client, eventId, a.id, 'spoofed');
            assert.ok(error, 'expected an RLS error');
        });

        console.log('\nChallenges');
        let challengeId = '';
        await scenario('a user can challenge someone they follow', async () => {
            await followUser(a.client, a.id, b.id);
            const { error } = await createChallenge(a.client, a.id, b.id, { category: 'intervals', difficulty: 'medium', length: 10 });
            assert.equal(error, null);
            const challenges = await fetchChallenges(a.client, a.id);
            assert.equal(challenges.length, 1);
            challengeId = challenges[0].id;
        });

        await scenario('accepting and submitting both scores completes the match with a winner', async () => {
            await acceptChallenge(b.client, challengeId);
            await submitChallengeScore(a.client, a.id, challengeId, 8, 10);
            await submitChallengeScore(b.client, b.id, challengeId, 6, 10);
            const finalA = (await fetchChallenges(a.client, a.id)).find((ch) => ch.id === challengeId);
            assert.equal(finalA?.status, 'completed');
            assert.equal(finalA?.winnerId, a.id);
        });

        await scenario('a non-participant cannot read the challenge', async () => {
            const challenges = await fetchChallenges(c.client, c.id);
            assert.ok(!challenges.some((ch) => ch.id === challengeId));
        });

        console.log('\nNotifications');
        await scenario('the challengee is notified of the invite and the new follow', async () => {
            const notes = await fetchNotifications(b.client, b.id);
            assert.ok(notes.some((n) => n.type === 'challenge_invite' && n.actorId === a.id));
            assert.ok(notes.some((n) => n.type === 'follow' && n.actorId === a.id));
        });

        await scenario('the challenge winner is notified when their opponent completes the match', async () => {
            // submitChallengeScore can only notify the *other* participant from
            // whichever side completes the match (RLS requires auth.uid() =
            // actor_id) - here that's B completing it, so A is the recipient.
            const notes = await fetchNotifications(a.client, a.id);
            assert.ok(notes.some((n) => n.type === 'challenge_result' && n.actorId === b.id));
        });

        await scenario('unread count drops to zero after markAllRead', async () => {
            assert.ok((await fetchUnreadCount(a.client, a.id)) > 0);
            await markAllRead(a.client, a.id);
            assert.equal(await fetchUnreadCount(a.client, a.id), 0);
        });

        await scenario("a stranger cannot read someone else's notifications", async () => {
            const notes = await fetchNotifications(c.client, a.id);
            assert.equal(notes.length, 0);
        });

        await scenario('a user cannot insert a notification addressed from someone else', async () => {
            const { error } = await c.client.from('notifications').insert({ user_id: a.id, actor_id: b.id, type: 'follow', data: {} });
            assert.ok(error, 'expected an RLS error');
        });

        console.log('\nSupport tickets');
        let ticketId = '';
        await scenario('a user can open a ticket with an initial message', async () => {
            const { ticket, error } = await createTicket(a.client, a.id, { subject: 'Cannot hear playback', category: 'bug', body: 'Audio does not play on Safari.' });
            assert.equal(error, null);
            assert.ok(ticket);
            ticketId = ticket!.id;
            const messages = await fetchTicketMessages(a.client, ticketId);
            assert.equal(messages.length, 1);
            assert.equal(messages[0].authorId, a.id);
        });

        await scenario('the owner can read their own ticket and thread; a stranger cannot', async () => {
            assert.equal((await fetchTicket(a.client, ticketId))?.id, ticketId);
            assert.equal(await fetchTicket(c.client, ticketId), null);
            assert.equal((await fetchTicketMessages(c.client, ticketId)).length, 0);
        });

        await scenario('granting the is_admin flag (the manual dashboard step) lets a user read every ticket', async () => {
            const { error } = await admin.from('profiles').update({ is_admin: true }).eq('user_id', c.id);
            assert.equal(error, null);
            const allTickets = await fetchAllTickets(c.client);
            assert.ok(allTickets.some((t) => t.id === ticketId));
        });

        await scenario("a non-admin's status update is silently rejected by RLS", async () => {
            const ticket = (await fetchTicket(a.client, ticketId))!;
            await updateTicketStatus(b.client, b.id, ticket, 'closed');
            assert.equal((await fetchTicket(a.client, ticketId))?.status, 'open');
        });

        await scenario('an admin can reply and change status, which notifies the owner', async () => {
            const ticket = (await fetchTicket(c.client, ticketId))!;
            assert.equal((await postTicketMessage(c.client, c.id, ticket, 'Looking into it now.')).error, null);
            assert.equal((await updateTicketStatus(c.client, c.id, ticket, 'in_progress')).error, null);
            const notes = await fetchNotifications(a.client, a.id);
            assert.ok(notes.some((n) => n.type === 'ticket_reply' && n.actorId === c.id));
            assert.ok(notes.some((n) => n.type === 'ticket_status' && n.actorId === c.id));
        });

        await scenario("the owner's own follow-up does not notify themselves", async () => {
            const ticket = (await fetchTicket(a.client, ticketId))!;
            assert.equal(ticket.status, 'in_progress');
            assert.equal((await postTicketMessage(a.client, a.id, ticket, 'Thanks, still happening on Chrome too.')).error, null);
            assert.equal((await fetchTicketMessages(a.client, ticketId)).length, 3);
        });

        await scenario('a stranger (non-admin) can no longer open the ticket either', async () => {
            assert.equal(await fetchTicket(b.client, ticketId), null);
        });

        console.log('\nStorage (play-along-files bucket)');
        await scenario('a user can upload, read, and delete their own file', async () => {
            const path = `${a.id}/integration-test-${Date.now()}.txt`;
            const body = new TextEncoder().encode('integration test file');
            const { error: uploadError } = await a.client.storage.from('play-along-files').upload(path, body, { contentType: 'text/plain' });
            assert.equal(uploadError, null);
            const { data: downloaded, error: downloadError } = await a.client.storage.from('play-along-files').download(path);
            assert.equal(downloadError, null);
            assert.equal(await downloaded?.text(), 'integration test file');
            const { error: removeError } = await a.client.storage.from('play-along-files').remove([path]);
            assert.equal(removeError, null);
        });
    } finally {
        console.log('\nCleaning up disposable test users...');
        for (const u of users) {
            await admin.auth.admin.deleteUser(u.id).catch(() => {});
        }
    }

    console.log(`\n${failed === 0 ? 'All scenarios passed.' : `${failed} scenario(s) failed.`}`);
    process.exitCode = failed === 0 ? 0 : 1;
}

main().catch((err) => {
    console.error('Integration test run crashed:', err);
    process.exitCode = 1;
});
