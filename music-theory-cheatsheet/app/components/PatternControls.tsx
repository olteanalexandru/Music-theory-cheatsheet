
import React from 'react';

type PatternType = 'scales' | 'arpeggios';

type PatternControlsProps = {
    patterns: { [key: string]: { [key: string]: string[] } },
    patternType: string,
    setPatternType: (type: string) => void,
    selectedPattern: string | null,
    setSelectedPattern: (pattern: string | null) => void,
    chromaticScale: string[][],
    selectedRoot: string,
    setSelectedRoot: (root: string) => void
};

const PatternControls: React.FC<PatternControlsProps> = ({
    patterns,
    patternType,
    setPatternType,
    selectedPattern,
    setSelectedPattern,
    chromaticScale,
    selectedRoot,
    setSelectedRoot
}) => {
    return (
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
    );
};

export default PatternControls;