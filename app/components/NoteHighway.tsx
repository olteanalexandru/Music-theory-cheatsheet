'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import type { GradedNote, NoteJudgement } from '@/app/utils/scoreFollow';

interface NoteHighwayProps {
    notes: GradedNote[];
    getSongMs: () => number;
    running: boolean;
    durationMs: number;
    tuningNames?: string[] | null;
    onSwitchToRoll?: () => void;
}

const PIXELS_PER_MS = 0.15;
const PLAYHEAD_FRACTION = 0.18;
const LANE_HEIGHT = 34;
const LANE_LABEL_WIDTH = 32;
const MIN_HEIGHT = 120;
const MAX_HEIGHT = 320;

function judgementStyle(judgement: NoteJudgement): { bg: string; glow: boolean } {
    switch (judgement) {
        case 'hit':
            return { bg: '#22c55e', glow: true };
        case 'wrong':
            return { bg: '#ef4444', glow: false };
        case 'missed':
            return { bg: '#64748b', glow: false };
        default:
            return { bg: '#818cf8', glow: false };
    }
}

function formatTime(ms: number): string {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// A Yousician-style scrolling "note highway": one horizontal lane per
// string, fret-numbered note gems scrolling toward a fixed hit line. Reuses
// the same GradedNote judgement coloring as the piano-roll view so hit/wrong/
// missed feedback updates live during playback. Runs its own rAF loop off
// getSongMs/running (mirroring ScoreNotation's cursor), so the parent only
// needs to re-render this when `notes` actually changes judgement.
const NoteHighway: React.FC<NoteHighwayProps> = ({ notes, getSongMs, running, durationMs, tuningNames, onSwitchToRoll }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const scrollLayerRef = useRef<HTMLDivElement | null>(null);
    const timeLabelRef = useRef<HTMLSpanElement | null>(null);

    const frettedNotes = useMemo(() => notes.filter((n) => n.string != null && n.fret != null), [notes]);
    const stringCount = useMemo(
        () => frettedNotes.reduce((max, n) => Math.max(max, n.string ?? 0), tuningNames?.length ?? 0),
        [frettedNotes, tuningNames]
    );

    const height = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, stringCount * LANE_HEIGHT));
    const stringToTop = (stringNum: number) => (stringCount - stringNum) * LANE_HEIGHT;

    useEffect(() => {
        if (!running) return;
        let rafId = 0;
        const tick = () => {
            const nowMs = getSongMs();
            const playheadX = (containerRef.current?.clientWidth ?? 0) * PLAYHEAD_FRACTION - LANE_LABEL_WIDTH;
            if (scrollLayerRef.current) {
                scrollLayerRef.current.style.transform = `translateX(${playheadX - nowMs * PIXELS_PER_MS}px)`;
            }
            if (timeLabelRef.current) {
                timeLabelRef.current.textContent = `${formatTime(nowMs)} / ${formatTime(durationMs)}`;
            }
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [running, getSongMs, durationMs]);

    if (stringCount === 0) {
        return (
            <div className="theme-secondary-text text-sm p-4 flex flex-col gap-2">
                <p>This track has no fretted note positions to display in the Note Highway.</p>
                {onSwitchToRoll && (
                    <button
                        onClick={onSwitchToRoll}
                        className="self-start px-3 py-1.5 rounded-lg text-sm theme-btn hover:opacity-90"
                    >
                        Switch to Piano Roll
                    </button>
                )}
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-end mb-1">
                <span ref={timeLabelRef} className="theme-secondary-text text-xs tabular-nums">
                    0:00 / {formatTime(durationMs)}
                </span>
            </div>
            <div
                ref={containerRef}
                className="relative w-full overflow-hidden rounded-lg theme-secondary-bg"
                style={{ height }}
            >
                {Array.from({ length: stringCount }, (_, i) => stringCount - i).map((stringNum) => (
                    <div
                        key={stringNum}
                        className="absolute left-0 w-full flex items-center border-b border-white/10"
                        style={{ top: stringToTop(stringNum), height: LANE_HEIGHT }}
                    >
                        <span
                            className="theme-secondary-text text-xs shrink-0 text-center font-semibold z-10"
                            style={{ width: LANE_LABEL_WIDTH }}
                        >
                            {tuningNames?.[stringNum - 1] ?? stringNum}
                        </span>
                    </div>
                ))}

                <div
                    className="absolute top-0 bottom-0 w-px bg-yellow-400 z-10"
                    style={{ left: `${PLAYHEAD_FRACTION * 100}%` }}
                />

                <div ref={scrollLayerRef} className="absolute top-0 left-0" style={{ willChange: 'transform' }}>
                    {frettedNotes.map((note) => {
                        const { bg, glow } = judgementStyle(note.judgement);
                        return (
                            <div
                                key={note.id}
                                className="absolute flex items-center justify-center rounded-md text-white text-xs font-bold"
                                style={{
                                    left: note.startMs * PIXELS_PER_MS,
                                    top: stringToTop(note.string!) + 3,
                                    width: Math.max(note.durationMs * PIXELS_PER_MS, LANE_HEIGHT - 8),
                                    height: LANE_HEIGHT - 8,
                                    backgroundColor: bg,
                                    opacity: note.judgement === 'missed' ? 0.45 : 0.95,
                                    boxShadow: glow ? `0 0 8px 2px ${bg}` : undefined,
                                }}
                            >
                                {note.fret}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default NoteHighway;
