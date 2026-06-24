import type { NoteTimelineEntry } from '@/app/utils/scoreTypes';

export type NoteJudgement = 'pending' | 'hit' | 'wrong' | 'missed';

export interface GradedNote extends NoteTimelineEntry {
    id: number;
    judgement: NoteJudgement;
    // Signed ms offset between when the note was actually played and its
    // expected start; negative = played early (rushing), positive = late (dragging).
    timingErrorMs: number | null;
    playedPitch: number | null; // only set when judgement === 'wrong'
}

export interface FollowReport {
    total: number;
    hit: number;
    wrong: number;
    missed: number;
    extraNotes: number;
    accuracyPct: number;
    averageTimingErrorMs: number | null;
}

export const DEFAULT_HIT_WINDOW_MS = 200;

// Drives real-time "follow mode" grading: a moving playhead checked against
// this via update(), and live note-on events from MIDI/on-screen-keyboard
// input checked via noteOn(). Both pitch correctness and onset timing
// (rhythm) are graded; note-off/duration is intentionally not graded, mirroring
// how onset-based score-following tools like Piano Marvel grade primarily on
// "was the right note struck at the right time".
export class ScoreFollowEngine {
    readonly notes: GradedNote[];
    private extraNoteCount = 0;

    constructor(notes: NoteTimelineEntry[], private readonly hitWindowMs: number = DEFAULT_HIT_WINDOW_MS) {
        this.notes = notes.map((note, id) => ({
            ...note,
            id,
            judgement: 'pending' as NoteJudgement,
            timingErrorMs: null,
            playedPitch: null,
        }));
    }

    // Call continuously (e.g. from a requestAnimationFrame loop) with the
    // current playhead time. Returns the ids of notes that just flipped to
    // 'missed' so the caller can decide whether a re-render is warranted,
    // rather than re-rendering on every frame.
    update(nowMs: number): number[] {
        const changed: number[] = [];
        for (const note of this.notes) {
            if (note.judgement === 'pending' && nowMs > note.startMs + this.hitWindowMs) {
                note.judgement = 'missed';
                changed.push(note.id);
            }
        }
        return changed;
    }

    // Call when a new note-on is detected on the live input. Returns the id
    // of the timeline note it was matched against, or null if it couldn't be
    // matched to anything nearby (an unexpected "extra" note).
    noteOn(pitch: number, nowMs: number): number | null {
        let exactMatch: GradedNote | null = null;
        let exactDelta = 0;
        let nearMatch: GradedNote | null = null;
        let nearDelta = 0;

        for (const note of this.notes) {
            if (note.judgement !== 'pending') continue;
            const delta = nowMs - note.startMs;
            if (Math.abs(delta) > this.hitWindowMs) continue;

            if (note.pitch === pitch) {
                if (exactMatch === null || Math.abs(delta) < Math.abs(exactDelta)) {
                    exactMatch = note;
                    exactDelta = delta;
                }
            } else if (nearMatch === null || Math.abs(delta) < Math.abs(nearDelta)) {
                nearMatch = note;
                nearDelta = delta;
            }
        }

        if (exactMatch) {
            exactMatch.judgement = 'hit';
            exactMatch.timingErrorMs = exactDelta;
            return exactMatch.id;
        }
        if (nearMatch) {
            nearMatch.judgement = 'wrong';
            nearMatch.timingErrorMs = nearDelta;
            nearMatch.playedPitch = pitch;
            return nearMatch.id;
        }
        this.extraNoteCount++;
        return null;
    }

    reset(): void {
        for (const note of this.notes) {
            note.judgement = 'pending';
            note.timingErrorMs = null;
            note.playedPitch = null;
        }
        this.extraNoteCount = 0;
    }

    getReport(): FollowReport {
        const total = this.notes.length;
        let hit = 0;
        let wrong = 0;
        let missed = 0;
        let timingSum = 0;
        for (const note of this.notes) {
            if (note.judgement === 'hit') {
                hit++;
                timingSum += note.timingErrorMs ?? 0;
            } else if (note.judgement === 'wrong') {
                wrong++;
            } else if (note.judgement === 'missed') {
                missed++;
            }
        }
        return {
            total,
            hit,
            wrong,
            missed,
            extraNotes: this.extraNoteCount,
            accuracyPct: total > 0 ? Math.round((hit / total) * 100) : 0,
            averageTimingErrorMs: hit > 0 ? Math.round(timingSum / hit) : null,
        };
    }
}
