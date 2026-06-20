import { accidentalShift, KEY_NAMES, spellLetterInKey } from '@/app/utils/keySignatures';

export type ClefId = 'treble' | 'bass';
export type RangePreset = 'staff' | 'extended' | 'wide';

export interface ClefConfig {
    label: string;
    symbol: string;
    bottomLetter: string;
    bottomOctave: number;
}

export const CLEFS: Record<ClefId, ClefConfig> = {
    treble: { label: 'Treble Clef (G)', symbol: '𝄞', bottomLetter: 'E', bottomOctave: 4 },
    bass: { label: 'Bass Clef (F)', symbol: '𝄢', bottomLetter: 'G', bottomOctave: 2 },
};

// Extra diatonic steps beyond the 5-line staff (0..8) to draw ledger lines into.
export const RANGE_EXTENSIONS: Record<RangePreset, number> = {
    staff: 0,
    extended: 4,
    wide: 8,
};

const LETTER_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NATURAL_SEMITONES: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

function diatonicIndex(letter: string, octave: number): number {
    return octave * 7 + LETTER_ORDER.indexOf(letter);
}

export function noteMidi(letter: string, octave: number, shift: number): number {
    return (octave + 1) * 12 + NATURAL_SEMITONES[letter] + shift;
}

export function stepFromBottomLine(clef: ClefId, letter: string, octave: number): number {
    const config = CLEFS[clef];
    return diatonicIndex(letter, octave) - diatonicIndex(config.bottomLetter, config.bottomOctave);
}

// Every line-type staff/ledger position strictly between the staff and the given
// step (inclusive of the step itself, when it lands on a line).
export function getLedgerLineSteps(step: number): number[] {
    const steps: number[] = [];
    if (step >= 10) {
        for (let s = 10; s <= step; s += 2) steps.push(s);
    } else if (step <= -2) {
        for (let s = -2; s >= step; s -= 2) steps.push(s);
    }
    return steps;
}

export interface NoteQuestion {
    clef: ClefId;
    keyName: string;
    letter: string;
    accidental: string;
    displayName: string;
    octave: number;
    midi: number;
    step: number;
    ledgerSteps: number[];
}

function pickRandom<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

export function generateNoteQuestion(
    clef: ClefId,
    selectedKeys: string[],
    range: RangePreset
): NoteQuestion {
    const keyName = pickRandom(selectedKeys.length > 0 ? selectedKeys : KEY_NAMES.slice(0, 1));
    const extension = RANGE_EXTENSIONS[range];
    const step = Math.floor(Math.random() * (8 + extension * 2 + 1)) - extension;

    const config = CLEFS[clef];
    const idx = diatonicIndex(config.bottomLetter, config.bottomOctave) + step;
    const octave = Math.floor(idx / 7);
    const letterIndex = ((idx % 7) + 7) % 7;
    const letter = LETTER_ORDER[letterIndex];

    const { accidental } = spellLetterInKey(letter, keyName);
    const midi = noteMidi(letter, octave, accidentalShift(accidental));

    return {
        clef,
        keyName,
        letter,
        accidental,
        displayName: `${letter}${accidental}`,
        octave,
        midi,
        step,
        ledgerSteps: getLedgerLineSteps(step),
    };
}
