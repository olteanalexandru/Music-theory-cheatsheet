export type NoteName = string;

export type PatternType = "scales" | "arpeggios" | "chords";

export type PatternName = string;

export interface Pattern {
  intervals: number[];
  description: string;
  relatedArpeggios?: string[];
  relatedModes?: string[];
}

export type Patterns = Record<PatternType, Record<PatternName, Pattern>>;

export type Instrument = "bass" | "guitar";
