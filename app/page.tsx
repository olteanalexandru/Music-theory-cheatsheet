'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Info } from 'lucide-react';
import { CircleOfFifths } from '@/app/components/CircleOfFifths';
import PatternControls from '@/app/components/PatternControls';
import Fretboard from '@/app/components/Fretboard';
import StaffSection from '@/app/components/StaffSection';
import EarTraining from '@/app/components/EarTraining';
import { guitarTunings,  defaultGuitarTuningName } from '@/app/utils/guitarTunings';
import { useMidiInput } from '@/app/utils/useMidiInput';
import { useSynth } from '@/app/utils/useSynth';
import { noteNameFromMidi } from '@/app/utils/notes';
import type { Waveform } from '@/app/utils/audioSynth';

const WAVEFORMS: Waveform[] = ['sine', 'triangle', 'sawtooth', 'square'];

// Note types
type NoteName = string;  // e.g., 'C', 'C♯', 'D♭', etc.

// Pattern-related types
type PatternType = 'scales' | 'arpeggios' | 'chords';
type PatternName = string;  // e.g., 'Ionian (Major)', 'Dorian', etc.
type VisibleComponent = 'fretboard' | 'theory' | 'circle' | 'staff' | 'earTraining';

interface Pattern {
  intervals: number[];
  description: string;
  relatedArpeggios?: string[];
  relatedModes?: string[];
}

interface Patterns {
  scales: Record<PatternName, Pattern>;
  arpeggios: Record<PatternName, Pattern>;
  chords: Record<PatternName, Pattern>;
}

export type { Patterns, PatternType };

