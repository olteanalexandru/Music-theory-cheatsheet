'use client';

import type { ClefId } from '@/app/utils/staffLayout';

export type ClefMode = ClefId | 'grand';

export interface NoteStatEntry {
    attempts: number;
    correct: number;
    totalMs: number; // sum of response time across every attempt, for averaging
    lastPracticed: number | null;
}

export type NoteStatsStore = Record<string, NoteStatEntry>;

export interface SprintBest {
    correct: number;
    total: number;
    durationSec: number;
}

export interface ClefTrainerData {
    notes: NoteStatsStore;
    bestSprint: Record<string, SprintBest>;
}

const STORAGE_KEY = 'music-theory-cheatsheet-clef-trainer';

function normalizeEntry(entry: Partial<NoteStatEntry> | undefined): NoteStatEntry {
    return {
        attempts: entry?.attempts ?? 0,
        correct: entry?.correct ?? 0,
        totalMs: entry?.totalMs ?? 0,
        lastPracticed: entry?.lastPracticed ?? null,
    };
}

export function loadClefTrainerData(): ClefTrainerData {
    if (typeof window === 'undefined') return { notes: {}, bestSprint: {} };
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return { notes: {}, bestSprint: {} };
    try {
        const parsed = JSON.parse(saved) as Partial<ClefTrainerData>;
        const notes: NoteStatsStore = {};
        for (const [key, entry] of Object.entries(parsed.notes ?? {})) {
            notes[key] = normalizeEntry(entry);
        }
        return { notes, bestSprint: parsed.bestSprint ?? {} };
    } catch {
        return { notes: {}, bestSprint: {} };
    }
}

export function saveClefTrainerData(data: ClefTrainerData): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// e.g. noteStatKey('bass', 'F', '', 4) -> "bass-F4", noteStatKey('treble', 'B', '♭', 5) -> "treble-B♭5"
export function noteStatKey(clef: ClefId, letter: string, accidental: string, octave: number): string {
    return `${clef}-${letter}${accidental}${octave}`;
}

export function recordNoteAttempt(data: ClefTrainerData, key: string, correct: boolean, elapsedMs: number): ClefTrainerData {
    const current = normalizeEntry(data.notes[key]);
    const next: NoteStatEntry = {
        attempts: current.attempts + 1,
        correct: current.correct + (correct ? 1 : 0),
        totalMs: current.totalMs + elapsedMs,
        lastPracticed: Date.now(),
    };
    return { ...data, notes: { ...data.notes, [key]: next } };
}

export function sprintKey(mode: ClefMode, durationSec: number): string {
    return `${mode}-${durationSec}`;
}

// Only overwrites the stored best when this run scored strictly more correct
// answers - a tie isn't an improvement, so it's left alone.
export function recordSprintResult(data: ClefTrainerData, mode: ClefMode, durationSec: number, correct: number, total: number): { data: ClefTrainerData; isNewBest: boolean } {
    const key = sprintKey(mode, durationSec);
    const current = data.bestSprint[key];
    const isNewBest = !current || correct > current.correct;
    if (!isNewBest) return { data, isNewBest: false };
    return {
        data: { ...data, bestSprint: { ...data.bestSprint, [key]: { correct, total, durationSec } } },
        isNewBest: true,
    };
}

export function noteAccuracy(entry: NoteStatEntry): number {
    return entry.attempts > 0 ? entry.correct / entry.attempts : 0;
}

export function noteAverageMs(entry: NoteStatEntry): number {
    return entry.attempts > 0 ? entry.totalMs / entry.attempts : 0;
}

export interface WeakNote {
    key: string;
    entry: NoteStatEntry;
}

// Ranked worst-first by a blend of inaccuracy (dominant) and slow average
// response time (tiebreaker), mirroring progressStore's categoryWeaknessScore
// shape. Notes with only a single attempt are excluded - one miss/slow
// answer isn't yet a real pattern worth surfacing as a weak spot.
export function weakestNotes(data: ClefTrainerData, limit = 5): WeakNote[] {
    return Object.entries(data.notes)
        .filter(([, entry]) => entry.attempts >= 2)
        .map(([key, entry]) => ({ key, entry }))
        .sort((a, b) => {
            const weaknessA = (1 - noteAccuracy(a.entry)) * 1000 + Math.min(noteAverageMs(a.entry), 5000) / 10;
            const weaknessB = (1 - noteAccuracy(b.entry)) * 1000 + Math.min(noteAverageMs(b.entry), 5000) / 10;
            return weaknessB - weaknessA;
        })
        .slice(0, limit);
}
