export const guitarTunings: Record<string, string[]> = {
    standard: ['E', 'A', 'D', 'G', 'B', 'E'],
    dropD: ['D', 'A', 'D', 'G', 'B', 'E'],
    doubleDropD: ['D', 'A', 'D', 'G', 'B', 'D'],
    openG: ['D', 'G', 'D', 'G', 'B', 'D'],
    openD: ['D', 'A', 'D', 'F#', 'A', 'D'],
    openE: ['E', 'B', 'E', 'G#', 'B', 'E'],
    openA: ['E', 'A', 'E', 'A', 'C#', 'E'],
    openC: ['C', 'G', 'C', 'G', 'C', 'E'],
    dadgad: ['D', 'A', 'D', 'G', 'A', 'D'],
};

export const bassTunings: Record<string, string[]> = {
    standard4: ['E', 'A', 'D', 'G'], // Standard 4-string
    standard5BEADG: ['B', 'E', 'A', 'D', 'G'], // Standard 5-string (Low B)
    standard5EADGC: ['E', 'A', 'D', 'G', 'C'], // Standard 5-string (High C)
    standard6BEADGC: ['B', 'E', 'A', 'D', 'G', 'C'], // Standard 6-string
    dropD4: ['D', 'A', 'D', 'G'], // Drop D 4-string
    dStandard4: ['D', 'G', 'C', 'F'], // D Standard 4-string
    cStandard4: ['C', 'F', 'A#', 'D#'], // C Standard 4-string
};

export const defaultGuitarTuningName = 'standard';
export const defaultBassTuningName = 'standard4';
