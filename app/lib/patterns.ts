import type { Patterns } from "@/app/types/music";

export const patterns: Patterns = {
  scales: {
    "Ionian (Major)": {
      intervals: [0, 2, 4, 5, 7, 9, 11],
      description: "Major scale: W-W-H-W-W-W-H",
    },
    Dorian: {
      intervals: [0, 2, 3, 5, 7, 9, 10],
      description: "Minor scale with major 6th",
    },
    Phrygian: {
      intervals: [0, 1, 3, 5, 7, 8, 10],
      description: "Minor scale with ♭2",
    },
    Lydian: {
      intervals: [0, 2, 4, 6, 7, 9, 11],
      description: "Major scale with ♯4",
    },
    Mixolydian: {
      intervals: [0, 2, 4, 5, 7, 9, 10],
      description: "Major scale with ♭7",
    },
    "Aeolian (Natural Minor)": {
      intervals: [0, 2, 3, 5, 7, 8, 10],
      description: "Natural minor scale",
    },
    Locrian: {
      intervals: [0, 1, 3, 5, 6, 8, 10],
      description: "Diminished scale",
    },
    "Harmonic Minor": {
      intervals: [0, 2, 3, 5, 7, 8, 11],
      description: "Minor scale with raised 7th",
    },
    "Melodic Minor": {
      intervals: [0, 2, 3, 5, 7, 9, 11],
      description: "Minor scale with raised 6th and 7th",
    },
    "Pentatonic Major": {
      intervals: [0, 2, 4, 7, 9],
      description: "Five-note major scale",
    },
    "Pentatonic Minor": {
      intervals: [0, 3, 5, 7, 10],
      description: "Five-note minor scale",
    },
    "Blues Scale": {
      intervals: [0, 3, 5, 6, 7, 10],
      description: "Minor pentatonic with added ♭5",
    },
  },
  arpeggios: {
    "Major 7th": {
      intervals: [0, 4, 7, 11],
      description: "Root-3-5-7",
    },
    "Minor 7th": {
      intervals: [0, 3, 7, 10],
      description: "Root-♭3-5-♭7",
    },
    "Dominant 7th": {
      intervals: [0, 4, 7, 10],
      description: "Root-3-5-♭7",
    },
    "Minor 7th ♭5": {
      intervals: [0, 3, 6, 10],
      description: "Root-♭3-♭5-♭7",
    },
    "Diminished 7th": {
      intervals: [0, 3, 6, 9],
      description: "Root-♭3-♭5-♭♭7",
    },
  },
  chords: {
    Major: {
      intervals: [0, 4, 7],
      description: "Major chord: Root-3-5",
    },
    Minor: {
      intervals: [0, 3, 7],
      description: "Minor chord: Root-♭3-5",
    },
    Diminished: {
      intervals: [0, 3, 6],
      description: "Diminished chord: Root-♭3-♭5",
    },
    Augmented: {
      intervals: [0, 4, 8],
      description: "Augmented chord: Root-3-♯5",
    },
  },
};
