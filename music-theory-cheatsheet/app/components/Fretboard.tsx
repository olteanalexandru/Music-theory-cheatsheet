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
    isNoteInPattern: (note: string, root: string, intervals: number[]) => boolean
};

type PatternName = string;  // e.g., 'Ionian (Major)', 'Dorian', etc.

const Fretboard: React.FC<FretboardProps> = ({
    strings,
    getNoteAtFret,
    hoveredNote,
    setHoveredNote,
    selectedRoot,
    selectedPattern,
    patterns,
    patternType,
    isNoteInPattern
}) => {
    return (
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
    );
};

export default Fretboard;