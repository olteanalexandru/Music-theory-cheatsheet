import type { SupabaseClient } from '@supabase/supabase-js';
import type { Category } from '@/app/components/EarTraining';
import type { EarTrainingDifficulty } from '@/app/utils/earTrainingData';
import { recordActivityEvent } from '@/app/utils/activityStore';
import { createNotification } from '@/app/utils/notificationStore';

export interface Challenge {
    id: string;
    challengerId: string;
    challengeeId: string;
    category: Category;
    difficulty: EarTrainingDifficulty;
    length: number;
    status: 'pending' | 'active' | 'declined' | 'completed';
    challengerScore: number | null;
    challengeeScore: number | null;
    winnerId: string | null;
    createdAt: string;
}

interface ChallengeRow {
    id: string;
    challenger_id: string;
    challengee_id: string;
    category: Category;
    difficulty: EarTrainingDifficulty;
    length: number;
    status: Challenge['status'];
    challenger_score: number | null;
    challengee_score: number | null;
    winner_id: string | null;
    created_at: string;
}

function toChallenge(row: ChallengeRow): Challenge {
    return {
        id: row.id,
        challengerId: row.challenger_id,
        challengeeId: row.challengee_id,
        category: row.category,
        difficulty: row.difficulty,
        length: row.length,
        status: row.status,
        challengerScore: row.challenger_score,
        challengeeScore: row.challengee_score,
        winnerId: row.winner_id,
        createdAt: row.created_at,
    };
}

export async function createChallenge(
    supabase: SupabaseClient,
    challengerId: string,
    challengeeId: string,
    params: { category: Category; difficulty: EarTrainingDifficulty; length: number }
): Promise<{ error: string | null }> {
    const { error } = await supabase.from('challenges').insert({
        challenger_id: challengerId,
        challengee_id: challengeeId,
        category: params.category,
        difficulty: params.difficulty,
        length: params.length,
    });
    if (!error) {
        await createNotification(supabase, { userId: challengeeId, actorId: challengerId, type: 'challenge_invite', data: { category: params.category } });
    }
    return { error: error?.message ?? null };
}

// Both "sent" and "received" challenges for a user, since challenges has no
// single owner column to filter on - same join-two-relationships need the
// follow graph would have if it had to answer "everything involving me".
export async function fetchChallenges(supabase: SupabaseClient, userId: string): Promise<Challenge[]> {
    const { data } = await supabase
        .from('challenges')
        .select('*')
        .or(`challenger_id.eq.${userId},challengee_id.eq.${userId}`)
        .order('created_at', { ascending: false });
    return ((data ?? []) as ChallengeRow[]).map(toChallenge);
}

export async function acceptChallenge(supabase: SupabaseClient, challengeId: string): Promise<void> {
    await supabase.from('challenges').update({ status: 'active' }).eq('id', challengeId);
}

export async function declineChallenge(supabase: SupabaseClient, challengeId: string): Promise<void> {
    await supabase.from('challenges').update({ status: 'declined' }).eq('id', challengeId);
}

// Writes whichever side's score belongs to userId, and once both sides are
// in, computes the winner (higher score; tie -> no winner) and closes the
// challenge out - mirroring gamificationStore's load/mutate/save shape, just
// against a row shared by two people instead of a private one. Only the
// participant who completes the challenge (the second to submit) notifies
// the other side - notifications RLS requires auth.uid() = actor_id, so the
// caller can never insert a notification "from" the other participant.
export async function submitChallengeScore(
    supabase: SupabaseClient,
    userId: string,
    challengeId: string,
    correct: number,
    total: number
): Promise<void> {
    const { data } = await supabase.from('challenges').select('*').eq('id', challengeId).maybeSingle();
    if (!data) return;
    const row = data as ChallengeRow;
    const isChallenger = row.challenger_id === userId;
    const update: Record<string, unknown> = isChallenger ? { challenger_score: correct } : { challengee_score: correct };

    const challengerScore = isChallenger ? correct : row.challenger_score;
    const challengeeScore = isChallenger ? row.challengee_score : correct;
    const completing = challengerScore !== null && challengeeScore !== null;
    if (completing) {
        update.status = 'completed';
        update.winner_id = challengerScore === challengeeScore ? null : challengerScore! > challengeeScore! ? row.challenger_id : row.challengee_id;
    }

    await supabase.from('challenges').update(update).eq('id', challengeId);

    if (completing) {
        await recordActivityEvent(supabase, userId, { type: 'challenge_completed', data: { challengeId, category: row.category, correct, total } });
        const otherUserId = isChallenger ? row.challengee_id : row.challenger_id;
        await createNotification(supabase, { userId: otherUserId, actorId: userId, type: 'challenge_result', data: { challengeId, winnerId: update.winner_id } });
    }
}
