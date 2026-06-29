'use client';

import React, { useEffect, useState } from 'react';
import ClefGlyph from '@/app/components/ClefGlyph';
import { clefOffsetFromMiddleC, type ClefId } from '@/app/utils/staffLayout';

interface GrandStaffPromptProps {
    clef: ClefId;
    step: number;
    ledgerSteps: number[];
}

const STAFF_LEFT = 76;
const STAFF_RIGHT = 330;
const TOP_LINE_Y = 130; // y of the treble staff's top line (global step 10)
const LINE_GAP = 14;
const NOTE_X = 250;
const BRACE_X = STAFF_LEFT - 18;

// One continuous vertical scale spanning both staves: global step 0 is middle C,
// which lands exactly one line-gap below the treble staff and one line-gap above
// the bass staff (the shared ledger line between the two clefs). See
// clefOffsetFromMiddleC for how a clef-local step is converted into this scale.
function yForGlobalStep(globalStep: number): number {
    return TOP_LINE_Y + (10 - globalStep) * (LINE_GAP / 2);
}

const TREBLE_TOP_LINE_Y = TOP_LINE_Y;
const BASS_TOP_LINE_Y = yForGlobalStep(-2);
const BASS_BOTTOM_LINE_Y = yForGlobalStep(-10);

const GrandStaffPrompt: React.FC<GrandStaffPromptProps> = ({ clef, step, ledgerSteps }) => {
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

    const offset = clefOffsetFromMiddleC(clef);
    const globalStep = step + offset;
    const globalLedgerSteps = ledgerSteps.map((s) => s + offset);
    const noteY = yForGlobalStep(globalStep);

    return (
        <svg viewBox="0 0 400 380" className="w-full max-w-sm mx-auto" style={{ height: 'auto' }}>
            <path
                d={`M ${BRACE_X} ${TREBLE_TOP_LINE_Y}
                    C ${BRACE_X - 16} ${TREBLE_TOP_LINE_Y + 30}, ${BRACE_X - 16} ${BASS_BOTTOM_LINE_Y - 30}, ${BRACE_X} ${BASS_BOTTOM_LINE_Y}
                    M ${BRACE_X} ${TREBLE_TOP_LINE_Y}
                    C ${BRACE_X + 10} ${TREBLE_TOP_LINE_Y + 40}, ${BRACE_X + 14} ${(TREBLE_TOP_LINE_Y + BASS_BOTTOM_LINE_Y) / 2 - 12}, ${BRACE_X + 18} ${(TREBLE_TOP_LINE_Y + BASS_BOTTOM_LINE_Y) / 2}
                    C ${BRACE_X + 14} ${(TREBLE_TOP_LINE_Y + BASS_BOTTOM_LINE_Y) / 2 + 12}, ${BRACE_X + 10} ${BASS_BOTTOM_LINE_Y - 40}, ${BRACE_X} ${BASS_BOTTOM_LINE_Y}`}
                stroke={staffTextColor}
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
            />

            <line x1={STAFF_LEFT} y1={TREBLE_TOP_LINE_Y} x2={STAFF_LEFT} y2={BASS_BOTTOM_LINE_Y} stroke={staffStroke} strokeWidth="2" />
            <line x1={STAFF_RIGHT} y1={TREBLE_TOP_LINE_Y} x2={STAFF_RIGHT} y2={BASS_BOTTOM_LINE_Y} stroke={staffStroke} strokeWidth="2" />

            {[0, 1, 2, 3, 4].map((line) => (
                <line
                    key={`treble-line-${line}`}
                    x1={STAFF_LEFT}
                    y1={TREBLE_TOP_LINE_Y + line * LINE_GAP}
                    x2={STAFF_RIGHT}
                    y2={TREBLE_TOP_LINE_Y + line * LINE_GAP}
                    stroke={staffStroke}
                    strokeWidth="2"
                />
            ))}
            <ClefGlyph clef="treble" x={STAFF_LEFT} topLineY={TREBLE_TOP_LINE_Y} lineGap={LINE_GAP} color={staffTextColor} />

            {[0, 1, 2, 3, 4].map((line) => (
                <line
                    key={`bass-line-${line}`}
                    x1={STAFF_LEFT}
                    y1={BASS_TOP_LINE_Y + line * LINE_GAP}
                    x2={STAFF_RIGHT}
                    y2={BASS_TOP_LINE_Y + line * LINE_GAP}
                    stroke={staffStroke}
                    strokeWidth="2"
                />
            ))}
            <ClefGlyph clef="bass" x={STAFF_LEFT} topLineY={BASS_TOP_LINE_Y} lineGap={LINE_GAP} color={staffTextColor} />

            {globalLedgerSteps.map((ledgerStep) => (
                <line
                    key={`ledger-${ledgerStep}`}
                    x1={NOTE_X - 18}
                    y1={yForGlobalStep(ledgerStep)}
                    x2={NOTE_X + 18}
                    y2={yForGlobalStep(ledgerStep)}
                    stroke={ledgerStroke}
                    strokeWidth="1.5"
                />
            ))}

            <circle cx={NOTE_X} cy={noteY} r="9" fill={noteFill} />
        </svg>
    );
};

export default GrandStaffPrompt;
