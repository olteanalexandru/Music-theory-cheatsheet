import type { NotationSource } from '@/app/utils/scoreTypes';
import { ALPHATAB_TICKS_PER_QUARTER } from '@/app/utils/tempoMap';

// Builds a tab-free, standard-notation-only NotationSource from a parsed
// MIDI note timeline by generating alphaTeX text (alphaTab's plain-text score
// format) and parsing it with alphaTab's own ScoreLoader.loadAlphaTex(), the
// same headless-parser pattern guitarProParser.ts uses for Guitar Pro files.
// Hand-building alphaTab's Score/Track/Bar/Beat object graph directly would
// require correctly wiring every back-reference/index by hand; generating
// text and letting alphaTab's importer do that work is far less error-prone.
//
// MIDI carries no fret/string data, so \tuning piano is used for every track,
// which alphaTab renders as a standard staff with no tab and disables
// tablature on the resulting Staff (confirmed empirically: showTablature
// becomes false). MIDI files parsed here also carry no time-signature meta
// events, so every bar is assumed to be 4/4.

export interface RawMidiNote {
    track: number;
    pitch: number;
    startTick: number;
    endTick: number;
}

export interface MidiTempoChange {
    tick: number;
    microsecondsPerQuarter: number;
}

const NOTE_NAMES = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
const UNITS_PER_BAR = 16; // 16th-note grid units per bar, assuming 4/4 throughout
const ALPHATAB_TICKS_PER_UNIT = ALPHATAB_TICKS_PER_QUARTER / 4; // 1 grid unit = 1 sixteenth note

// Largest-units-first; each [gridUnits, alphaTex duration token] pair.
const DURATION_TOKENS: [units: number, token: number][] = [
    [16, 1],
    [8, 2],
    [4, 4],
    [2, 8],
    [1, 16],
];

function midiPitchToTexName(pitch: number): string {
    const octave = Math.floor(pitch / 12) - 1;
    return `${NOTE_NAMES[((pitch % 12) + 12) % 12]}${octave}`;
}

// Greedily decomposes a span of sixteenth-note grid units into the fewest
// standard (non-dotted) alphaTeX duration tokens, largest first - the same
// greedy strategy generateRhythmPattern (rhythmData.ts) uses to fill a
// measure, just decomposing a known span instead of a random one.
function decomposeUnits(units: number): number[] {
    const tokens: number[] = [];
    let remaining = units;
    for (const [u, token] of DURATION_TOKENS) {
        while (remaining >= u) {
            tokens.push(token);
            remaining -= u;
        }
    }
    return tokens;
}

interface QuantizedNote {
    pitch: number;
    startUnit: number;
    endUnit: number;
}

function quantizeTrackNotes(notes: RawMidiNote[], unitTicks: number): QuantizedNote[] {
    return notes
        .map((note) => {
            const startUnit = Math.round(note.startTick / unitTicks);
            const endUnit = Math.max(startUnit + 1, Math.round(note.endTick / unitTicks));
            return { pitch: note.pitch, startUnit, endUnit };
        })
        .sort((a, b) => a.startUnit - b.startUnit);
}

