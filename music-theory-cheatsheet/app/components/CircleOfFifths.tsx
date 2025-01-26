'use client';

import React, { useState, useEffect } from 'react';
import { circleOfFifths } from '@/app/utils/musicTheory';

interface CircleOfFifthsProps {
    initialSelectedRoot: string;
    mode: 'bass' | 'guitar';
}

export const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({ initialSelectedRoot, mode }) => {
    const [selectedRoot, setSelectedRoot] = useState<string>('');
    const [showChords, setShowChords] = useState<boolean>(false);

    useEffect(() => {
        setSelectedRoot(initialSelectedRoot);
    }, [initialSelectedRoot]);

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
        const scale = circleOfFifths.scaleDegrees[root as keyof typeof circleOfFifths.scaleDegrees];
        return {
            I: scale[0],             // Tonic (1st degree)
            IV: scale[3],            // Subdominant (4th degree)
            V: scale[4]              // Dominant (5th degree)
        };
    };

    const getDerivedChords = (root: string) => {
        const scale = circleOfFifths.scaleDegrees[root as keyof typeof circleOfFifths.scaleDegrees];
        return {
            ii: `${scale[1]}m`,      // Supertonic (2nd degree)
            iii: `${scale[2]}m`,     // Mediant (3rd degree)
            vi: `${scale[5]}m`,      // Submediant (6th degree)
            vii: `${scale[6]}dim`    // Leading tone (7th degree)
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
                <div className="absolute inset-0 rounded-full border-4 border-gray-600" />
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

                        <h4 className="font-semibold mt-4 mb-2">Derived Chords</h4>
                        <div className="grid grid-cols-4 gap-4">
                            {Object.entries(getDerivedChords(selectedRoot)).map(([roman, chord]) => (
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
            <br/><br/>
    <h1>Finding Relatives Using the Circle of Fifths</h1>
    <ul>
        <li>
            <p><strong>To find the 2nd degree (Dorian mode)</strong></p>
            <p>Count 2 notes to the right.<br/>
               Or, look below at the note on the left.</p>
        </li>
        <li>
            <p><strong>To find the 3rd degree (Phrygian mode)</strong></p>
            <p>Count 4 notes to the right.<br/>
               Or, look below at the note on the right.</p>
        </li>
        <li>
            <p><strong>To find the 4th degree (Lydian mode)</strong></p>
            <p>Count 1 note to the left.</p>
        </li>
        <li>
            <p><strong>To find the 5th degree (Mixolydian mode)</strong></p>
            <p>Count 1 note to the right.</p>
        </li>
        <li>
            <p><strong>To find the 6th degree (Aeolian mode/relative minor)</strong></p>
            <p>Count 3 notes to the right.<br/>
               Or, look below.</p>
        </li>
        <li>
            <p><strong>To find the 7th degree (Locrian mode)</strong></p>
            <p>Count 5 notes to the right.<br/>
               Or, look below at the note on the right.</p>
        </li>
    </ul>


        </div>
    );
};

export default CircleOfFifths;
