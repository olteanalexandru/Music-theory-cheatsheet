export type Instrument = 'guitar' | 'bass';

// Standard preset tunings, MIDI pitch per open string. Index 0 = string 1 =
// the lowest-pitched string, matching the convention used throughout
// scoreTypes.ts/guitarProParser.ts (alphaTab's Note.string numbering).
export const TUNING_PRESETS: Record<Instrument, Record<number, number[]>> = {
    guitar: {
        6: [40, 45, 50, 55, 59, 64], // E2 A2 D3 G3 B3 E4
        7: [35, 40, 45, 50, 55, 59, 64], // B1 E2 A2 D3 G3 B3 E4
        8: [30, 35, 40, 45, 50, 55, 59, 64], // F#1 B1 E2 A2 D3 G3 B3 E4
    },
    bass: {
        4: [28, 33, 38, 43], // E1 A1 D2 G2
        5: [23, 28, 33, 38, 43], // B0 E1 A1 D2 G2
        6: [23, 28, 33, 38, 43, 48], // B0 E1 A1 D2 G2 C3
    },
};

export const STRING_COUNT_OPTIONS: Record<Instrument, number[]> = {
    guitar: [6, 7, 8],
    bass: [4, 5, 6],
};

export function defaultInstrumentFor(stringCount: number): Instrument {
    return stringCount <= 5 ? 'bass' : 'guitar';
}

export function closestStringCount(instrument: Instrument, stringCount: number): number {
    const options = STRING_COUNT_OPTIONS[instrument];
    return options.reduce((best, n) => (Math.abs(n - stringCount) < Math.abs(best - stringCount) ? n : best), options[0]);
}

// Finds the most natural (string, fret) position for a pitch under a given
// tuning: the assignment with the smallest non-negative fret, mirroring how
// guitarists favor lower fret positions when a note is playable on several
// strings. Returns null if the pitch is out of range for every string.
export function fretForPitch(pitch: number, tuningMidi: number[], maxFret = 24): { string: number; fret: number } | null {
    let best: { string: number; fret: number } | null = null;
    for (let i = 0; i < tuningMidi.length; i++) {
        const fret = pitch - tuningMidi[i];
        if (fret < 0 || fret > maxFret) continue;
        if (!best || fret < best.fret) best = { string: i + 1, fret };
    }
    return best;
}
