'use client';

import React, { useState, useEffect } from 'react';

const circleOfFifths = {
    order: ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'],
    relatives: {
        C: 'Am',
        G: 'Em',
        D: 'Bm',
        A: 'F#m',
        E: 'C#m',
        B: 'G#m',
        'F#': 'D#m',
        Db: 'Bbm',
        Ab: 'Fm',
        Eb: 'Cm',
        Bb: 'Gm',
        F: 'Dm'
    },
    numberOfSharps: {
        C: 0,
        G: 1,
        D: 2,
        A: 3,
        E: 4,
        B: 5,
        'F#': 6,
        Db: 5,
        Ab: 4,
        Eb: 3,
        Bb: 2,
        F: 1
    },
    sharpsOrder: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'],
    flatsOrder: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'],
    chordQualities: {
        major: ['I', 'V', 'IV'],
        minor: ['vi', 'ii', 'iii']
    }
};

interface CircleOfFifthsProps {
    initialSelectedRoot: string;
}

export const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({ initialSelectedRoot }) => {
    const [selectedRoot, setSelectedRoot] = useState<string>('');
    const [showChords, setShowChords] = useState<boolean>(false);

    useEffect(() => {
        setSelectedRoot(initialSelectedRoot);
    }, [initialSelectedRoot]);

    useEffect(() => {
        // Any client-specific logic can go here
    }, []);

    type Note = keyof typeof circleOfFifths.numberOfSharps;

    const getKeySignature = (note: Note): string => {
        const count = circleOfFifths.numberOfSharps[note];
        if (note === 'C') return 'No sharps or flats';
        if (['G', 'D', 'A', 'E', 'B', 'F#'].includes(note)) {
            return `${count} sharp${count > 1 ? 's' : ''}: ${circleOfFifths.sharpsOrder.slice(0, count).join(', ')}`;
        }
        return `${count} flat${count > 1 ? 's' : ''}: ${circleOfFifths.flatsOrder.slice(0, count).join(', ')}`;
    };

    const getPrimaryChords = (root: string) => {
        return {
            I: root,
            IV: circleOfFifths.order[(circleOfFifths.order.indexOf(root) + 11) % 12],
            V: circleOfFifths.order[(circleOfFifths.order.indexOf(root) + 1) % 12]
        };
    };

    const renderNote = (note: string, index: number, radius: number, isMajor: boolean) => {
        const angle = (index * 30 - 90) * (Math.PI / 180);
        const x = (50 + radius * Math.cos(angle)).toFixed(2);
        const y = (50 + radius * Math.sin(angle)).toFixed(2);
        const isSelected = selectedRoot === note;
        const bgColor = isMajor ? (isSelected ? 'bg-indigo-500' : 'bg-gray-700 hover:bg-gray-600') : (isSelected ? 'bg-indigo-400' : 'bg-gray-600');
        const size = isMajor ? 'w-12 h-12' : 'w-10 h-10';
        const fontSize = isMajor ? 'font-bold' : 'text-sm';

        return (
            <div
                key={note}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${size} rounded-full 
                    flex items-center justify-center cursor-pointer transition-colors duration-200
                    ${bgColor} text-white ${fontSize}`}
                style={{ left: `${x}%`, top: `${y}%` }}
                onClick={() => setSelectedRoot(note)}
            >
                {isMajor ? note : circleOfFifths.relatives[note as keyof typeof circleOfFifths.relatives]}
            </div>
        );
    };

    return (
        <div className="bg-gray-800 rounded-lg p-4 md:p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg md:text-xl font-bold text-white">Circle of Fifths</h3>
                <button
                    onClick={() => setShowChords(!showChords)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                    {showChords ? 'Hide Chords' : 'Show Chords'}
                </button>
            </div>

            <div className="relative w-full aspect-square max-w-[300px] md:max-w-[500px] mx-auto">
                {/* Outer circle background */}
                <div className="absolute inset-0 rounded-full border-4 border-gray-600" />
                
                {/* Inner circle background */}
                <div className="absolute inset-[25%] rounded-full border-2 border-gray-600" />

                {circleOfFifths.order.map((note, index) => renderNote(note, index, 40, true))}
                {circleOfFifths.order.map((note, index) => renderNote(note, index, 25, false))}
            </div>

            <div className="mt-6 text-gray-300 space-y-4">
                <div>
                    <h4 className="font-semibold mb-2">Selected Key: {selectedRoot}</h4>
                    <p>Key Signature: {getKeySignature(selectedRoot as Note)}</p>
                    <p>Relative Minor: {circleOfFifths.relatives[selectedRoot as Note]}</p>
                </div>

                {showChords && (
                    <div>
                        <h4 className="font-semibold mb-2">Primary Chords:</h4>
                        <div className="grid grid-cols-3 gap-4">
                            {Object.entries(getPrimaryChords(selectedRoot)).map(([roman, chord]) => (
                                <div key={roman} className="bg-gray-700 p-2 rounded text-center">
                                    <div className="text-sm text-gray-400">{roman}</div>
                                    <div className="font-bold">{chord}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <h4 className="font-semibold mb-2">Key Relationships:</h4>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Moving clockwise: add one sharp</li>
                        <li>Moving counterclockwise: add one flat</li>
                        <li>Inner circle shows relative minor keys</li>
                        <li>Adjacent keys are closely related</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CircleOfFifths;
