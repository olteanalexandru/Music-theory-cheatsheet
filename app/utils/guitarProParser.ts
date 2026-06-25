import type { NoteTimelineEntry, ParsedScore } from '@/app/utils/scoreTypes';
import { buildTickToMsConverter } from '@/app/utils/tempoMap';

export class UnsupportedScoreFormatError extends Error {}

// alphaTab is ~2MB and only needed when a Guitar Pro family file is actually
// opened, so it's imported dynamically rather than at module scope. It's used
// purely as a headless parser here: ScoreLoader.loadScoreFromBytes() needs no
// DOM/canvas/fonts/web-workers, so none of AlphaTabApi's rendering or audio
// engine (and the asset-bundling questions that come with it) are touched.
export async function parseGuitarProFile(buffer: ArrayBuffer, fileName: string): Promise<ParsedScore> {
    const alphaTab = await import('@coderline/alphatab');
    const settings = new alphaTab.Settings();

    let score;
    try {
        score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(new Uint8Array(buffer), settings);
    } catch (err) {
        throw new UnsupportedScoreFormatError(
            err instanceof Error ? err.message : 'Could not parse this file as a Guitar Pro / MusicXML score.'
        );
    }

    interface RawNote {
        track: number;
        startTick: number;
        lengthTick: number;
        pitch: number;
        velocity: number;
    }
    const rawNotes: RawNote[] = [];
    const tempoTicks: number[] = [];
    const tempoBpm: number[] = [];

    const handler: import('@coderline/alphatab').midi.IMidiFileHandler = {
        addTimeSignature: () => {},
        addRest: () => {},
        addNote: (track, start, length, key, velocity) => {
            rawNotes.push({ track, startTick: start, lengthTick: length, pitch: key, velocity });
        },
        addControlChange: () => {},
        addProgramChange: () => {},
        addTempo: (tick, tempo) => {
            tempoTicks.push(tick);
            tempoBpm.push(tempo);
        },
        addNoteBend: () => {},
        addBend: () => {},
        finishTrack: () => {},
        addTickShift: () => {},
    };

    new alphaTab.midi.MidiFileGenerator(score, settings, handler).generate();

    const ticksToMs = buildTickToMsConverter(tempoTicks, tempoBpm);

    const notes: NoteTimelineEntry[] = rawNotes
        .map((note) => {
            const startMs = ticksToMs(note.startTick);
            const endMs = ticksToMs(note.startTick + note.lengthTick);
            return {
                pitch: note.pitch,
                startMs,
                durationMs: Math.max(endMs - startMs, 1),
                track: note.track,
                velocity: note.velocity,
            };
        })
        .sort((a, b) => a.startMs - b.startMs);

    const durationMs = notes.reduce((max, n) => Math.max(max, n.startMs + n.durationMs), 0);

    return {
        title: score.title || fileName.replace(/\.[^/.]+$/, ''),
        trackNames: score.tracks.map((track, i) => track.name || `Track ${i + 1}`),
        notes,
        durationMs,
        notation: { score, tempoTicks, tempoBpm },
    };
}
