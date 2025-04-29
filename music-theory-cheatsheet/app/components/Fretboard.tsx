import React from 'react';
import type { Patterns, PatternType } from '@/app/page';

type FretboardProps = {
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
    tuning: string[]
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
    tuning
}) => {
    // Function to get the appropriate strings based on instrument and tuning/numChords
    const getStringsForDisplay = () => {
        if (instrument === 'guitar') {
            return tuning || []; // Add null check to ensure tuning is not undefined
        } else { // instrument === 'bass'
             const bassStringsMap: Record<number, string[]> = {
                 4: ['G', 'D', 'A', 'E'],
                 5: ['G', 'D', 'A', 'E', 'B'],
                 6: ['C', 'G', 'D', 'A', 'E', 'B']
             };
             const fallbackBassStrings = bassStringsMap[4]; // Default to 4 strings for bass
             return bassStringsMap[numChords] || fallbackBassStrings;
        }
    };

    // Get the actual strings to use
    const displayStrings = getStringsForDisplay();
    const currentNumStrings = displayStrings.length; // Get current number of strings for dynamic styling

    return (
        <div className="theme-card rounded-xl shadow-2xl overflow-x-auto">
            {/* Fret numbers and markers */}
            <div className="flex px-4 md:px-8 py-2 border-b theme-secondary-bg">
                <div className="w-8 md:w-16 flex-shrink-0"></div>
                {[...Array(16)].map((_, i) => (
                    <div key={i} className="flex-1 min-w-[30px] md:min-w-[60px] text-center theme-secondary-text text-xs md:text-sm">
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
            <div className={`px-2 md:px-4 py-4 ${currentNumStrings > 6 ? 'space-y-1' : currentNumStrings > 4 ? 'space-y-2' : 'space-y-4'}`}>
                {displayStrings.map((stringNote, index) => (
                    <div key={`${stringNote}-${index}`} className="flex items-center">
                        <div className="w-8 md:w-12 text-right pr-2 md:pr-4">
                            <span className={`
                                inline-flex items-center justify-center
                                w-6 h-6 md:w-8 md:h-8
                                rounded-full bg-indigo-500
                                text-white font-semibold
                                ${currentNumStrings > 6 ? 'text-xs' : currentNumStrings > 4 ? 'text-xs md:text-sm' : 'text-sm md:text-base'}
                            `}>
                                {useLandmarkNumbers ? noteToLandmarkNumber(stringNote) : stringNote}
                            </span>
                        </div>

                        {[...Array(16)].map((_, fret) => {
                            if (fret === 0) return <div key={fret} className="flex-1 min-w-[30px] md:min-w-[60px] flex justify-center relative"></div>;

                            const note = getNoteAtFret(stringNote, fret);
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
                                            ${currentNumStrings > 6 ? 'w-6 h-6 md:w-9 md:h-9' : currentNumStrings > 4 ? 'w-7 h-7 md:w-10 md:h-10' : 'w-8 h-8 md:w-12 md:h-12'}
                                            rounded-full flex items-center justify-center
                                            text-xs md:text-sm font-medium transition-all duration-200
                                            ${isRoot ? 'theme-accent-bg theme-text scale-110' :
                                                isInPattern ? 'bg-indigo-400 bg-opacity-75 theme-text' :
                                                isHovered ? 'theme-secondary-bg theme-text' :
                                                'theme-muted-bg theme-secondary-text hover:opacity-90'}
                                            cursor-pointer transform hover:scale-105
                                        `}
                                        onMouseEnter={() => setHoveredNote(note)}
                                        onMouseLeave={() => setHoveredNote(null)}
                                    >
                                        {displayNote}
                                    </div>
                                    <div className="absolute top-1/2 left-0 w-full h-[1px] md:h-[2px] theme-secondary-bg" style={{ zIndex: -1, transform: 'translateY(-50%)' }}></div>
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
