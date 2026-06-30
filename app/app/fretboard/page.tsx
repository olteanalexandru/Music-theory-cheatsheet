'use client';

import React, { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import PatternControls from '@/app/components/PatternControls';
import Fretboard from '@/app/components/Fretboard';
import { guitarTunings, defaultGuitarTuningName } from '@/app/utils/guitarTunings';
import { noteNameFromMidi } from '@/app/utils/notes';
import { usePracticeTools } from '@/app/utils/PracticeToolsContext';
import {
    CHROMATIC_SCALE,
    FRETBOARD_PATTERNS,
    getNoteIndex,
    getNoteAtFret,
    isNoteInPattern,
    type PatternName,
    type PatternType,
} from '@/app/utils/fretboardTheory';

type NoteName = string;

export default function FretboardPage() {
    const [hoveredNote, setHoveredNote] = useState<NoteName | null>(null);
    const [selectedRoot, setSelectedRoot] = useState<NoteName | null>(null);
    const [selectedPattern, setSelectedPattern] = useState<PatternName | null>(null);
    const [patternType, setPatternType] = useState<PatternType>('scales');
    const [showTheory, setShowTheory] = useState(false);
    const [numChords, setNumChords] = useState<number>(4);
    const [useLandmarkNumbers, setUseLandmarkNumbers] = useState(false);
    const [instrument, setInstrument] = useState<'bass' | 'guitar'>('bass');
    const [selectedTuningName, setSelectedTuningName] = useState<string>(defaultGuitarTuningName);

    const { midi } = usePracticeTools();
    const midiActiveNoteNames = useMemo(
        () => new Set(Array.from(midi.activeNotes, noteNameFromMidi)),
        [midi.activeNotes]
    );

    const tuning = useMemo<string[]>(() => {
        if (instrument === 'bass') {
            const bassStringsMap: Record<number, string[]> = {
                4: ['G', 'D', 'A', 'E'],
                5: ['G', 'D', 'A', 'E', 'B'],
                6: ['C', 'G', 'D', 'A', 'E', 'B'],
            };
            return bassStringsMap[numChords] || bassStringsMap[4];
        }
        return guitarTunings[selectedTuningName] || guitarTunings[defaultGuitarTuningName];
    }, [instrument, numChords, selectedTuningName]);

    const noteToLandmarkNumber = (note: string) => {
        if (!selectedRoot) return note;
        const rootIndex = getNoteIndex(selectedRoot);
        const noteIndex = getNoteIndex(note);
        const distance = (noteIndex - rootIndex + 12) % 12;
        const majorScale = [0, 2, 4, 5, 7, 9, 11];
        const scaleDegree = majorScale.indexOf(distance);
        return scaleDegree !== -1 ? scaleDegree + 1 : note;
    };

    return (
        <div>
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold theme-text mb-2">
                    {instrument === 'bass' ? 'Bass' : 'Guitar'} Fretboard Navigator
                </h1>
                <p className="theme-secondary-text">
                    Explore modes, scales, arpeggios, and chords on the {instrument}
                </p>
            </div>

            <button
                onClick={() => setShowTheory(!showTheory)}
                className="mb-4 flex items-center justify-center md:justify-start space-x-2 text-indigo-400 hover:text-indigo-300 transition-colors"
            >
                <Info size={20} />
                <span>{showTheory ? 'Hide Theory' : 'Show Theory'}</span>
            </button>

            <div className="mb-8 theme-card rounded-lg p-4 md:p-6 shadow-lg">
                <PatternControls
                    patterns={FRETBOARD_PATTERNS}
                    patternType={patternType}
                    setPatternType={setPatternType}
                    selectedPattern={selectedPattern}
                    setSelectedPattern={setSelectedPattern}
                    chromaticScale={CHROMATIC_SCALE}
                    selectedRoot={selectedRoot}
                    setSelectedRoot={setSelectedRoot}
                    numChords={numChords}
                    setNumChords={setNumChords}
                    useLandmarkNumbers={useLandmarkNumbers}
                    setUseLandmarkNumbers={setUseLandmarkNumbers}
                    instrument={instrument}
                    setInstrument={setInstrument}
                    selectedTuningName={selectedTuningName}
                    setSelectedTuningName={setSelectedTuningName}
                />
                <div className="mt-4">
                    <Fretboard
                        getNoteAtFret={getNoteAtFret}
                        hoveredNote={hoveredNote}
                        setHoveredNote={setHoveredNote}
                        selectedRoot={selectedRoot}
                        selectedPattern={selectedPattern}
                        patterns={FRETBOARD_PATTERNS}
                        patternType={patternType}
                        isNoteInPattern={isNoteInPattern}
                        numChords={numChords}
                        useLandmarkNumbers={useLandmarkNumbers}
                        noteToLandmarkNumber={noteToLandmarkNumber}
                        instrument={instrument}
                        tuning={tuning}
                        midiActiveNoteNames={midiActiveNoteNames}
                    />
                </div>
            </div>

            {showTheory && selectedPattern && selectedRoot && (
                <div className="mt-8 theme-card rounded-lg p-4 md:p-6 shadow-lg">
                    <h3 className="text-lg md:text-xl font-bold theme-text mb-4">Pattern Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-indigo-400 font-semibold mb-2">
                                {selectedPattern} in {selectedRoot}
                            </h4>
                            <p className="theme-secondary-text mb-4">{FRETBOARD_PATTERNS[patternType][selectedPattern].description}</p>
                        </div>
                        <div>
                            <h4 className="text-indigo-400 font-semibold mb-2">
                                {patternType === 'scales' ? 'Related Arpeggios' : patternType === 'arpeggios' ? 'Related Modes' : 'Related Chords'}
                            </h4>
                            <ul className="list-disc list-inside theme-secondary-text">
                                {patternType === 'scales'
                                    ? FRETBOARD_PATTERNS[patternType][selectedPattern].relatedArpeggios?.map((arp) => (
                                          <li key={arp} className="mb-1">{arp}</li>
                                      ))
                                    : patternType === 'arpeggios'
                                    ? FRETBOARD_PATTERNS[patternType][selectedPattern].relatedModes?.map((mode) => (
                                          <li key={mode} className="mb-1">{mode}</li>
                                      ))
                                    : FRETBOARD_PATTERNS[patternType][selectedPattern].relatedModes?.map((chord) => (
                                          <li key={chord} className="mb-1">{chord}</li>
                                      ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {showTheory && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="theme-card rounded-lg p-4 shadow-lg">
                        <h3 className="theme-text font-semibold mb-2">Scale/Mode Characteristics</h3>
                        <div className="space-y-2 theme-secondary-text text-sm">
                            <p>Each mode has a unique character based on its intervals:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Ionian: Natural major scale (1 2 3 4 5 6 7)</li>
                                <li>Dorian: Minor with bright 6th (1 2 ♭3 4 5 6 ♭7)</li>
                                <li>Phrygian: Minor with dark ♭2 (1 ♭2 ♭3 4 5 ♭6 ♭7)</li>
                                <li>Lydian: Major with bright #4 (1 2 3 #4 5 6 7)</li>
                                <li>Mixolydian: Major with ♭7 (1 2 3 4 5 6 ♭7)</li>
                                <li>Aeolian: Natural minor (1 2 ♭3 4 5 ♭6 ♭7)</li>
                                <li>Locrian: Diminished (1 ♭2 ♭3 4 ♭5 ♭6 ♭7)</li>
                                <li>Harmonic Minor: Minor with raised 7th (1 2 ♭3 4 5 ♭6 7)</li>
                                <li>Melodic Minor: Minor with raised 6th and 7th (1 2 ♭3 4 5 6 7)</li>
                                <li>Pentatonic Major: Five-note major scale (1 2 3 5 6)</li>
                                <li>Pentatonic Minor: Five-note minor scale (1 ♭3 4 5 ♭7)</li>
                                <li>Blues Scale: Minor pentatonic with added ♭5 (1 ♭3 4 ♭5 5 ♭7)</li>
                            </ul>
                        </div>
                    </div>

                    <div className="theme-card rounded-lg p-4 shadow-lg">
                        <h3 className="theme-text font-semibold mb-2">Arpeggio Construction</h3>
                        <div className="space-y-2 theme-secondary-text text-sm">
                            <p>Common arpeggio formulas:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Major 7th: Root, Major 3rd, Perfect 5th, Major 7th</li>
                                <li>Minor 7th: Root, Minor 3rd, Perfect 5th, Minor 7th</li>
                                <li>Dominant 7th: Root, Major 3rd, Perfect 5th, Minor 7th</li>
                                <li>Minor 7th ♭5: Root, Minor 3rd, Diminished 5th, Minor 7th</li>
                                <li>Diminished 7th: Root, Minor 3rd, Diminished 5th, Diminished 7th</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {showTheory && (
                <div className="mt-8 theme-card rounded-lg p-4 md:p-6 shadow-lg">
                    <h3 className="text-lg md:text-xl font-bold theme-text mb-4">Nashville Number System</h3>
                    <p className="theme-secondary-text mb-4">
                        The Nashville Number System is a method of musical notation that represents the relationship between chords using numbers instead of traditional chord names.
                        Each number represents a scale degree relative to the key you&apos;re in.
                    </p>
                    <p className="theme-secondary-text mb-4">
                        All major scales follow the same pattern of whole steps (W) and half steps (H): W-W-H-W-W-W-H.
                        The only difference between keys is the starting note. For example:
                    </p>
                    <ul className="list-disc list-inside theme-secondary-text mb-4">
                        <li>C major: C D E F G A B (no sharps or flats)</li>
                        <li>G major: G A B C D E F♯ (one sharp)</li>
                        <li>F major: F G A B♭ C D E (one flat)</li>
                    </ul>
                    <p className="theme-secondary-text mb-4">
                        In the number system, regardless of the key, the scale degrees are always:
                    </p>
                    <ul className="list-disc list-inside theme-secondary-text mb-4">
                        <li>1 - Root/Tonic</li>
                        <li>2 - Second</li>
                        <li>3 - Third</li>
                        <li>4 - Fourth</li>
                        <li>5 - Fifth</li>
                        <li>6 - Sixth</li>
                        <li>7 - Seventh</li>
                    </ul>
                    <p className="theme-secondary-text mb-4">
                        By using numbers instead of chord names, musicians can easily:
                    </p>
                    <ul className="list-disc list-inside theme-secondary-text mb-4">
                        <li>Transpose songs to any key without rewriting</li>
                        <li>Recognize chord relationships regardless of key</li>
                        <li>Communicate chord progressions efficiently</li>
                    </ul>
                    <p className="theme-secondary-text">
                        For example, a I-IV-V progression in C would be C-F-G, but in G it would be G-C-D.
                        The relationship between the chords remains the same, just starting from a different root note.
                    </p>
                </div>
            )}
        </div>
    );
}
