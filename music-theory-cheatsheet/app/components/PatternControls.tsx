import React, { useState } from 'react';

type PatternType = 'scales' | 'arpeggios' | 'chords';

interface Pattern {
    intervals: number[];
    description: string;
    relatedArpeggios?: string[];
    relatedModes?: string[];
}

interface Patterns {
    scales: Record<string, Pattern>;
    arpeggios: Record<string, Pattern>;
    chords: Record<string, Pattern>;
}

type PatternControlsProps = {
    patterns: Patterns,
    patternType: PatternType,
    setPatternType: (type: PatternType) => void,
    selectedPattern: string | null,
    setSelectedPattern: (pattern: string | null) => void,
    chromaticScale: string[][],
    selectedRoot: string,
    setSelectedRoot: (root: string) => void,
    numChords: number,
    setNumChords: (num: number) => void,
    useLandmarkNumbers: boolean,
    setUseLandmarkNumbers: (use: boolean) => void,
    instrument: 'bass' | 'guitar',
    setInstrument: (instrument: 'bass' | 'guitar') => void,
    tuning: string[], // New prop for tuning
    setTuning: (tuning: string[]) => void // New prop setter for tuning
};

const PatternControls: React.FC<PatternControlsProps> = ({
    patterns,
    patternType,
    setPatternType,
    selectedPattern,
    setSelectedPattern,
    chromaticScale,
    selectedRoot,
    setSelectedRoot,
    numChords,
    setNumChords,
    useLandmarkNumbers,
    setUseLandmarkNumbers,
    instrument,
    setInstrument,
    tuning, // New prop for tuning
    setTuning // New prop setter for tuning
}) => {
    const handleTuningChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTuning = e.target.value;
        const tuningMap: Record<string, string[]> = {
            standard: ['E', 'A', 'D', 'G', 'B', 'E'],
            dropD: ['D', 'A', 'D', 'G', 'B', 'E'],
            openG: ['D', 'G', 'D', 'G', 'B', 'D'],
            openD: ['D', 'A', 'D', 'F#', 'A', 'D'],
            openE: ['E', 'B', 'E', 'G#', 'B', 'E'],
            openA: ['E', 'A', 'E', 'A', 'C#', 'E'],
            openC: ['C', 'G', 'C', 'G', 'C', 'E']
        };
        setTuning(tuningMap[selectedTuning]);
    };

    return (
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pattern Type Selection */}
            <div className="bg-gray-800 rounded-lg p-4">
                <label className="text-gray-300 text-sm mb-2 block">Pattern Type</label>
                <div className="flex flex-wrap gap-2">
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
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
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

            {/* Number of Chords Selection */}
            <div className="bg-gray-800 rounded-lg p-4">
                <label className="text-gray-300 text-sm mb-2 block">Number of Chords</label>
                <select
                    value={numChords}
                    onChange={(e) => setNumChords(Number(e.target.value))}
                    className="w-full bg-gray-700 text-gray-300 p-2 rounded-lg"
                >
                    {[4, 5, 6].map(num => (
                        <option key={num} value={num}>
                            {num}
                        </option>
                    ))}
                </select>
            </div>

            {/* Instrument Selection */}
            <div className="bg-gray-800 rounded-lg p-4">
                <label className="text-gray-300 text-sm mb-2 block">Instrument</label>
                <select
                    value={instrument}
                    onChange={(e) => setInstrument(e.target.value as 'bass' | 'guitar')}
                    className="w-full bg-gray-700 text-gray-300 p-2 rounded-lg"
                >
                    {['bass', 'guitar'].map(inst => (
                        <option key={inst} value={inst}>
                            {inst.charAt(0).toUpperCase() + inst.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tuning Selection */}
            {instrument === 'guitar' && (
                <div className="bg-gray-800 rounded-lg p-4">
                    <label className="text-gray-300 text-sm mb-2 block">Tuning</label>
                    <select
                        value={tuning.join(',')}
                        onChange={handleTuningChange}
                        className="w-full bg-gray-700 text-gray-300 p-2 rounded-lg"
                    >
                        <option value="standard">Standard</option>
                        <option value="dropD">Drop D</option>
                        <option value="openG">Open G</option>
                        <option value="openD">Open D</option>
                        <option value="openE">Open E</option>
                        <option value="openA">Open A</option>
                        <option value="openC">Open C</option>
                    </select>
                </div>
            )}

            {/* Pattern Selection */}
            <div className="bg-gray-800 rounded-lg p-4 col-span-2">
                <label className="text-gray-300 text-sm mb-2 block">
                    {patternType === 'scales' ? 'Scale/Mode' : patternType === 'arpeggios' ? 'Arpeggio Type' : 'Chord Type'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

            {/* Display Mode Selection */}
            <div className="bg-gray-800 rounded-lg p-4">
                <label className="text-gray-300 text-sm mb-2 block">Display Mode</label>
                <button
                    onClick={() => setUseLandmarkNumbers(!useLandmarkNumbers)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${useLandmarkNumbers 
                            ? 'bg-indigo-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                    {useLandmarkNumbers ? 'Landmark Numbers' : 'Note System'}
                </button>
            </div>
        </div>
    );
};

export default PatternControls;
