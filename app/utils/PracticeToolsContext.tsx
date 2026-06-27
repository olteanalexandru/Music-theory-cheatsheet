'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useMidiInput, type MidiInputController } from '@/app/utils/useMidiInput';
import { useAudioInput, type AudioInputController } from '@/app/utils/useAudioInput';
import { useSynth, type SynthController } from '@/app/utils/useSynth';

interface PracticeToolsContextValue {
    midi: MidiInputController;
    audio: AudioInputController;
    synth: SynthController;
}

const PracticeToolsContext = createContext<PracticeToolsContextValue | null>(null);

// Instantiates the MIDI connection, microphone input and synth settings once
// for the whole /app/* practice section, instead of per tool page - otherwise
// navigating from one tool to another would drop the MIDI/mic connection and
// reset the waveform/volume back to their defaults every time.
export function PracticeToolsProvider({ children }: { children: React.ReactNode }) {
    const midi = useMidiInput();
    const audio = useAudioInput();
    const synth = useSynth();

    // Most MIDI controllers have no onboard sound module, so make incoming notes
    // audible by diffing the cumulative activeNotes set across renders and firing
    // noteOn/noteOff for whatever actually changed. Microphone input is deliberately
    // excluded from this: the player is already producing audible sound into the
    // mic, so echoing it back out through the synth would just add to the feedback
    // risk the mic's analysis-only audio graph is trying to avoid.
    const prevMidiNotesRef = useRef<Set<number>>(new Set());
    useEffect(() => {
        const prev = prevMidiNotesRef.current;
        midi.activeNotes.forEach((note) => {
            if (!prev.has(note)) synth.noteOn(note);
        });
        prev.forEach((note) => {
            if (!midi.activeNotes.has(note)) synth.noteOff(note);
        });
        prevMidiNotesRef.current = midi.activeNotes;
    }, [midi.activeNotes, synth]);

    return <PracticeToolsContext.Provider value={{ midi, audio, synth }}>{children}</PracticeToolsContext.Provider>;
}

export function usePracticeTools(): PracticeToolsContextValue {
    const ctx = useContext(PracticeToolsContext);
    if (!ctx) throw new Error('usePracticeTools must be used within a PracticeToolsProvider');
    return ctx;
}
