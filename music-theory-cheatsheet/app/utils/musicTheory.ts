export const circleOfFifths = {
    order: ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'],
    numberOfSharps: {
        'C': 0, 'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5, 'F#': 6, 'C#': 7,
        'G#': 8, 'D#': 9, 'A#': 10, 'F': 11
    },
    sharpsOrder: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'],
    flatsOrder: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'],
    scaleDegrees: {
        'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
        'D': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
        'A': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
        'E': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
        'B': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
        'F#': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'],
        'C#': ['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#'],
        'G#': ['G#', 'A#', 'B#', 'C#', 'D#', 'E#', 'F##'],
        'D#': ['D#', 'E#', 'F##', 'G#', 'A#', 'B#', 'C##'],
        'A#': ['A#', 'B#', 'C##', 'D#', 'E#', 'F##', 'G##'],
        'F': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E']
    },
    relatives: {
        'C': 'Am', 'G': 'Em', 'D': 'Bm', 'A': 'F#m', 'E': 'C#m', 'B': 'G#m',
        'F#': 'D#m', 'C#': 'A#m', 'G#': 'Fm', 'D#': 'Cm', 'A#': 'Gm', 'F': 'Dm'
    }
};

export const guitarTheory = {
    strings: ['E', 'A', 'D', 'G', 'B', 'E'],
    standardTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    dropD: ['D', 'A', 'D', 'G', 'B', 'E'],
    openG: ['D', 'G', 'D', 'G', 'B', 'D'],
    openD: ['D', 'A', 'D', 'F#', 'A', 'D'],
    openE: ['E', 'B', 'E', 'G#', 'B', 'E'],
    openA: ['E', 'A', 'E', 'A', 'C#', 'E'],
    openC: ['C', 'G', 'C', 'G', 'C', 'E']
};
