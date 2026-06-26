'use client';

import React, { useEffect, useState } from 'react';

interface GuitarFretPromptProps {
    stringIndex: number;
    fret: number;
}

const STRING_COUNT = 6;
const TOP_Y = 30;
const STRING_GAP = 26;
const NUT_X = 70;
const FRET_WIDTH = 40;
const FRET_COUNT = 12;
const OPEN_X = NUT_X - 35;
const SINGLE_DOT_FRETS = [3, 5, 7, 9];
const BOTTOM_Y = TOP_Y + (STRING_COUNT - 1) * STRING_GAP;
const RIGHT_X = NUT_X + FRET_COUNT * FRET_WIDTH;

// Row 0 (top) is the high E string (index 5); row 5 (bottom) is the low E (index 0) —
// matches how horizontal tab/fretboard diagrams are conventionally drawn.
function rowY(stringIndex: number): number {
    return TOP_Y + (STRING_COUNT - 1 - stringIndex) * STRING_GAP;
}

// Fretted notes sit at the midpoint between the fret's bounding lines; an open
// string's marker sits in the "headstock" area to the left of the nut.
function fretX(fret: number): number {
    return fret === 0 ? OPEN_X : NUT_X + (fret - 0.5) * FRET_WIDTH;
}

const GuitarFretPrompt: React.FC<GuitarFretPromptProps> = ({ stringIndex, fret }) => {
    const [isLightMode, setIsLightMode] = useState(false);

    useEffect(() => {
        const updateTheme = () => setIsLightMode(document.body.classList.contains('light-mode'));
        updateTheme();
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const stringColor = isLightMode ? 'rgba(67, 56, 202, 0.6)' : 'rgba(129, 140, 248, 0.5)';
    const fretColor = isLightMode ? 'rgba(15, 23, 42, 0.45)' : 'rgba(226, 232, 240, 0.35)';
    const nutColor = isLightMode ? 'rgba(15, 23, 42, 0.82)' : 'rgba(226, 232, 240, 0.7)';
    const markerColor = isLightMode ? 'rgba(15, 23, 42, 0.18)' : 'rgba(226, 232, 240, 0.15)';
    const targetFill = isLightMode ? 'rgba(79, 70, 229, 0.9)' : 'rgba(129, 140, 248, 0.9)';

    return (
        <svg viewBox={`0 0 ${RIGHT_X + 20} ${BOTTOM_Y + 20}`} className="w-full max-w-xl mx-auto" style={{ height: 'auto' }}>
            {SINGLE_DOT_FRETS.map((markerFret) => (
                <circle key={`marker-${markerFret}`} cx={fretX(markerFret)} cy={(TOP_Y + BOTTOM_Y) / 2} r={6} fill={markerColor} />
            ))}
            <circle cx={fretX(12)} cy={TOP_Y + STRING_GAP * 1.5} r={6} fill={markerColor} />
            <circle cx={fretX(12)} cy={TOP_Y + STRING_GAP * 3.5} r={6} fill={markerColor} />

            {Array.from({ length: FRET_COUNT }, (_, i) => i + 1).map((fretLine) => (
                <line
                    key={`fret-${fretLine}`}
                    x1={NUT_X + fretLine * FRET_WIDTH}
                    y1={TOP_Y - 10}
                    x2={NUT_X + fretLine * FRET_WIDTH}
                    y2={BOTTOM_Y + 10}
                    stroke={fretColor}
                    strokeWidth={2}
                />
            ))}

            {Array.from({ length: STRING_COUNT }, (_, i) => i).map((row) => (
                <line
                    key={`string-${row}`}
                    x1={OPEN_X - 10}
                    y1={TOP_Y + row * STRING_GAP}
                    x2={RIGHT_X}
                    y2={TOP_Y + row * STRING_GAP}
                    stroke={stringColor}
                    strokeWidth={1.5 + row * 0.35}
                />
            ))}

            <line x1={NUT_X} y1={TOP_Y - 10} x2={NUT_X} y2={BOTTOM_Y + 10} stroke={nutColor} strokeWidth={6} />

            <circle cx={fretX(fret)} cy={rowY(stringIndex)} r={10} fill={targetFill} />
        </svg>
    );
};

export default GuitarFretPrompt;
