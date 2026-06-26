'use client';

import React, { useEffect, useState } from 'react';
import type { DurationName, RhythmEvent } from '@/app/utils/rhythmData';

interface RhythmNotationProps {
    events: RhythmEvent[];
    compact?: boolean;
}

const PX_PER_BEAT = 70;
const COMPACT_PX_PER_BEAT = 40;
const STEM_HEIGHT = 42;
const COMPACT_STEM_HEIGHT = 26;
const PADDING = 36;
const LINE_Y = 70;
const COMPACT_LINE_Y = 46;

function NoteGlyph({
    x, y, duration, stemHeight, color, bg,
}: { x: number; y: number; duration: DurationName; stemHeight: number; color: string; bg: string }) {
    const hollow = duration === 'whole' || duration === 'half' || duration === 'dotted-half';
    const hasStem = duration !== 'whole';
    const flagCount = duration === 'eighth' || duration === 'dotted-eighth' || duration === 'triplet-eighth' ? 1 : duration === 'sixteenth' ? 2 : 0;
    const dotted = duration.startsWith('dotted');
    const stemX = x + 7;
    const stemTopY = y - stemHeight;

    return (
        <g>
            {hasStem && <line x1={stemX} y1={y - 2} x2={stemX} y2={stemTopY} stroke={color} strokeWidth="2" />}
            {Array.from({ length: flagCount }).map((_, i) => (
                <path
                    key={i}
                    d={`M ${stemX} ${stemTopY + i * 9}
                        Q ${stemX + 11} ${stemTopY + i * 9 + 5}, ${stemX + 3} ${stemTopY + i * 9 + 16}`}
                    stroke={color}
                    fill="none"
                    strokeWidth="2"
                />
            ))}
            <ellipse
                cx={x}
                cy={y}
                rx="8"
                ry="6"
                fill={hollow ? bg : color}
                stroke={color}
                strokeWidth="2"
                transform={`rotate(-18 ${x} ${y})`}
            />
            {dotted && <circle cx={x + 14} cy={y - 4} r="2" fill={color} />}
        </g>
    );
}

function RestGlyph({ x, y, duration, color }: { x: number; y: number; duration: DurationName; color: string }) {
    const dotted = duration.startsWith('dotted');
    const dot = dotted && <circle cx={x + 13} cy={y} r="2" fill={color} />;

    if (duration === 'whole') {
        return <rect x={x - 8} y={y} width="16" height="6" fill={color} />;
    }
    if (duration === 'half' || duration === 'dotted-half') {
        return (
            <g>
                <rect x={x - 8} y={y - 6} width="16" height="6" fill={color} />
                {dot}
            </g>
        );
    }

    const flagCount = duration === 'eighth' || duration === 'dotted-eighth' || duration === 'triplet-eighth' ? 1 : duration === 'sixteenth' ? 2 : 0;
    return (
        <g>
            <path d={`M ${x - 4} ${y - 13} L ${x + 5} ${y + 13}`} stroke={color} strokeWidth="3" strokeLinecap="round" />
            {Array.from({ length: flagCount }).map((_, i) => (
                <circle key={i} cx={x - 1 + i * 6} cy={y - 7 + i * 9} r="2.6" fill={color} />
            ))}
            {dot}
        </g>
    );
}

// Renders one measure of rhythm notation on a single rhythm-staff line, scaling
// each event's width by its beat duration. compact shrinks it for use inside
// multiple-choice answer buttons.
const RhythmNotation: React.FC<RhythmNotationProps> = ({ events, compact = false }) => {
    const [isLightMode, setIsLightMode] = useState(false);

    useEffect(() => {
        const updateTheme = () => setIsLightMode(document.body.classList.contains('light-mode'));
        updateTheme();
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const lineStroke = isLightMode ? 'rgba(67, 56, 202, 0.6)' : 'rgba(129, 140, 248, 0.5)';
    const glyphColor = isLightMode ? 'rgba(79, 70, 229, 0.9)' : 'rgba(129, 140, 248, 0.85)';
    const bg = isLightMode ? '#f8fafc' : '#1e1b4b';

    const pxPerBeat = compact ? COMPACT_PX_PER_BEAT : PX_PER_BEAT;
    const stemHeight = compact ? COMPACT_STEM_HEIGHT : STEM_HEIGHT;
    const lineY = compact ? COMPACT_LINE_Y : LINE_Y;
    const totalBeats = events.reduce((sum, event) => sum + event.beats, 0);
    const width = PADDING * 2 + Math.max(totalBeats, 1) * pxPerBeat;
    const height = lineY + 24;

    const positions = events.reduce<{ cursor: number; xs: number[] }>(
        (acc, event) => {
            const eventWidth = event.beats * pxPerBeat;
            return { cursor: acc.cursor + eventWidth, xs: [...acc.xs, acc.cursor + eventWidth / 2] };
        },
        { cursor: PADDING, xs: [] }
    ).xs;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className={compact ? 'w-full' : 'w-full max-w-xl mx-auto'} style={{ height: 'auto' }}>
            <line x1={PADDING} y1={lineY} x2={width - PADDING} y2={lineY} stroke={lineStroke} strokeWidth="2" />
            <line x1={PADDING} y1={lineY - 18} x2={PADDING} y2={lineY + 18} stroke={lineStroke} strokeWidth="2" />
            <line x1={width - PADDING} y1={lineY - 18} x2={width - PADDING} y2={lineY + 18} stroke={lineStroke} strokeWidth="2" />
            {events.map((event, i) =>
                event.type === 'rest' ? (
                    <RestGlyph key={i} x={positions[i]} y={lineY} duration={event.duration} color={glyphColor} />
                ) : (
                    <NoteGlyph key={i} x={positions[i]} y={lineY} duration={event.duration} stemHeight={stemHeight} color={glyphColor} bg={bg} />
                )
            )}
        </svg>
    );
};

export default RhythmNotation;
