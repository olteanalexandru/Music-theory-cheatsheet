'use client';

import React from 'react';
import ScrollHint from '@/app/components/ScrollHint';

export interface PianoKeyboardProps {
    activeNotes: Set<number>;
    onNoteOn?: (midi: number) => void;
    onNoteOff?: (midi: number) => void;
    startMidi?: number;
    endMidi?: number;
}

const WHITE_PITCH_CLASSES = new Set([0, 2, 4, 5, 7, 9, 11]);
const WHITE_WIDTH = 22;
const WHITE_HEIGHT = 110;
const BLACK_WIDTH = 14;
const BLACK_HEIGHT = 68;

function isWhiteKey(midi: number): boolean {
    return WHITE_PITCH_CLASSES.has(((midi % 12) + 12) % 12);
}

interface KeyLayout {
    midi: number;
    isWhite: boolean;
    x: number;
}

// A black key always sits at the boundary between the white key just placed and the
// one about to be placed, so its x is simply the running white-key count times the
// white-key width — no per-pitch-class offset table needed.
function layoutKeys(startMidi: number, endMidi: number): { keys: KeyLayout[]; whiteCount: number } {
    const keys: KeyLayout[] = [];
    let whiteIndex = 0;
    for (let midi = startMidi; midi <= endMidi; midi++) {
        if (isWhiteKey(midi)) {
            keys.push({ midi, isWhite: true, x: whiteIndex * WHITE_WIDTH });
            whiteIndex++;
        } else {
            keys.push({ midi, isWhite: false, x: whiteIndex * WHITE_WIDTH - BLACK_WIDTH / 2 });
        }
    }
    return { keys, whiteCount: whiteIndex };
}

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
    activeNotes,
    onNoteOn,
    onNoteOff,
    startMidi = 36, // C2
    endMidi = 96, // C7
}) => {
    const { keys, whiteCount } = layoutKeys(startMidi, endMidi);
    const totalWidth = whiteCount * WHITE_WIDTH;
    const interactive = Boolean(onNoteOn || onNoteOff);

    const handleDown = (midi: number) => (event: React.PointerEvent) => {
        event.preventDefault();
        onNoteOn?.(midi);
    };
    const handleUp = (midi: number) => () => {
        onNoteOff?.(midi);
    };

    return (
        <ScrollHint className="w-full">
            <svg
                viewBox={`0 0 ${totalWidth} ${WHITE_HEIGHT}`}
                style={{ minWidth: totalWidth, height: 'auto' }}
                className="mx-auto block"
            >
                {keys.filter((key) => key.isWhite).map((key) => {
                    const active = activeNotes.has(key.midi);
                    const isC = ((key.midi % 12) + 12) % 12 === 0;
                    return (
                        <g key={key.midi}>
                            <rect
                                x={key.x}
                                y={0}
                                width={WHITE_WIDTH}
                                height={WHITE_HEIGHT}
                                rx={2}
                                fill={active ? 'rgba(129, 140, 248, 0.85)' : '#f1f5f9'}
                                stroke="#475569"
                                strokeWidth={1}
                                style={{ cursor: interactive ? 'pointer' : 'default' }}
                                onPointerDown={interactive ? handleDown(key.midi) : undefined}
                                onPointerUp={interactive ? handleUp(key.midi) : undefined}
                                onPointerLeave={interactive ? handleUp(key.midi) : undefined}
                            />
                            {isC && (
                                <text
                                    x={key.x + WHITE_WIDTH / 2}
                                    y={WHITE_HEIGHT - 8}
                                    fontSize={8}
                                    textAnchor="middle"
                                    fill="#64748b"
                                    style={{ pointerEvents: 'none' }}
                                >
                                    C{Math.floor(key.midi / 12) - 1}
                                </text>
                            )}
                        </g>
                    );
                })}

                {keys.filter((key) => !key.isWhite).map((key) => {
                    const active = activeNotes.has(key.midi);
                    return (
                        <rect
                            key={key.midi}
                            x={key.x}
                            y={0}
                            width={BLACK_WIDTH}
                            height={BLACK_HEIGHT}
                            rx={1.5}
                            fill={active ? 'rgba(99, 102, 241, 0.95)' : '#1e293b'}
                            stroke="#0f172a"
                            strokeWidth={1}
                            style={{ cursor: interactive ? 'pointer' : 'default' }}
                            onPointerDown={interactive ? handleDown(key.midi) : undefined}
                            onPointerUp={interactive ? handleUp(key.midi) : undefined}
                            onPointerLeave={interactive ? handleUp(key.midi) : undefined}
                        />
                    );
                })}
            </svg>
        </ScrollHint>
    );
};

export default PianoKeyboard;
