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

// Only populated for Guitar Pro family files (.gp/.gp3/.gp4/.gp5/.gpx) - raw
// MIDI files carry no fret/string/rhythmic-layout metadata, so there's no
// staff/tab notation to render for them, only the note timeline above.
export interface NotationSource {
    score: import('@coderline/alphatab').model.Score;
    tempoTicks: number[];
    tempoBpm: number[];
}

export interface ParsedScore {
    title: string;
    trackNames: string[];
    notes: NoteTimelineEntry[];
    durationMs: number;
    notation?: NotationSource;
}
