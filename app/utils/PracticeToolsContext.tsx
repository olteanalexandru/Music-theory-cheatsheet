'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useMidiInput, type MidiInputController } from '@/app/utils/useMidiInput';
import { useSynth, type SynthController } from '@/app/utils/useSynth';

interface PracticeToolsContextValue {
    midi: MidiInputController;
    synth: SynthController;
}

const PracticeToolsContext = createContext<PracticeToolsContextValue | null>(null);

// Instantiates the MIDI connection and synth settings once for the whole
// /app/* practice section, instead of per tool page - otherwise navigating
// from one tool to another would drop the MIDI connection and reset the
// waveform/volume back to their defaults every time.
export function PracticeToolsProvider({ children }: { children: React.ReactNode }) {
    const midi = useMidiInput();
    const synth = useSynth();

    // Most MIDI controllers have no onboard sound module, so make incoming notes
    // audible by diffing the cumulative activeNotes set across renders and firing
    // noteOn/noteOff for whatever actually changed.
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

    return <PracticeToolsContext.Provider value={{ midi, synth }}>{children}</PracticeToolsContext.Provider>;
}

export function usePracticeTools(): PracticeToolsContextValue {
    const ctx = useContext(PracticeToolsContext);
    if (!ctx) throw new Error('usePracticeTools must be used within a PracticeToolsProvider');
    return ctx;
}
