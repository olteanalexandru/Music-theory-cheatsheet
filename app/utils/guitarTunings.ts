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
  // Add more 6-string tunings as needed
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
  // Add more 7-string tunings as needed
};

export const getGuitarTunings = (stringCount: 6 | 7) => {
  return stringCount === 6 ? sixStringTunings : sevenStringTunings;
};
