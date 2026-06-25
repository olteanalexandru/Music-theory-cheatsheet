'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AlphaTabApi, model } from '@coderline/alphatab';
import type { NotationSource } from '@/app/utils/scoreTypes';
import type { GradedNote, NoteJudgement } from '@/app/utils/scoreFollow';
import { buildMsToTickConverter } from '@/app/utils/tempoMap';

export type ClefOverride = 'auto' | 'treble' | 'bass';

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
    // Semitone shift applied to the engraved notation (mirrors the same
    // control used for the piano-roll/note-highway/live-grading views), so
    // changing key/transposing affects every view consistently.
    transposeSemitones?: number;
    // Overrides the displayed clef for every bar of this track (e.g. to view
    // a bass line written in bass/F clef as treble/G clef instead). 'auto'
    // restores whatever clef the file itself specifies.
    clef?: ClefOverride;
}

const MAX_HEIGHT = 420;
const DEFAULT_CURSOR_COLOR = '#f59e0b';
const JUDGEMENT_CURSOR_COLORS: Record<NoteJudgement, string> = {
    pending: DEFAULT_CURSOR_COLOR,
    hit: '#22c55e',
    wrong: '#ef4444',
    missed: '#64748b',
};

type AppThemeName = 'dark' | 'light' | 'psychedelic';

// Mirrors the --card-background/--card-foreground/--muted-fg values in
// globals.css for each theme, so the notation area's background and ink
// match the rest of the app's chrome instead of being hardcoded white.
const NOTATION_THEME_COLORS: Record<
    AppThemeName,
    {
        background: string;
        mainGlyphColor: string;
        secondaryGlyphColor: string;
        staffLineColor: string;
        barSeparatorColor: string;
        barNumberColor: string;
        scoreInfoColor: string;
    }
> = {
    dark: {
        background: '#1f2937',
        mainGlyphColor: '#e5e7eb',
        secondaryGlyphColor: '#9ca3af',
        staffLineColor: '#9ca3af',
        barSeparatorColor: '#9ca3af',
        barNumberColor: '#9ca3af',
        scoreInfoColor: '#e5e7eb',
    },
    light: {
        background: '#ffffff',
        mainGlyphColor: '#111827',
        secondaryGlyphColor: '#6b7280',
        staffLineColor: '#374151',
        barSeparatorColor: '#374151',
        barNumberColor: '#6b7280',
        scoreInfoColor: '#111827',
    },
    psychedelic: {
        background: 'rgba(45, 11, 67, 0.85)',
        mainGlyphColor: '#fef08a',
        secondaryGlyphColor: '#f5d0fe',
        staffLineColor: '#f5d0fe',
        barSeparatorColor: '#f5d0fe',
        barNumberColor: '#f5d0fe',
        scoreInfoColor: '#fef08a',
    },
};

function detectAppTheme(): AppThemeName {
    if (typeof document === 'undefined') return 'dark';
    const body = document.body;
    if (body.classList.contains('psychedelic-mode')) return 'psychedelic';
    if (body.classList.contains('light-mode')) return 'light';
    return 'dark';
}

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

