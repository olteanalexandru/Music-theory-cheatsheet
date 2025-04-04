import React from 'react';
import type { Patterns, PatternType } from '@/app/page';

type FretboardProps = {
    strings: string[],
    getNoteAtFret: (string: string, fret: number) => string,
    hoveredNote: string | null,
    setHoveredNote: (note: string | null) => void,
    selectedRoot: string | null,
    selectedPattern: string | null,
    patterns: Patterns,
    patternType: PatternType,
    isNoteInPattern: (note: string, root: string, intervals: number[]) => boolean,
    numChords: number,
    useLandmarkNumbers: boolean,
    noteToLandmarkNumber: (note: string) => number | string,
    instrument: 'bass' | 'guitar',
    tuning: string[] // New prop for tuning
};

type PatternName = string;

const Fretboard: React.FC<FretboardProps> = ({
    getNoteAtFret,
    hoveredNote,
    setHoveredNote,
    selectedRoot,
    selectedPattern,
    patterns,
    patternType,
    isNoteInPattern,
    numChords,
    useLandmarkNumbers,
    noteToLandmarkNumber,
    instrument,
    tuning // New prop for tuning
}) => {
    // Function to get the appropriate strings based on numChords
    const getStringsForInstrument = () => {
        const stringsMap: Record<string, Record<number, string[]>> = {
            bass: {
                4: ['G', 'D', 'A', 'E'],
                5: ['G', 'D', 'A', 'E', 'B'],
                6: ['C', 'G', 'D', 'A', 'E', 'B']
            },
            guitar: {
                6: tuning, // Use the selected tuning for guitar
                7: [...tuning, 'B'] // Example for 7-string guitar
            }
        };
        const fallback = instrument === 'guitar' ? 6 : 4;
        return stringsMap[instrument][numChords] || stringsMap[instrument][fallback];
    };

    // Get the actual strings to use
    const instrumentStrings = getStringsForInstrument();

    return (
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-x-auto">
            {/* Fret numbers and markers */}
            <div className="flex px-4 md:px-8 py-2 border-b border-gray-700">
                <div className="w-8 md:w-16 flex-shrink-0"></div>
                {[...Array(16)].map((_, i) => (
                    <div key={i} className="flex-1 min-w-[30px] md:min-w-[60px] text-center text-gray-400 text-xs md:text-sm">
                        {i}
                        {[3, 5, 7, 9, 12, 15].includes(i) && (
                            <div className={`flex justify-center mt-1 ${[12].includes(i) ? 'space-x-2' : ''}`}>
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-indigo-400"></div>
                                {[12].includes(i) && <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-indigo-400"></div>}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Strings and notes */}
            <div className={`px-2 md:px-4 py-4 ${numChords > 4 ? 'space-y-2' : 'space-y-4'}`}>
                {instrumentStrings.map((string, index) => (
                    <div key={`${string}-${index}`} className="flex items-center">
                        <div className="w-8 md:w-12 text-right pr-2 md:pr-4">
                            <span className={`
                                inline-flex items-center justify-center 
                                w-6 h-6 md:w-8 md:h-8 
                                rounded-full bg-indigo-500 
                                text-white font-semibold
                                ${numChords > 4 ? 'text-xs md:text-sm' : 'text-sm md:text-base'}
                            `}>
                                {useLandmarkNumbers ? noteToLandmarkNumber(getNoteAtFret(string, 0)) : string}
                            </span>
                        </div>
                        
                        {[...Array(16)].map((_, fret) => {
                            // if fret is 0 skip
                            if (fret === 0) return null;
                            const note = getNoteAtFret(string, fret);
                            const displayNote = useLandmarkNumbers ? noteToLandmarkNumber(note) : note;
                            const isHovered = hoveredNote === note;
                            const isInPattern = selectedPattern && selectedRoot && 
                                isNoteInPattern(note, selectedRoot, patterns[patternType][selectedPattern as PatternName].intervals);
                            const isRoot = note === selectedRoot;
                            
                            return (
                                <div 
                                    key={fret}
                                    className="flex-1 min-w-[30px] md:min-w-[60px] flex justify-center relative"
                                >
                                    <div 
                                        className={`
                                            ${numChords > 4 ? 'w-7 h-7 md:w-10 md:h-10' : 'w-8 h-8 md:w-12 md:h-12'}
                                            rounded-full flex items-center justify-center
                                            text-xs md:text-sm font-medium transition-all duration-200
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
                                        {displayNote}
                                    </div>
                                    {fret !== 0 && (
                                        <div className="absolute top-1/2 w-full h-[1px] md:h-[2px] bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600" style={{ zIndex: -1 }}></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Fretboard;
