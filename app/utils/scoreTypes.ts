// Shared shape produced by both the hand-rolled .mid parser (midiFileParser.ts)
// and the alphaTab-backed Guitar Pro parser (guitarProParser.ts), so the
// follow/grading engine and renderer don't need to care which format a file came from.
export interface NoteTimelineEntry {
    pitch: number; // MIDI note number, 0-127
    startMs: number;
    durationMs: number;
    track: number;
    velocity: number;
}

export interface ParsedScore {
    title: string;
    trackNames: string[];
    notes: NoteTimelineEntry[];
    durationMs: number;
}
