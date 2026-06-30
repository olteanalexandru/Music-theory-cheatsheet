import type { RhythmEvent } from '@/app/utils/rhythmData';

export type RhythmJudgement = 'pending' | 'hit' | 'missed';

export interface GradedBeat {
    id: number;
    startMs: number;
    judgement: RhythmJudgement;
    // Signed ms offset between when the tap landed and the expected onset;
    // negative = early (rushing), positive = late (dragging).
    timingErrorMs: number | null;
}

export interface RhythmFollowReport {
    total: number;
    hit: number;
    missed: number;
    extraTaps: number;
    accuracyPct: number;
    averageTimingErrorMs: number | null;
}

export const DEFAULT_RHYTHM_HIT_WINDOW_MS = 180;

// Real-time tap-along grading: a moving playhead checked against this via
// update(), and tap events (MIDI note-on, on-screen button, spacebar) checked
// via tap(). Unlike ScoreFollowEngine, only onset timing matters here - there
// is no pitch to match, so every "note" event in the pattern becomes a single
// beat to hit.
export class RhythmFollowEngine {
    readonly beats: GradedBeat[];
    private extraTapCount = 0;

    constructor(onsetsMs: number[], private readonly hitWindowMs: number = DEFAULT_RHYTHM_HIT_WINDOW_MS) {
        this.beats = onsetsMs.map((startMs, id) => ({
            id,
            startMs,
            judgement: 'pending' as RhythmJudgement,
            timingErrorMs: null,
        }));
    }

    // Call continuously (e.g. from a requestAnimationFrame loop) with the
    // current playhead time. Returns the ids of beats that just flipped to
    // 'missed' so the caller can decide whether a re-render is warranted.
    update(nowMs: number): number[] {
        const changed: number[] = [];
        for (const beat of this.beats) {
            if (beat.judgement === 'pending' && nowMs > beat.startMs + this.hitWindowMs) {
                beat.judgement = 'missed';
                changed.push(beat.id);
            }
        }
        return changed;
    }

    // Call when a new tap is detected on the live input. Returns the id of
    // the beat it was matched against, or null if no pending beat was within
    // the hit window (an unexpected "extra" tap).
    tap(nowMs: number): number | null {
        let match: GradedBeat | null = null;
        let matchDelta = 0;

        for (const beat of this.beats) {
            if (beat.judgement !== 'pending') continue;
            const delta = nowMs - beat.startMs;
            if (Math.abs(delta) > this.hitWindowMs) continue;
            if (match === null || Math.abs(delta) < Math.abs(matchDelta)) {
                match = beat;
                matchDelta = delta;
            }
        }

        if (match) {
            match.judgement = 'hit';
            match.timingErrorMs = matchDelta;
            return match.id;
        }
        this.extraTapCount++;
        return null;
    }

    reset(): void {
        for (const beat of this.beats) {
            beat.judgement = 'pending';
            beat.timingErrorMs = null;
        }
        this.extraTapCount = 0;
    }

    getReport(): RhythmFollowReport {
        const total = this.beats.length;
        let hit = 0;
        let missed = 0;
        let timingSum = 0;
        for (const beat of this.beats) {
            if (beat.judgement === 'hit') {
                hit++;
                timingSum += beat.timingErrorMs ?? 0;
            } else if (beat.judgement === 'missed') {
                missed++;
            }
        }
        return {
            total,
            hit,
            missed,
            extraTaps: this.extraTapCount,
            accuracyPct: total > 0 ? Math.round((hit / total) * 100) : 0,
            averageTimingErrorMs: hit > 0 ? Math.round(timingSum / hit) : null,
        };
    }
}

// Expected onset time (ms, relative to the pattern's start) of every "note"
// event in a rhythm pattern, skipping rests since no input is expected during
// them. RhythmEvent.beats is already in quarter-note units, so this is a
// direct running sum scaled by the tempo's ms-per-beat.
export function patternToOnsetsMs(events: RhythmEvent[], bpm: number): number[] {
    const msPerBeat = 60000 / bpm;
    const onsets: number[] = [];
    let cumulativeBeats = 0;
    for (const event of events) {
        if (event.type === 'note') {
            onsets.push(cumulativeBeats * msPerBeat);
        }
        cumulativeBeats += event.beats;
    }
    return onsets;
}
