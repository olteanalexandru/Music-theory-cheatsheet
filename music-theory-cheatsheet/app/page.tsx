'use client';
import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { CircleOfFifths } from '@/app/components/CircleOfFifths';
// Note types
type NoteName = string;  // e.g., 'C', 'C♯', 'D♭', etc.

// Pattern-related types
type PatternType = 'scales' | 'arpeggios';
type PatternName = string;  // e.g., 'Ionian (Major)', 'Dorian', etc.

interface Pattern {
  intervals: number[];
  description: string;
  relatedArpeggios?: string[];
  relatedModes?: string[];
}

interface Patterns {
  scales: Record<PatternName, Pattern>;
  arpeggios: Record<PatternName, Pattern>;
}



const InteractiveBassDisplay = () => {
    const [hoveredNote, setHoveredNote] = useState<NoteName | null>(null);
    const [selectedRoot, setSelectedRoot] = useState<NoteName | null>(null);
    const [selectedPattern, setSelectedPattern] = useState<PatternName | null>(null);
    const [patternType, setPatternType] = useState<PatternType>('scales');
    const [showTheory, setShowTheory] = useState(false);

    // Bass strings from highest to lowest
    const strings = ['G', 'D', 'A', 'E'];
    
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


    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Bass Fretboard Navigator</h1>
                    <p className="text-gray-400">Explore modes, scales, and arpeggios on the bass</p>
                </div>

                {/* Controls */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Pattern Type Selection */}
                    <div className="bg-gray-800 rounded-lg p-4">
                        <label className="text-gray-300 text-sm mb-2 block">Pattern Type</label>
                        <div className="flex space-x-2">
                            {Object.keys(patterns).map(option => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        setPatternType(option as PatternType);
                                        setSelectedPattern(null);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                        ${patternType === option 
                                            ? 'bg-indigo-500 text-white' 
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                >
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Root Note Selection */}
                    <div className="bg-gray-800 rounded-lg p-4">
                        <label className="text-gray-300 text-sm mb-2 block">Root Note</label>
                        <div className="grid grid-cols-6 gap-1">
                            {chromaticScale.flat().map(note => (
                                <button
                                    key={note}
                                    onClick={() => setSelectedRoot(note)}
                                    className={`p-2 rounded text-sm font-medium transition-colors
                                        ${selectedRoot === note 
                                            ? 'bg-indigo-500 text-white' 
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                >
                                    {note}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pattern Selection */}
                    <div className="bg-gray-800 rounded-lg p-4 col-span-2">
                        <label className="text-gray-300 text-sm mb-2 block">
                            {patternType === 'scales' ? 'Scale/Mode' : 'Arpeggio Type'}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.keys(patterns[patternType]).map(pattern => (
                                <button
                                    key={pattern}
                                    onClick={() => setSelectedPattern(pattern)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                        ${selectedPattern === pattern 
                                            ? 'bg-indigo-500 text-white' 
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                >
                                    {pattern}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Theory Toggle */}
                <button
                    onClick={() => setShowTheory(!showTheory)}
                    className="mb-4 flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                    <Info size={20} />
                    <span>{showTheory ? 'Hide Theory' : 'Show Theory'}</span>
                </button>

                {/* Fretboard */}
                <div className="bg-gray-800 rounded-xl shadow-2xl overflow-x-auto">
                    {/* Fret numbers and markers */}
                    <div className="flex px-16 py-2 border-b border-gray-700">
                        <div className="w-16 flex-shrink-0"></div>
                        {[...Array(16)].map((_, i) => (
                            <div key={i} className="flex-1 min-w-[60px] text-center text-gray-400 text-sm">
                                {i}
                                {[3, 5, 7, 9, 12, 15].includes(i) && (
                                    <div className={`flex justify-center mt-1 ${[12].includes(i) ? 'space-x-2' : ''}`}>
                                        <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                                        {[12].includes(i) && <div className="w-2 h-2 rounded-full bg-indigo-400"></div>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Strings and notes */}
                    <div className="px-4 py-6">
                        {strings.map((string) => (
                            <div key={string} className="flex items-center mb-6 last:mb-0">
                                <div className="w-12 text-right pr-4">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 text-white font-semibold">
                                        {string}
                                    </span>
                                </div>
                                
                                {[...Array(16)].map((_, fret) => {
                                    const note = getNoteAtFret(string, fret);
                                    const isHovered = hoveredNote === note;
                                    const isInPattern = selectedPattern && selectedRoot && 
                                        isNoteInPattern(note, selectedRoot, patterns[patternType][selectedPattern as PatternName].intervals);
                                    const isRoot = note === selectedRoot;
                                    
                                    return (
                                        <div 
                                            key={fret}
                                            className="flex-1 min-w-[60px] flex justify-center relative"
                                        >
                                            <div 
                                                className={`
                                                    w-12 h-12 rounded-full flex items-center justify-center
                                                    text-sm font-medium transition-all duration-200
                                                    ${isRoot ? 'bg-indigo-500 text-white scale-110' :
                                                        isInPattern ? 'bg-indigo-400 bg-opacity-75 text-white' :
                                                        isHovered ? 'bg-gray-600 text-white' :
                                                        'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                                                    cursor-pointer transform hover:scale-105
                                                    ${fret === 0 ? 'border-2 border-gray-600' : ''}
                                                `}
                                                onMouseEnter={() => setHoveredNote(note)}
                                                onMouseLeave={() => setHoveredNote(null)}
                                            >
                                                {note}
                                            </div>
                                            {fret !== 0 && (
                                                <div className="absolute top-1/2 w-full h-[2px] bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600" style={{ zIndex: -1 }}></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Theory Information */}
                {showTheory && selectedPattern && selectedRoot && (
                    <div className="mt-8 bg-gray-800 rounded-lg p-6 shadow-lg">
                        <h3 className="text-xl font-bold text-white mb-4">Pattern Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-indigo-400 font-semibold mb-2">
                                    {selectedPattern} in {selectedRoot}
                                </h4>
                                <p className="text-gray-300 mb-4">{patterns[patternType][selectedPattern].description}</p>
                            </div>
                            <div>
                                <h4 className="text-indigo-400 font-semibold mb-2">
                                    {patternType === 'scales' ? 'Related Arpeggios' : 'Related Modes'}
                                </h4>
                                <ul className="list-disc list-inside text-gray-300">
                                    {patternType === 'scales' 
                                        ? patterns[patternType][selectedPattern].relatedArpeggios?.map(arp => (
                                                <li key={arp} className="mb-1">{arp}</li>
                                            ))
                                        : patterns[patternType][selectedPattern].relatedModes?.map(mode => (
                                                <li key={mode} className="mb-1">{mode}</li>
                                            ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pattern Information */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                        <h3 className="text-white font-semibold mb-2">Scale/Mode Characteristics</h3>
                        <div className="space-y-2 text-gray-400 text-sm">
                            <p>Each mode has a unique character based on its intervals:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Ionian: Natural major scale (1 2 3 4 5 6 7)</li>
                                <li>Dorian: Minor with bright 6th (1 2 ♭3 4 5 6 ♭7)</li>
                                <li>Phrygian: Minor with dark ♭2 (1 ♭2 ♭3 4 5 ♭6 ♭7)</li>
                                <li>Lydian: Major with bright #4 (1 2 3 #4 5 6 7)</li>
                                <li>Mixolydian: Major with ♭7 (1 2 3 4 5 6 ♭7)</li>
                                <li>Aeolian: Natural minor (1 2 ♭3 4 5 ♭6 ♭7)</li>
                                <li>Locrian: Diminished (1 ♭2 ♭3 4 ♭5 ♭6 ♭7)</li>
                            </ul>
                        </div>
                    </div>
                
                    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                        <h3 className="text-white font-semibold mb-2">Arpeggio Construction</h3>
                        <div className="space-y-2 text-gray-400 text-sm">
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
                <CircleOfFifths initialSelectedRoot={selectedRoot || 'C'} />
            </div>
        
        </div>


    );
};

export default InteractiveBassDisplay;
