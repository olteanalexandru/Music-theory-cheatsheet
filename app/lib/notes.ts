export const CHROMATIC_SCALE: readonly string[][] = [
  ["C"],
  ["C♯", "D♭"],
  ["D"],
  ["D♯", "E♭"],
  ["E"],
  ["F"],
  ["F♯", "G♭"],
  ["G"],
  ["G♯", "A♭"],
  ["A"],
  ["A♯", "B♭"],
  ["B"],
];

const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

export function getNoteIndex(note: string): number {
  return CHROMATIC_SCALE.findIndex((enharmonics) => enharmonics.includes(note));
}

export function getNoteAtFret(openNote: string, fret: number): string {
  const startIndex = getNoteIndex(openNote);
  const noteIndex = (startIndex + fret) % 12;
  return CHROMATIC_SCALE[noteIndex][0];
}

export function getIntervalBetween(rootNote: string, note: string): number {
  const rootIndex = getNoteIndex(rootNote);
  const noteIndex = getNoteIndex(note);
  return (noteIndex - rootIndex + 12) % 12;
}

export function isNoteInPattern(
  note: string,
  rootNote: string | null,
  patternIntervals: number[] | undefined
): boolean {
  if (!rootNote || !patternIntervals) return false;
  return patternIntervals.includes(getIntervalBetween(rootNote, note));
}

export function noteToLandmarkNumber(
  note: string,
  selectedRoot: string | null
): number | string {
  if (!selectedRoot) return note;
  const distance = getIntervalBetween(selectedRoot, note);
  const scaleDegree = MAJOR_SCALE_INTERVALS.indexOf(distance);
  return scaleDegree !== -1 ? scaleDegree + 1 : note;
}
