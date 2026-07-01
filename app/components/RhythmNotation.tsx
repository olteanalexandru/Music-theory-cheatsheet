'use client';

import React, { useEffect, useState } from 'react';
import type { DurationName, RhythmEvent } from '@/app/utils/rhythmData';
import type { RhythmJudgement } from '@/app/utils/rhythmFollow';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';

interface RhythmNotationProps {
    events: RhythmEvent[];
    compact?: boolean;
    // Per-event tap-along feedback; entries are only meaningful for 'note'
    // events (rests expect no input) and default to the neutral glyph color
    // when omitted, so existing callers that don't pass this render unchanged.
    judgements?: (RhythmJudgement | undefined)[];
    // Cumulative beats elapsed since the pattern started; draws a moving
    // vertical playhead line at that position. Omit to hide it.
    playheadBeats?: number;
}

const JUDGEMENT_GLYPH_COLORS: Record<Exclude<RhythmJudgement, 'pending'>, string> = {
    hit: '#22c55e',
    missed: '#64748b',
};
const PLAYHEAD_COLOR = '#f59e0b';

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
const RhythmNotation: React.FC<RhythmNotationProps> = ({ events, compact = false, judgements, playheadBeats }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const t = useTranslations('rhythm');
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

    // Glyphs sit at the start of their duration column (true onset), not the
    // center — the moving playhead and the tap-along grading engine both track
    // onset time linearly, so centering would draw notes later than when
    // they're actually due, making in-time taps register as early.
    const positions = events.reduce<{ cursor: number; xs: number[] }>(
        (acc, event) => {
            const eventWidth = event.beats * pxPerBeat;
            return { cursor: acc.cursor + eventWidth, xs: [...acc.xs, acc.cursor] };
        },
        { cursor: PADDING, xs: [] }
    ).xs;

    const playheadX = playheadBeats !== undefined
        ? Math.min(Math.max(PADDING + playheadBeats * pxPerBeat, PADDING), width - PADDING)
        : null;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className={compact ? 'w-full' : 'w-full max-w-xl mx-auto'} style={{ height: 'auto' }}>
            <line x1={PADDING} y1={lineY} x2={width - PADDING} y2={lineY} stroke={lineStroke} strokeWidth="2" />
            <line x1={PADDING} y1={lineY - 18} x2={PADDING} y2={lineY + 18} stroke={lineStroke} strokeWidth="2" />
            <line x1={width - PADDING} y1={lineY - 18} x2={width - PADDING} y2={lineY + 18} stroke={lineStroke} strokeWidth="2" />
            {events.map((event, i) => {
                const judgement = judgements?.[i];
                const color = judgement && judgement !== 'pending' ? JUDGEMENT_GLYPH_COLORS[judgement] : glyphColor;
                return event.type === 'rest' ? (
                    <RestGlyph key={i} x={positions[i]} y={lineY} duration={event.duration} color={color} />
                ) : (
                    <NoteGlyph key={i} x={positions[i]} y={lineY} duration={event.duration} stemHeight={stemHeight} color={color} bg={bg} />
                );
            })}
            {playheadX !== null && (
                <line x1={playheadX} y1={lineY - 24} x2={playheadX} y2={lineY + 24} stroke={PLAYHEAD_COLOR} strokeWidth="2" />
            )}
        </svg>
    );
};

export default RhythmNotation;