const InteractiveFretboardDisplay = () => {
    const [hoveredNote, setHoveredNote] = useState<NoteName | null>(null);
    const [selectedRoot, setSelectedRoot] = useState<NoteName | null>(null);
    const [selectedPattern, setSelectedPattern] = useState<PatternName | null>(null);
    const [patternType, setPatternType] = useState<PatternType>('scales');
    const [showTheory, setShowTheory] = useState(false);
    const [numChords, setNumChords] = useState<number>(4); // Default to 4 chords
    const [useLandmarkNumbers, setUseLandmarkNumbers] = useState(false);
    const [instrument, setInstrument] = useState<'bass' | 'guitar'>('bass');
    const [selectedTuningName, setSelectedTuningName] = useState<string>(defaultGuitarTuningName);
    const [visibleComponents, setVisibleComponents] = useState<Record<VisibleComponent, boolean>>(() => {
        if (typeof window === 'undefined') {
            return {
                fretboard: true,
                theory: true,
                circle: true,
                staff: true,
                earTraining: true,
            };
        }

        const saved = window.localStorage.getItem('music-theory-cheatsheet-visible-components');
        if (!saved) {
            return {
                fretboard: true,
                theory: true,
                circle: true,
                staff: true,
                earTraining: true,
            };
        }

        try {
            return {
                fretboard: true,
                theory: true,
                circle: true,
                staff: true,
                earTraining: true,
                ...JSON.parse(saved),
            };
        } catch {
            return {
                fretboard: true,
                theory: true,
                circle: true,
                staff: true,
                earTraining: true,
            };
        }
    });

    const midi = useMidiInput();
    const synth = useSynth();
    const midiActiveNoteNames = useMemo(
        () => new Set(Array.from(midi.activeNotes, noteNameFromMidi)),
        [midi.activeNotes]
    );

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

    useEffect(() => {
        window.localStorage.setItem(
            'music-theory-cheatsheet-visible-components',
            JSON.stringify(visibleComponents)
        );
    }, [visibleComponents]);

    const tuning = useMemo<string[]>(() => {
        if (instrument === 'bass') {
            const bassStringsMap: Record<number, string[]> = {
                4: ['G', 'D', 'A', 'E'],
                5: ['G', 'D', 'A', 'E', 'B'],
                6: ['C', 'G', 'D', 'A', 'E', 'B']
            };
            return bassStringsMap[numChords] || bassStringsMap[4];
        }
        // instrument === 'guitar'
        return guitarTunings[selectedTuningName] || guitarTunings[defaultGuitarTuningName];
    }, [instrument, numChords, selectedTuningName]);

    // Chromatic scale with enharmonic spellings
    const chromaticScale = [
        ['C'], 
        ['C♯', 'D♭'], 
        ['D'], 
        ['D♯', 'E♭'], 
        ['E'], 
        ['F'], 
        ['F♯', 'G♭'], 
        ['G'], 
        ['G♯', 'A♭'], 
        ['A'], 
        ['A♯', 'B♭'], 
        ['B']
    ];

    // Corrected intervallic patterns
    const patterns: Patterns = {
        scales: {
            'Ionian (Major)': {
                intervals: [0, 2, 4, 5, 7, 9, 11],
                description: 'Major scale: W-W-H-W-W-W-H'
            },
            'Dorian': {
                intervals: [0, 2, 3, 5, 7, 9, 10],
                description: 'Minor scale with major 6th'
            },
            'Phrygian': {
                intervals: [0, 1, 3, 5, 7, 8, 10],
                description: 'Minor scale with ♭2'
            },
            'Lydian': {
                intervals: [0, 2, 4, 6, 7, 9, 11],
                description: 'Major scale with ♯4'
            },
            'Mixolydian': {
                intervals: [0, 2, 4, 5, 7, 9, 10],
                description: 'Major scale with ♭7'
            },
            'Aeolian (Natural Minor)': {
                intervals: [0, 2, 3, 5, 7, 8, 10],
                description: 'Natural minor scale'
            },
            'Locrian': {
                intervals: [0, 1, 3, 5, 6, 8, 10],
                description: 'Diminished scale'
            },
            'Harmonic Minor': {
                intervals: [0, 2, 3, 5, 7, 8, 11],
                description: 'Minor scale with raised 7th'
            },
            'Melodic Minor': {
                intervals: [0, 2, 3, 5, 7, 9, 11],
                description: 'Minor scale with raised 6th and 7th'
            },
            'Pentatonic Major': {
                intervals: [0, 2, 4, 7, 9],
                description: 'Five-note major scale'
            },
            'Pentatonic Minor': {
                intervals: [0, 3, 5, 7, 10],
                description: 'Five-note minor scale'
            },
            'Blues Scale': {
                intervals: [0, 3, 5, 6, 7, 10],
                description: 'Minor pentatonic with added ♭5'
            }
        },
        arpeggios: {
            'Major 7th': {
                intervals: [0, 4, 7, 11],
                description: 'Root-3-5-7'
            },
            'Minor 7th': {
                intervals: [0, 3, 7, 10],
                description: 'Root-♭3-5-♭7'
            },
            'Dominant 7th': {
                intervals: [0, 4, 7, 10],
                description: 'Root-3-5-♭7'
            },
            'Minor 7th ♭5': {
                intervals: [0, 3, 6, 10],
                description: 'Root-♭3-♭5-♭7'
            },
            'Diminished 7th': {
                intervals: [0, 3, 6, 9],
                description: 'Root-♭3-♭5-♭♭7'
            }
        },
        chords: {
            'Major': {
                intervals: [0, 4, 7],
                description: 'Major chord: Root-3-5'
            },
            'Minor': {
                intervals: [0, 3, 7],
                description: 'Minor chord: Root-♭3-5'
            },
            'Diminished': {
                intervals: [0, 3, 6],
                description: 'Diminished chord: Root-♭3-♭5'
            },
            'Augmented': {
                intervals: [0, 4, 8],
                description: 'Augmented chord: Root-3-♯5'
            }
        }
    };

    // Helper function to get note index in chromatic scale
    const getNoteIndex = (
        note: string
    ) => {
        return chromaticScale.findIndex(notes => 
            notes.some(n => n === note)
        );
    };

    // Corrected function to get note at specific fret
    const getNoteAtFret = (
        openNote: string,
        fret: number
    ) => {
        const startIndex = getNoteIndex(openNote);
        const noteIndex = (startIndex + fret) % 12;
        return chromaticScale[noteIndex][0]; // Use first enharmonic spelling
    };

    // Corrected function to check if note is in pattern
    const isNoteInPattern = (
        note: string,
        rootNote: string,
        patternIntervals: number[]
    ) => {
        if (!rootNote || !patternIntervals) return false;
        
        const rootIndex = getNoteIndex(rootNote);
        const noteIndex = getNoteIndex(note);
        const interval = (noteIndex - rootIndex + 12) % 12;
        
        return patternIntervals.includes(interval);
    };

    // Helper function to convert note names to landmark numbers
    const noteToLandmarkNumber = (note: string) => {
      if (!selectedRoot) return note;
      const rootIndex = getNoteIndex(selectedRoot);
      const noteIndex = getNoteIndex(note);
      const distance = (noteIndex - rootIndex + 12) % 12;
      // Major scale intervals
      const majorScale = [0, 2, 4, 5, 7, 9, 11];
      const scaleDegree = majorScale.indexOf(distance);
      return scaleDegree !== -1 ? scaleDegree + 1 : note;
    };

    const toggleComponent = (component: VisibleComponent) => {
        setVisibleComponents((current) => ({
            ...current,
            [component]: !current[component],
        }));
    };

    const componentToggleClass = (isActive: boolean) =>
        `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive
                ? 'bg-indigo-500 text-white'
                : 'bg-indigo-950/50 text-indigo-200 hover:bg-indigo-900/70'
        }`;

    return (
        <div className="min-h-screen theme-bg p-4 md:p-8 relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="moving-part bg-indigo-500 opacity-50"></div>
                <div className="moving-part bg-indigo-400 opacity-50"></div>
                <div className="moving-part bg-indigo-300 opacity-50"></div>
            </div>
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-6 rounded-xl border border-indigo-500/20 bg-indigo-950/40 p-3 shadow-lg">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-indigo-100">Visible Components</p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                className={componentToggleClass(visibleComponents.fretboard)}
                                onClick={() => toggleComponent('fretboard')}
                            >
                                Fretboard
                            </button>
                            <button
                                className={componentToggleClass(visibleComponents.theory)}
                                onClick={() => toggleComponent('theory')}
                            >
                                Theory
                            </button>
                            <button
                                className={componentToggleClass(visibleComponents.circle)}
                                onClick={() => toggleComponent('circle')}
                            >
                                Circle of Fifths
                            </button>
                            <button
                                className={componentToggleClass(visibleComponents.staff)}
                                onClick={() => toggleComponent('staff')}
                            >
                                Staff
                            </button>
                            <button
                                className={componentToggleClass(visibleComponents.earTraining)}
                                onClick={() => toggleComponent('earTraining')}
                            >
                                Ear Training
                            </button>
                        </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-indigo-500/20 pt-3">
                        <p className="text-sm font-semibold text-indigo-100">Synth</p>
                        <div className="flex flex-wrap gap-2">
                            {WAVEFORMS.map((wave) => (
                                <button
                                    key={wave}
                                    className={componentToggleClass(synth.waveform === wave)}
                                    onClick={() => synth.setWaveform(wave)}
                                >
                                    {wave.charAt(0).toUpperCase() + wave.slice(1)}
                                </button>
                            ))}
                        </div>
                        <label className="flex items-center gap-2 text-sm text-indigo-200">
                            Volume
                            <input
                                type="range"
                                min={0}
                                max={0.6}
                                step={0.02}
                                value={synth.volume}
                                onChange={(e) => synth.setVolume(Number(e.target.value))}
                                className="w-32"
                            />
                        </label>
                    </div>
                </div>

                {/* Header */}
                {visibleComponents.fretboard && (
                    <div className="mb-8 text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-bold theme-text mb-2">
                            {instrument === 'bass' ? 'Bass' : 'Guitar'} Fretboard Navigator
                        </h1>
                        <p className="theme-secondary-text">
                            Explore modes, scales, arpeggios, and chords on the {instrument}
                        </p>
                    </div>
                )}

                {/* Theory Toggle */}
                {visibleComponents.theory && (
                    <button
                        onClick={() => setShowTheory(!showTheory)}
                        className="mb-4 flex items-center justify-center md:justify-start space-x-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        <Info size={20} />
                        <span>{showTheory ? 'Hide Theory' : 'Show Theory'}</span>
                    </button>
                )}

                {/* Fretboard */}
                {visibleComponents.fretboard && (
                    <div className="mb-8 theme-card rounded-lg p-4 md:p-6 shadow-lg">
                        <PatternControls
                            patterns={patterns}
                            patternType={patternType}
                            setPatternType={setPatternType}
                            selectedPattern={selectedPattern}
                            setSelectedPattern={setSelectedPattern}
                            chromaticScale={chromaticScale}
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
                                patterns={patterns}
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
                )}

                {visibleComponents.theory && showTheory && selectedPattern && selectedRoot && (
                    <div className="mt-8 theme-card rounded-lg p-4 md:p-6 shadow-lg">
                        <h3 className="text-lg md:text-xl font-bold theme-text mb-4">Pattern Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-indigo-400 font-semibold mb-2">
                                    {selectedPattern} in {selectedRoot}
                                </h4>
                                <p className="theme-secondary-text mb-4">{patterns[patternType][selectedPattern].description}</p>
                            </div>
                            <div>
                                <h4 className="text-indigo-400 font-semibold mb-2">
                                    {patternType === 'scales' ? 'Related Arpeggios' : patternType === 'arpeggios' ? 'Related Modes' : 'Related Chords'}
                                </h4>
                                <ul className="list-disc list-inside theme-secondary-text">
                                    {patternType === 'scales' 
                                        ? patterns[patternType][selectedPattern].relatedArpeggios?.map(arp => (
                                                <li key={arp} className="mb-1">{arp}</li>
                                            ))
                                        : patternType === 'arpeggios'
                                        ? patterns[patternType][selectedPattern].relatedModes?.map(mode => (
                                                <li key={mode} className="mb-1">{mode}</li>
                                            ))
                                        : patterns[patternType][selectedPattern].relatedModes?.map(chord => (
                                                <li key={chord} className="mb-1">{chord}</li>
                                            ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pattern Information */}
                {visibleComponents.theory && (
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
                {visibleComponents.theory && (
                    <div className="mt-8 theme-card rounded-lg p-4 md:p-6 shadow-lg">
                        <h3 className="text-lg md:text-xl font-bold theme-text mb-4">Nashville Number System</h3>
                        <p className="theme-secondary-text mb-4">
                            The Nashville Number System is a method of musical notation that represents the relationship between chords using numbers instead of traditional chord names. 
                            Each number represents a scale degree relative to the key you&apos;re in.  </p>
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
                
                {visibleComponents.circle && (
                    <div className="mt-8">
                        <CircleOfFifths initialSelectedRoot={selectedRoot || 'C'} mode={instrument} synth={synth} />
                    </div>
                )}

                {visibleComponents.staff && (
                    <StaffSection
                        chromaticScale={chromaticScale}
                        selectedRoot={selectedRoot || 'C'}
                        setSelectedRoot={setSelectedRoot}
                    />
                )}

                {visibleComponents.earTraining && (
                    <div className="mt-8">
                        <EarTraining midi={midi} synth={synth} />
                    </div>
                )}

            </div>
        </div>
    );
};

export default InteractiveFretboardDisplay;
