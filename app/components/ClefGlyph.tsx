import React from 'react';

export interface ClefGlyphProps {
    clef: 'treble' | 'bass';
    /** x position of the staff's left edge */
    x: number;
    /** y position of the topmost staff line */
    topLineY: number;
    /** vertical distance between adjacent staff lines */
    lineGap: number;
    color: string;
}

// Hand-drawn vector clefs instead of the Unicode musical-symbol glyphs (𝄞/𝄢), which
// silently render as missing-glyph boxes on systems without a font that covers the
// Supplementary Multilingual Plane. Both clefs are anchored to the line they name:
// the treble clef's loop sits on the G line, the bass clef's dots straddle the F line.
const ClefGlyph: React.FC<ClefGlyphProps> = ({ clef, x, topLineY, lineGap, color }) => {
    const g = lineGap;

    if (clef === 'bass') {
        const fLineY = topLineY + g; // 2nd line from the top, per CLEFS.bass
        const hookX = x + g * 1.1;
        return (
            <g stroke={color} fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path
                    d={`M ${hookX} ${fLineY - g * 1.5}
                        C ${hookX - g * 1.4} ${fLineY - g * 1.4}, ${hookX - g * 1.4} ${fLineY + g * 0.3}, ${hookX} ${fLineY + g * 0.4}
                        L ${hookX} ${fLineY + g}`}
                    strokeWidth={g * 0.22}
                />
                <circle cx={hookX + g * 0.85} cy={fLineY - g * 0.5} r={g * 0.13} fill={color} stroke="none" />
                <circle cx={hookX + g * 0.85} cy={fLineY + g * 0.5} r={g * 0.13} fill={color} stroke="none" />
            </g>
        );
    }

    const bottomLineY = topLineY + g * 4;
    const gLineY = bottomLineY - g; // 2nd line from the bottom, per CLEFS.treble
    const stemX = x + g * 1.15;
    return (
        <g stroke={color} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path
                d={`M ${stemX + g * 0.5} ${topLineY - g * 2.0}
                    Q ${stemX - g * 0.6} ${topLineY - g * 1.9}, ${stemX - g * 0.3} ${topLineY - g * 1.6}
                    C ${stemX + g * 1.0} ${topLineY - g * 0.5}, ${stemX - g * 0.8} ${gLineY + g * 0.3}, ${stemX + g * 0.2} ${bottomLineY + g * 1.6}
                    Q ${stemX + g} ${bottomLineY + g * 1.9}, ${stemX + g * 0.6} ${bottomLineY + g * 1.3}`}
                strokeWidth={g * 0.2}
            />
            <circle cx={stemX} cy={gLineY} r={g * 0.55} strokeWidth={g * 0.16} />
        </g>
    );
};

export default ClefGlyph;
