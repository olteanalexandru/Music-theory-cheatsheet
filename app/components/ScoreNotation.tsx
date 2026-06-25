'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import type { AlphaTabApi } from '@coderline/alphatab';
import type { NotationSource } from '@/app/utils/scoreTypes';
import type { GradedNote, NoteJudgement } from '@/app/utils/scoreFollow';
import { buildMsToTickConverter } from '@/app/utils/tempoMap';

interface ScoreNotationProps {
    notation: NotationSource;
    trackIndex: number;
    getSongMs: () => number;
    running: boolean;
    // Live grading state for this track, used to tint the cursor with the
    // same hit/wrong/missed feedback colors as the piano-roll/note-highway
    // views. Optional since the cursor still works (in its default amber)
    // before grading starts or when the caller doesn't pass it.
    gradedNotes?: GradedNote[];
}

const MAX_HEIGHT = 420;
const DEFAULT_CURSOR_COLOR = '#f59e0b';
const JUDGEMENT_CURSOR_COLORS: Record<NoteJudgement, string> = {
    pending: DEFAULT_CURSOR_COLOR,
    hit: '#22c55e',
    wrong: '#ef4444',
    missed: '#64748b',
};

// gradedNotes is sorted ascending by startMs (guaranteed by the parser), so
// the note most recently reached by the playhead is the last one whose
// startMs hasn't passed nowMs yet - that's what the cursor should reflect.
function cursorColorAt(notes: GradedNote[] | undefined, nowMs: number): string {
    if (!notes || notes.length === 0) return DEFAULT_CURSOR_COLOR;
    let latest: GradedNote | null = null;
    for (const note of notes) {
        if (note.startMs > nowMs) break;
        latest = note;
    }
    return JUDGEMENT_CURSOR_COLORS[latest?.judgement ?? 'pending'];
}

