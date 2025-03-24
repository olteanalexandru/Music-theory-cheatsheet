import React from 'react';
import { getGuitarTunings } from '@/app/utils/guitarTunings';

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
    // Add state for string count
    const [stringCount, setStringCount] = React.useState<6 | 7>(6);
    
    // Get available tunings based on string count for guitar
    const guitarTunings = React.useMemo(() => {
        return getGuitarTunings(stringCount);
    }, [stringCount]);
    
    const handleTuningChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTuningKey = e.target.value;
        if (instrument === 'guitar') {
            // Use the tuning from guitarTunings
            setTuning(guitarTunings[selectedTuningKey].notes.map(note => note.slice(0, -1)));
        } else {
            // Original bass tuning logic
            const basstuningMap: Record<string, string[]> = {
                standard: ['E', 'A', 'D', 'G'],
                // Add more bass tunings if needed
            };
            setTuning(basstuningMap[selectedTuningKey] || basstuningMap.standard);
        }
    };
    
    // Handle string count change
    const handleStringCountChange = (count: 6 | 7) => {
        setStringCount(count);
        // Reset to standard tuning when changing string count
        const standardTuning = getGuitarTunings(count).standard.notes.map(note => note.slice(0, -1));
        setTuning(standardTuning);
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
                <>
                    <div className="bg-gray-800 rounded-lg p-4">
                        <label className="text-gray-300 text-sm mb-2 block">Guitar Strings</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleStringCountChange(6)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                    ${stringCount === 6 
                                        ? 'bg-indigo-500 text-white' 
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                6 Strings
                            </button>
                            <button
                                onClick={() => handleStringCountChange(7)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                    ${stringCount === 7
                                        ? 'bg-indigo-500 text-white' 
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                7 Strings
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                        <label className="text-gray-300 text-sm mb-2 block">Guitar Tuning</label>
                        <select
                            onChange={handleTuningChange}
                            className="w-full bg-gray-700 text-gray-300 p-2 rounded-lg"
                        >
                            {Object.entries(guitarTunings).map(([key, tuningObj]) => (
                                <option key={key} value={key}>
                                    {tuningObj.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </>
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
                    onClick={() => {
                        console.log("Toggling landmark mode:", !useLandmarkNumbers);
                        setUseLandmarkNumbers(!useLandmarkNumbers);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${useLandmarkNumbers 
                            ? 'bg-indigo-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                    {useLandmarkNumbers ? 'Landmark Numbers' : 'Note System'}
                </button>
                <p className="mt-2 text-xs text-gray-400">
                    Current mode: {useLandmarkNumbers ? 'Landmark Numbers' : 'Note System'}
                </p>
            </div>
        </div>
    );
};

export default PatternControls;
