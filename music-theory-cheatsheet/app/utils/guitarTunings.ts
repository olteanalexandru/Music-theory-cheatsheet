export type StringNote = string;
export type GuitarTuning = {
  name: string;
  notes: StringNote[];
};

// 6-string guitar tunings
export const sixStringTunings: Record<string, GuitarTuning> = {
  standard: {
    name: "Standard (E A D G B E)",
    notes: ["E2", "A2", "D3", "G3", "B3", "E4"]
  },
  dropD: {
    name: "Drop D (D A D G B E)",
    notes: ["D2", "A2", "D3", "G3", "B3", "E4"]
  },
  openG: {
    name: "Open G (D G D G B D)",
    notes: ["D2", "G2", "D3", "G3", "B3", "D4"]
  },
  openD: {
    name: "Open D (D A D F# A D)",
    notes: ["D2", "A2", "D3", "F#3", "A3", "D4"]
  },
  openE: {
    name: "Open E (E B E G# B E)",
    notes: ["E2", "B2", "E3", "G#3", "B3", "E4"]
  },
  openA: {
    name: "Open A (E A E A C# E)",
    notes: ["E2", "A2", "E3", "A3", "C#4", "E4"]
  },
  openC: {
    name: "Open C (C G C G C E)",
    notes: ["C2", "G2", "C3", "G3", "C4", "E4"]
  }
};

// 7-string guitar tunings
export const sevenStringTunings: Record<string, GuitarTuning> = {
  standard: {
    name: "Standard (B E A D G B E)",
    notes: ["B1", "E2", "A2", "D3", "G3", "B3", "E4"]
  },
  dropA: {
    name: "Drop A (A E A D G B E)",
    notes: ["A1", "E2", "A2", "D3", "G3", "B3", "E4"]
  },
  standard8StepDown: {
    name: "Standard 1/2 Step Down (Bb Eb Ab Db Gb Bb Eb)",
    notes: ["Bb1", "Eb2", "Ab2", "Db3", "Gb3", "Bb3", "Eb4"]
  },
  dropG: {
    name: "Drop G (G D G C F A D)",
    notes: ["G1", "D2", "G2", "C3", "F3", "A3", "D4"]
  }
};

export const getGuitarTunings = (stringCount: 6 | 7) => {
  return stringCount === 6 ? sixStringTunings : sevenStringTunings;
};
