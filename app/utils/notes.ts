export const CHROMATIC_NOTES = [
    'C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'
] as const;

export function pitchClassFromMidi(midiNote: number): number {
    return ((midiNote % 12) + 12) % 12;
}

export function noteNameFromMidi(midiNote: number): string {
    return CHROMATIC_NOTES[pitchClassFromMidi(midiNote)];
}

export function midiToFrequency(midiNote: number): number {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
}
