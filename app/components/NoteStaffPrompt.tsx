'use client';

import React, { useEffect, useState } from 'react';
import { CLEFS, type ClefId } from '@/app/utils/staffLayout';

interface NoteStaffPromptProps {
    clef: ClefId;
    step: number;
    ledgerSteps: number[];
}

const STAFF_LEFT = 60;
const STAFF_RIGHT = 300;
const TOP_LINE_Y = 90;
const LINE_GAP = 22;
const NOTE_X = 220;

const CLEF_SYMBOL_STYLE: Record<ClefId, { x: number; y: number; fontSize: number }> = {
    treble: { x: 78, y: 159, fontSize: 70 },
    bass: { x: 73, y: 132, fontSize: 52 },
};

function yForStep(step: number): number {
    return TOP_LINE_Y + 4 * LINE_GAP - step * (LINE_GAP / 2);
}

const NoteStaffPrompt: React.FC<NoteStaffPromptProps> = ({ clef, step, ledgerSteps }) => {
    const [isLightMode, setIsLightMode] = useState(false);

    useEffect(() => {
        const updateTheme = () => setIsLightMode(document.body.classList.contains('light-mode'));
        updateTheme();
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const staffStroke = isLightMode ? 'rgba(67, 56, 202, 0.6)' : 'rgba(129, 140, 248, 0.5)';
    const staffTextColor = isLightMode ? 'rgba(15, 23, 42, 0.82)' : 'rgba(129, 140, 248, 0.7)';
    const noteFill = isLightMode ? 'rgba(79, 70, 229, 0.9)' : 'rgba(129, 140, 248, 0.8)';
    const ledgerStroke = isLightMode ? 'rgba(79, 70, 229, 0.35)' : 'rgba(129, 140, 248, 0.3)';

    const clefStyle = CLEF_SYMBOL_STYLE[clef];
    const noteY = yForStep(step);

    return (
        <svg viewBox="0 0 360 280" className="w-full max-w-sm mx-auto" style={{ height: 'auto' }}>
            {[0, 1, 2, 3, 4].map((line) => (
                <line
                    key={`line-${line}`}
                    x1={STAFF_LEFT}
                    y1={TOP_LINE_Y + line * LINE_GAP}
                    x2={STAFF_RIGHT}
                    y2={TOP_LINE_Y + line * LINE_GAP}
                    stroke={staffStroke}
                    strokeWidth="2"
                />
            ))}

            <text x={clefStyle.x} y={clefStyle.y} fontSize={clefStyle.fontSize} fill={staffTextColor} fontFamily="serif">
                {CLEFS[clef].symbol}
            </text>

            {ledgerSteps.map((ledgerStep) => (
                <line
                    key={`ledger-${ledgerStep}`}
                    x1={NOTE_X - 18}
                    y1={yForStep(ledgerStep)}
                    x2={NOTE_X + 18}
                    y2={yForStep(ledgerStep)}
                    stroke={ledgerStroke}
                    strokeWidth="1.5"
                />
            ))}

            <circle cx={NOTE_X} cy={noteY} r="10" fill={noteFill} />
        </svg>
    );
};

export default NoteStaffPrompt;