// Applies (or clears) a clef override on every bar of the given track,
// remembering each bar's original clef on first touch so 'auto' can restore
// it later instead of just freezing whatever the last override was.
function applyClefOverride(
    track: model.Track,
    clef: ClefOverride,
    clefEnum: typeof model.Clef,
    originalClefByBar: Map<model.Bar, model.Clef>
): void {
    for (const staff of track.staves) {
        for (const bar of staff.bars) {
            if (!originalClefByBar.has(bar)) originalClefByBar.set(bar, bar.clef);
            if (clef === 'treble') bar.clef = clefEnum.G2;
            else if (clef === 'bass') bar.clef = clefEnum.F4;
            else bar.clef = originalClefByBar.get(bar) ?? bar.clef;
        }
    }
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
const ScoreNotation: React.FC<ScoreNotationProps> = ({
    notation,
    trackIndex,
    getSongMs,
    running,
    gradedNotes,
    transposeSemitones = 0,
    clef = 'auto',
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const renderHostRef = useRef<HTMLDivElement | null>(null);
    const cursorRef = useRef<HTMLDivElement | null>(null);
    const statusRef = useRef<HTMLParagraphElement | null>(null);
    const apiRef = useRef<AlphaTabApi | null>(null);
    const readyRef = useRef(false);
    const lastScrollTargetRef = useRef<number | null>(null);
    // The dynamically-imported alphaTab module, kept around so the
    // clef/theme effects can reach alphaTab.model.Clef/Color without
    // re-importing on every change.
    const alphaTabModuleRef = useRef<typeof import('@coderline/alphatab') | null>(null);
    const originalClefByBarRef = useRef<Map<model.Bar, model.Clef>>(new Map());
    const [ready, setReady] = useState(false);
    const [theme, setTheme] = useState<AppThemeName>(() => detectAppTheme());

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

    // Picks up theme changes (the Footer's theme selector toggles a body
    // class - see ThemeWrapper.tsx) without needing a React context plumbed
    // all the way down from the page.
    useEffect(() => {
        const observer = new MutationObserver(() => setTheme(detectAppTheme()));
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

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
        setReady(false);
        lastScrollTargetRef.current = null;
        originalClefByBarRef.current = new Map();
        if (cursorRef.current) cursorRef.current.style.visibility = 'hidden';
        if (statusRef.current) statusRef.current.textContent = 'Rendering notation…';

        import('@coderline/alphatab').then((alphaTab) => {
            if (destroyed) return;
            alphaTabModuleRef.current = alphaTab;

            const track = notation.score.tracks[trackIndex];
            if (track) {
                applyClefOverride(track, clef, alphaTab.model.Clef, originalClefByBarRef.current);
            }

            const themeColors = NOTATION_THEME_COLORS[detectAppTheme()];
            const transpositionPitches = new Array(notation.score.tracks.length).fill(0);
            transpositionPitches[trackIndex] = transposeSemitones;

            const api = new alphaTab.AlphaTabApi(host, {
                // useWorkers defaults to true, which makes alphaTab auto-detect its own
                // script URL to bootstrap a layout Web Worker - this detection doesn't
                // resolve to a usable module under Next.js/Turbopack's code-split bundle,
                // so the worker silently never starts and render() hangs forever with no
                // error and no postRenderFinished. Force synchronous main-thread layout instead.
                core: { fontDirectory: '/alphatab-font/', useWorkers: false },
                display: {
                    staveProfile: 'ScoreTab',
                    resources: {
                        staffLineColor: themeColors.staffLineColor,
                        barSeparatorColor: themeColors.barSeparatorColor,
                        barNumberColor: themeColors.barNumberColor,
                        mainGlyphColor: themeColors.mainGlyphColor,
                        secondaryGlyphColor: themeColors.secondaryGlyphColor,
                        scoreInfoColor: themeColors.scoreInfoColor,
                    },
                },
                notation: { transpositionPitches },
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
                setReady(true);
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
        // clef/transposeSemitones/theme are intentionally excluded here - their
        // own effects below mutate the already-rendered api/score in place
        // instead of tearing down and reloading the whole score.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notation, trackIndex, updateCursor]);

    // Re-applies the clef override on the already-loaded score when the user
    // toggles it, without reloading/reparsing the whole score.
    useEffect(() => {
        const api = apiRef.current;
        const alphaTab = alphaTabModuleRef.current;
        if (!ready || !api || !alphaTab) return;
        const track = notation.score.tracks[trackIndex];
        if (!track) return;
        applyClefOverride(track, clef, alphaTab.model.Clef, originalClefByBarRef.current);
        api.render();
    }, [ready, clef, notation, trackIndex]);

    // Re-applies the transpose amount on the already-loaded score, the same
    // way the piano-roll/note-highway/live-grading views already do, so the
    // engraved notation's pitches (and key signature) match what's playing.
    useEffect(() => {
        const api = apiRef.current;
        if (!ready || !api) return;
        const pitches = new Array(notation.score.tracks.length).fill(0);
        pitches[trackIndex] = transposeSemitones;
        api.settings.notation.transpositionPitches = pitches;
        api.updateSettings();
        api.render();
    }, [ready, transposeSemitones, notation, trackIndex]);

    // Re-colors the already-loaded score's ink (staff lines, noteheads,
    // glyphs, bar numbers) to match the active theme. The container's own
    // background is handled directly in the style below via the `theme`
    // state, so it updates immediately even before the api is ready.
    useEffect(() => {
        const api = apiRef.current;
        const alphaTab = alphaTabModuleRef.current;
        if (!ready || !api || !alphaTab) return;
        const colors = NOTATION_THEME_COLORS[theme];
        const resources = api.settings.display.resources;
        resources.staffLineColor = alphaTab.model.Color.fromJson(colors.staffLineColor) ?? resources.staffLineColor;
        resources.barSeparatorColor = alphaTab.model.Color.fromJson(colors.barSeparatorColor) ?? resources.barSeparatorColor;
        resources.barNumberColor = alphaTab.model.Color.fromJson(colors.barNumberColor) ?? resources.barNumberColor;
        resources.mainGlyphColor = alphaTab.model.Color.fromJson(colors.mainGlyphColor) ?? resources.mainGlyphColor;
        resources.secondaryGlyphColor = alphaTab.model.Color.fromJson(colors.secondaryGlyphColor) ?? resources.secondaryGlyphColor;
        resources.scoreInfoColor = alphaTab.model.Color.fromJson(colors.scoreInfoColor) ?? resources.scoreInfoColor;
        api.updateSettings();
        api.render();
    }, [ready, theme]);

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
                style={{ maxHeight: MAX_HEIGHT, backgroundColor: NOTATION_THEME_COLORS[theme].background }}
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