// Builds the alphaTeX body (no metadata header) for one track: bars of
// UNITS_PER_BAR grid units, each occupied by either a chord (all notes that
// quantize to the same onset unit, sustained for the largest duration that
// fits before the next onset/bar end) or rest tokens filling any gap.
function buildTrackTex(notes: QuantizedNote[], totalUnits: number): string {
    const chordsByUnit = new Map<number, number[]>();
    for (const note of notes) {
        const pitches = chordsByUnit.get(note.startUnit) ?? [];
        pitches.push(note.pitch);
        chordsByUnit.set(note.startUnit, pitches);
    }
    const ownDurationByUnit = new Map<number, number>();
    for (const note of notes) {
        const dur = note.endUnit - note.startUnit;
        ownDurationByUnit.set(note.startUnit, Math.max(ownDurationByUnit.get(note.startUnit) ?? 0, dur));
    }
    const onsets = [...chordsByUnit.keys()].sort((a, b) => a - b);

    const bars: string[] = [];
    for (let barStart = 0; barStart < totalUnits; barStart += UNITS_PER_BAR) {
        const barEnd = barStart + UNITS_PER_BAR;
        const beats: string[] = [];
        let pos = barStart;
        while (pos < barEnd) {
            const nextOnset = onsets.find((u) => u > pos && u < barEnd);
            const gap = (nextOnset ?? barEnd) - pos;

            if (chordsByUnit.has(pos)) {
                const pitches = chordsByUnit.get(pos)!;
                const ownDuration = ownDurationByUnit.get(pos) ?? 1;
                const span = Math.min(Math.max(ownDuration, 1), gap);
                const [noteUnits, noteToken] = DURATION_TOKENS.find(([u]) => u <= span) ?? [1, 16];
                const names = [...new Set(pitches)].map(midiPitchToTexName);
                beats.push(names.length > 1 ? `(${names.join(' ')}).${noteToken}` : `${names[0]}.${noteToken}`);
                for (const restToken of decomposeUnits(gap - noteUnits)) {
                    beats.push(`r.${restToken}`);
                }
            } else {
                for (const restToken of decomposeUnits(gap)) {
                    beats.push(`r.${restToken}`);
                }
            }
            pos += gap;
        }
        bars.push(beats.join(' '));
    }
    return bars.join(' | ');
}

export async function buildNotationFromMidi(
    rawNotes: RawMidiNote[],
    tempoChanges: MidiTempoChange[],
    division: number,
    trackNames: string[],
    title: string
): Promise<NotationSource | null> {
    if (rawNotes.length === 0) return null;

    const unitTicks = Math.max(1, Math.round(division / 4));
    const trackIndices = [...new Set(rawNotes.map((n) => n.track))].sort((a, b) => a - b);
    const quantizedByTrack = new Map<number, QuantizedNote[]>();
    let maxUnit = 0;
    for (const trackIndex of trackIndices) {
        const quantized = quantizeTrackNotes(rawNotes.filter((n) => n.track === trackIndex), unitTicks);
        quantizedByTrack.set(trackIndex, quantized);
        for (const note of quantized) maxUnit = Math.max(maxUnit, note.endUnit);
    }
    const totalUnits = Math.max(UNITS_PER_BAR, Math.ceil(maxUnit / UNITS_PER_BAR) * UNITS_PER_BAR);

    const sections = trackIndices.map((trackIndex, i) => {
        const name = (trackNames[trackIndex] || `Track ${trackIndex + 1}`).replace(/"/g, "'");
        const body = buildTrackTex(quantizedByTrack.get(trackIndex) ?? [], totalUnits);
        const header = i === 0 ? `\\title "${title.replace(/"/g, "'")}"\n\\tempo 120\n` : '';
        return `${header}\\track "${name}"\n\\tuning piano\n.\n${body}`;
    });
    const tex = sections.join('\n');

    const alphaTab = await import('@coderline/alphatab');
    const settings = new alphaTab.Settings();
    let score;
    try {
        score = alphaTab.importer.ScoreLoader.loadAlphaTex(tex, settings);
    } catch {
        return null;
    }

    // Tempo changes are re-expressed on the same sixteenth-note grid as the
    // generated bars (each unit is exactly ALPHATAB_TICKS_PER_UNIT alphaTab
    // ticks), so the resulting tick space matches the score's own bars/beats.
    const tempoTicks = tempoChanges.map((change) => Math.round(change.tick / unitTicks) * ALPHATAB_TICKS_PER_UNIT);
    const tempoBpm = tempoChanges.map((change) => 60000000 / change.microsecondsPerQuarter);
    if (tempoTicks.length === 0 || tempoTicks[0] > 0) {
        tempoTicks.unshift(0);
        tempoBpm.unshift(120);
    }

    return { score, tempoTicks, tempoBpm };
}
