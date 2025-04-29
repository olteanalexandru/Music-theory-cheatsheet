import React, { useState, useEffect } from 'react';
import { guitarTunings, defaultBassTuningName } from '@/app/utils/guitarTunings';

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
    setTuning: (tuning: string[]) => void
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
    setTuning
}) => {
    const [selectedTuningName, setSelectedTuningName] = useState<string>(defaultBassTuningName);
    const [isMounted, setIsMounted] = useState(false); // Track mount status

    // Set mounted state only on client
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        // Run effect only after mounting
        if (isMounted) {
            setTuning(guitarTunings[selectedTuningName]);
        }
    }, [selectedTuningName, setTuning, isMounted]); // Add isMounted dependency

    useEffect(() => {
        // Run effect only after mounting
        if (isMounted) {
            if (instrument === 'bass') {
                // Avoid unnecessary state update if already default
                if (selectedTuningName !== defaultBassTuningName) {
                    setSelectedTuningName(defaultBassTuningName);
                }
            } else {
                setTuning(guitarTunings[selectedTuningName]);
            }
        }
    }, [instrument, setTuning, isMounted, selectedTuningName]); // Add isMounted and selectedTuningName dependencies

    const handleTuningChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTuningName = e.target.value;
        setSelectedTuningName(newTuningName);
    };

    return (
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pattern Type Selection */}
            <div className="theme-card rounded-lg p-4">
                <label className="theme-secondary-text text-sm mb-2 block">Pattern Type</label>
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
                                    ? 'theme-accent-bg' 
                                    : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                        >
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Root Note Selection */}
            <div className="theme-card rounded-lg p-4">
                <label className="theme-secondary-text text-sm mb-2 block">Root Note</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
                    {chromaticScale.flat().map(note => (
                        <button
                            key={note}
                            onClick={() => setSelectedRoot(note)}
                            className={`p-2 rounded text-sm font-medium transition-colors
                                ${selectedRoot === note 
                                    ? 'theme-accent-bg' 
                                    : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                        >
                            {note}
                        </button>
                    ))}
                </div>
            </div>

            {/* Number of Chords Selection - Only show for bass */}
            {instrument === 'bass' && (
                <div className="theme-card rounded-lg p-4">
                    <label className="theme-secondary-text text-sm mb-2 block">Number of Strings</label>
                    <select
                        value={numChords}
                        onChange={(e) => setNumChords(Number(e.target.value))}
                        className="w-full theme-muted-bg theme-secondary-text p-2 rounded-lg"
                    >
                        {[4, 5, 6].map(num => (
                            <option key={num} value={num}>
                                {num}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Instrument Selection */}
            <div className="theme-card rounded-lg p-4">
                <label className="theme-secondary-text text-sm mb-2 block">Instrument</label>
                <select
                    value={instrument}
                    onChange={(e) => setInstrument(e.target.value as 'bass' | 'guitar')}
                    className="w-full theme-muted-bg theme-secondary-text p-2 rounded-lg"
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
                <div className="theme-card rounded-lg p-4">
                    <label className="theme-secondary-text text-sm mb-2 block">Tuning</label>
                    <select
                        value={selectedTuningName}
                        onChange={handleTuningChange}
                        className="w-full theme-muted-bg theme-secondary-text p-2 rounded-lg"
                    >
                        {Object.keys(guitarTunings).map(tuningName => (
                            <option key={tuningName} value={tuningName}>
                                {tuningName.charAt(0).toUpperCase() + tuningName.slice(1)} ({guitarTunings[tuningName].join(' ')})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Pattern Selection */}
            <div className="theme-card rounded-lg p-4 col-span-2">
                <label className="theme-secondary-text text-sm mb-2 block">
                    {patternType === 'scales' ? 'Scale/Mode' : patternType === 'arpeggios' ? 'Arpeggio Type' : 'Chord Type'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.keys(patterns[patternType]).map(pattern => (
                        <button
                            key={pattern}
                            onClick={() => setSelectedPattern(pattern)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                ${selectedPattern === pattern 
                                    ? 'theme-accent-bg' 
                                    : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                        >
                            {pattern}
                        </button>
                    ))}
                </div>
            </div>

            {/* Display Mode Selection */}
            <div className="theme-card rounded-lg p-4">
                <label className="theme-secondary-text text-sm mb-2 block">Display Mode</label>
                <button
                    onClick={() => setUseLandmarkNumbers(!useLandmarkNumbers)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full mb-2
                        ${useLandmarkNumbers 
                            ? 'theme-accent-bg' 
                            : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                >
                    {useLandmarkNumbers ? 'Landmark Numbers' : 'Note System'}
                </button>
                {useLandmarkNumbers && !selectedRoot && (
                    <p className="text-xs text-yellow-400 mt-1">Select a root note to see landmark numbers.</p>
                )}
            </div>
        </div>
    );
};

export default PatternControls;
