'use client';

import { useCallback, useState } from 'react';
import * as synth from '@/app/utils/audioSynth';
import type { Waveform } from '@/app/utils/audioSynth';
import type { RhythmEvent } from '@/app/utils/rhythmData';

// Rhythm dictation/metronome clicks don't carry pitch information, so every
// "note" event in a rhythm pattern sounds at this fixed pitch.
const RHYTHM_CLICK_MIDI = 76;

export interface SynthController {
    waveform: Waveform;
    setWaveform: (waveform: Waveform) => void;
    volume: number;
    setVolume: (volume: number) => void;
    noteOn: (midi: number) => void;
    noteOff: (midi: number) => void;
    stopAll: () => void;
    playSequence: (midiNotes: number[]) => void;
    playChord: (midiNotes: number[]) => void;
    playRhythm: (events: RhythmEvent[], bpm: number) => void;
}

export function useSynth(): SynthController {
    const [waveform, setWaveform] = useState<Waveform>('sine');
    const [volume, setVolume] = useState(0.25);

    const noteOn = useCallback(
        (midi: number) => synth.noteOn(midi, { waveform, volume }),
        [waveform, volume]
    );
    const noteOff = useCallback((midi: number) => synth.noteOff(midi), []);
    const stopAll = useCallback(() => synth.stopAllLiveNotes(), []);
    const playSequence = useCallback(
        (notes: number[]) => synth.playNotesInSequence(notes, { waveform, volume }),
        [waveform, volume]
    );
    const playChord = useCallback(
        (notes: number[]) => synth.playNotesTogether(notes, { waveform, volume }),
        [waveform, volume]
    );
    const playRhythm = useCallback(
        (events: RhythmEvent[], bpm: number) =>
            synth.playTimedSequence(
                events.map((event) => ({
                    midi: event.type === 'note' ? RHYTHM_CLICK_MIDI : null,
                    beats: event.beats,
                })),
                bpm,
                { waveform, volume }
            ),
        [waveform, volume]
    );

    return { waveform, setWaveform, volume, setVolume, noteOn, noteOff, stopAll, playSequence, playChord, playRhythm };
}