// Renders real engraved staff + tab notation for a Guitar Pro score using
// alphaTab, with playerMode left Disabled so no soundfont/audio-worker
// infrastructure is ever spun up - this component only needs alphaTab's
// layout/rendering engine, never its synthesizer. The moving playhead is a
// hand-rolled cursor overlay positioned every animation frame from the
// app's own clock (getSongMs, the same one driving the piano-roll view),
// converted to a midi tick and looked up via api.tickCache/api.boundsLookup,
// both of which populate on render regardless of playerMode (confirmed by
// reading alphaTab's compiled source: _internalRenderTracks() always calls
// loadMidiForScore() and render() unconditionally).
const ScoreNotation: React.FC<ScoreNotationProps> = ({ notation, trackIndex, getSongMs, running, gradedNotes }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const renderHostRef = useRef<HTMLDivElement | null>(null);
    const cursorRef = useRef<HTMLDivElement | null>(null);
    const statusRef = useRef<HTMLParagraphElement | null>(null);
    const apiRef = useRef<AlphaTabApi | null>(null);
    const readyRef = useRef(false);
    const lastScrollTargetRef = useRef<number | null>(null);

    // getSongMs's identity changes whenever runState/speed change in the
    // parent, which must NOT tear down and re-render the notation - only the
    // per-frame cursor update needs the latest value, via a ref.
    const getSongMsRef = useRef(getSongMs);
    useEffect(() => {
        getSongMsRef.current = getSongMs;
    }, [getSongMs]);

    // Same ref pattern: gradedNotes' identity changes on every judgement
    // flip, which must not tear down/re-render the notation - only the
    // per-frame cursor color read needs the latest value.
    const gradedNotesRef = useRef(gradedNotes);
    useEffect(() => {
        gradedNotesRef.current = gradedNotes;
    }, [gradedNotes]);

    const msToTick = useMemo(
        () => buildMsToTickConverter(notation.tempoTicks, notation.tempoBpm),
        [notation]
    );

    const updateCursor = useCallback(() => {
        const api = apiRef.current;
        const cursor = cursorRef.current;
        if (!api || !cursor || !readyRef.current || !api.tickCache || !api.boundsLookup) return;

        const nowMs = getSongMsRef.current();
        const tick = Math.max(0, Math.round(msToTick(nowMs)));
        const result = api.tickCache.findBeat(new Set([trackIndex]), tick);
        const beat = result?.beat;
        if (!beat) return;
        const beatBounds = api.boundsLookup.findBeat(beat);
        if (!beatBounds) return;

        const system = beatBounds.barBounds.masterBarBounds.staffSystemBounds;
        const top = system ? system.visualBounds.y : beatBounds.barBounds.visualBounds.y;
        const height = system ? system.visualBounds.h : beatBounds.barBounds.visualBounds.h;

        cursor.style.transform = `translate(${beatBounds.onNotesX}px, ${top}px)`;
        cursor.style.height = `${height}px`;
        cursor.style.backgroundColor = cursorColorAt(gradedNotesRef.current, nowMs);
        cursor.style.visibility = 'visible';

        const container = containerRef.current;
        if (container && lastScrollTargetRef.current !== top) {
            lastScrollTargetRef.current = top;
            container.scrollTo({ top: Math.max(0, top - container.clientHeight * 0.3), behavior: 'smooth' });
        }
    }, [trackIndex, msToTick]);

    useEffect(() => {
        const host = renderHostRef.current;
        if (!host) return;
        let destroyed = false;
        readyRef.current = false;
        lastScrollTargetRef.current = null;
        if (cursorRef.current) cursorRef.current.style.visibility = 'hidden';
        if (statusRef.current) statusRef.current.textContent = 'Rendering notation…';

        import('@coderline/alphatab').then((alphaTab) => {
            if (destroyed) return;
            const api = new alphaTab.AlphaTabApi(host, {
                // useWorkers defaults to true, which makes alphaTab auto-detect its own
                // script URL to bootstrap a layout Web Worker - this detection doesn't
                // resolve to a usable module under Next.js/Turbopack's code-split bundle,
                // so the worker silently never starts and render() hangs forever with no
                // error and no postRenderFinished. Force synchronous main-thread layout instead.
                core: { fontDirectory: '/alphatab-font/', useWorkers: false },
                display: { staveProfile: 'ScoreTab' },
                player: { playerMode: 'Disabled' },
            });
            apiRef.current = api;

            api.error.on((err: unknown) => {
                if (destroyed || !statusRef.current) return;
                statusRef.current.textContent = `Could not render notation: ${err instanceof Error ? err.message : 'unknown error'}`;
            });
            api.postRenderFinished.on(() => {
                if (destroyed) return;
                readyRef.current = true;
                if (statusRef.current) statusRef.current.textContent = '';
                updateCursor();
            });

            api.renderScore(notation.score, [trackIndex]);
        });

        return () => {
            destroyed = true;
            readyRef.current = false;
            apiRef.current?.destroy();
            apiRef.current = null;
        };
    }, [notation, trackIndex, updateCursor]);

    useEffect(() => {
        if (!running) return;
        let rafId = 0;
        const tick = () => {
            updateCursor();
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [running, updateCursor]);

    return (
        <div className="rounded-lg theme-secondary-bg p-2">
            <p ref={statusRef} className="text-sm theme-secondary-text px-2 pb-2 min-h-[1.25rem]" />
            <div
                ref={containerRef}
                className="relative w-full overflow-y-auto rounded-lg"
                style={{ maxHeight: MAX_HEIGHT, backgroundColor: '#ffffff' }}
            >
                <div ref={renderHostRef} />
                <div
                    ref={cursorRef}
                    className="absolute top-0 left-0 w-[2px] pointer-events-none"
                    style={{ visibility: 'hidden', willChange: 'transform', backgroundColor: DEFAULT_CURSOR_COLOR }}
                />
            </div>
        </div>
    );
};

export default ScoreNotation;
