'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { AlphaTabApi, model } from '@coderline/alphatab';
import type { NotationSource } from '@/app/utils/scoreTypes';
import type { GradedNote, NoteJudgement } from '@/app/utils/scoreFollow';
import { buildMsToTickConverter, buildTickToMsConverter } from '@/app/utils/tempoMap';

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
    // Shows/hides the tablature staff below the standard notation staff.
    // Forced off by the caller for MIDI-derived scores, which carry no
    // fret/string data to draw a tab staff from.
    showTab?: boolean;
    // Current loop bounds, drawn as a highlighted band behind the staff so the
    // user can see what's selected. Both 0 (or omitted) means no highlight.
    loopStartMs?: number;
    loopEndMs?: number;
    // Fired once the user finishes picking a loop range directly on the
    // staff/tab: either by dragging across notes, or by clicking once to mark
    // the start and clicking again to mark the end.
    onLoopRangeSelect?: (startMs: number, endMs: number) => void;
    // Overlays a label above every notehead: 'off' (default), 'names' (C,
    // D♯, ...) or 'solfege' (fixed-do Do/Re/Mi/...).
    noteLabelMode?: NoteLabelMode;
}

export type NoteLabelMode = 'off' | 'names' | 'solfege';

const PITCH_CLASS_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const PITCH_CLASS_SOLFEGE = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Ti'];

function noteLabelFor(realValue: number, mode: NoteLabelMode): string {
    const pitchClass = ((realValue % 12) + 12) % 12;
    return mode === 'solfege' ? PITCH_CLASS_SOLFEGE[pitchClass] : PITCH_CLASS_NAMES[pitchClass];
}

const MAX_HEIGHT = 420;
// In full view the notation overlay covers almost the entire viewport so long
// pieces can show several of alphaTab's own paginated systems at once instead
// of being cropped to the small inline preview height.
const FULL_VIEW_MAX_HEIGHT = '85vh';
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
    showTab = true,
    loopStartMs = 0,
    loopEndMs = 0,
    onLoopRangeSelect,
    noteLabelMode = 'off',
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const renderHostRef = useRef<HTMLDivElement | null>(null);
    const cursorRef = useRef<HTMLDivElement | null>(null);
    const loopBandRef = useRef<HTMLDivElement | null>(null);
    const labelLayerRef = useRef<HTMLDivElement | null>(null);
    const statusRef = useRef<HTMLParagraphElement | null>(null);
    const apiRef = useRef<AlphaTabApi | null>(null);
    const readyRef = useRef(false);
    const lastScrollTargetRef = useRef<number | null>(null);
    // Holds the ms position of a first click, while waiting for a second
    // click to complete a click-click loop range selection. Cleared once a
    // drag happens or a range is completed.
    const pendingStartMsRef = useRef<number | null>(null);
    const dragRef = useRef<{ downX: number; downY: number; startMs: number } | null>(null);
    // Full view is portaled to document.body so its z-50 overlay escapes the
    // page's "max-w-7xl relative z-10" stacking context (which would otherwise
    // trap it below the app header's sticky z-40 bar). The portal target is
    // swapped between this in-flow slot and document.body when full view
    // toggles - this remounts the render host (it's a fresh DOM node either
    // way), so the score-loading effect below re-runs against it too. The slot
    // is tracked via state (set from a callback ref) rather than a plain ref,
    // since its value is read during render to pick the portal's container.
    const [portalSlot, setPortalSlot] = useState<HTMLDivElement | null>(null);
    // The dynamically-imported alphaTab module, kept around so the
    // clef/theme effects can reach alphaTab.model.Clef/Color without
    // re-importing on every change.
    const alphaTabModuleRef = useRef<typeof import('@coderline/alphatab') | null>(null);
    const originalClefByBarRef = useRef<Map<model.Bar, model.Clef>>(new Map());
    const [ready, setReady] = useState(false);
    const [theme, setTheme] = useState<AppThemeName>(() => detectAppTheme());
    // Full view expands the notation into a fixed full-viewport overlay so
    // alphaTab's own paginated systems (LayoutMode.Page, the default) are
    // visible several at a time instead of being cropped to the small inline
    // preview height.
    const [fullView, setFullView] = useState(false);

    useEffect(() => {
        if (!fullView) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setFullView(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [fullView]);

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

    // drawNoteLabels is re-created whenever trackIndex/notation/theme change,
    // but it must also run from the postRenderFinished listener registered
    // once at construction time (api.render() calls from the clef/transpose/
    // showTab/theme effects all re-fire postRenderFinished) - so the listener
    // always calls through this ref to reach the latest version.
    const drawNoteLabelsRef = useRef<() => void>(() => {});

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
    const ticksToMs = useMemo(
        () => buildTickToMsConverter(notation.tempoTicks, notation.tempoBpm),
        [notation]
    );

    // Resolves a click/drag position (in client coordinates) to the song-ms
    // position of whichever beat sits under it, via alphaTab's own hit-test.
    // Returns null if the position doesn't land on a beat (e.g. in margins).
    const msAtClientPos = useCallback(
        (clientX: number, clientY: number): number | null => {
            const api = apiRef.current;
            const host = renderHostRef.current;
            if (!api || !host || !readyRef.current || !api.boundsLookup) return null;
            const rect = host.getBoundingClientRect();
            const beat = api.boundsLookup.getBeatAtPos(clientX - rect.left, clientY - rect.top);
            if (!beat) return null;
            return ticksToMs(beat.absolutePlaybackStart);
        },
        [ticksToMs]
    );

    const updateLoopBand = useCallback((startMs: number, endMs: number) => {
        const api = apiRef.current;
        const band = loopBandRef.current;
        if (!api || !band || !readyRef.current || !api.tickCache || !api.boundsLookup) return;
        if (endMs < startMs) {
            band.style.visibility = 'hidden';
            return;
        }
        const startBeat = api.tickCache.findBeat(new Set([trackIndex]), Math.max(0, Math.round(msToTick(startMs))))?.beat;
        const endBeat = api.tickCache.findBeat(new Set([trackIndex]), Math.max(0, Math.round(msToTick(endMs))))?.beat;
        const startBounds = startBeat ? api.boundsLookup.findBeat(startBeat) : null;
        const endBounds = endBeat ? api.boundsLookup.findBeat(endBeat) : null;
        if (!startBounds || !endBounds) {
            band.style.visibility = 'hidden';
            return;
        }
        const system = startBounds.barBounds.masterBarBounds.staffSystemBounds;
        const top = system ? system.visualBounds.y : startBounds.barBounds.visualBounds.y;
        const height = system ? system.visualBounds.h : startBounds.barBounds.visualBounds.h;
        const left = startBounds.onNotesX;
        const right = endBounds.onNotesX;
        band.style.transform = `translate(${left}px, ${top}px)`;
        band.style.width = `${Math.max(right - left, 2)}px`;
        band.style.height = `${height}px`;
        band.style.visibility = 'visible';
    }, [msToTick, trackIndex]);

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

    // Renders one small absolutely-positioned label above each notehead with
    // its note name or fixed-do solfège syllable, reusing the same
    // boundsLookup-based positioning as the cursor/loop-band overlays.
    const drawNoteLabels = useCallback(() => {
        const api = apiRef.current;
        const layer = labelLayerRef.current;
        if (!layer) return;
        layer.replaceChildren();
        if (noteLabelMode === 'off' || !api || !readyRef.current || !api.boundsLookup) return;

        const track = notation.score.tracks[trackIndex];
        if (!track) return;
        const labelColor = NOTATION_THEME_COLORS[detectAppTheme()].mainGlyphColor;
        const fragment = document.createDocumentFragment();

        for (const staff of track.staves) {
            for (const bar of staff.bars) {
                for (const voice of bar.voices) {
                    for (const beat of voice.beats) {
                        const beatBounds = api.boundsLookup.findBeat(beat);
                        if (!beatBounds || !beatBounds.notes) continue;
                        for (const noteBounds of beatBounds.notes) {
                            const rect = noteBounds.noteHeadBounds;
                            const label = document.createElement('span');
                            label.textContent = noteLabelFor(noteBounds.note.realValue, noteLabelMode);
                            label.style.position = 'absolute';
                            label.style.left = `${rect.x + rect.w / 2}px`;
                            label.style.top = `${rect.y - 14}px`;
                            label.style.transform = 'translateX(-50%)';
                            label.style.fontSize = '10px';
                            label.style.lineHeight = '1';
                            label.style.fontWeight = '600';
                            label.style.color = labelColor;
                            label.style.whiteSpace = 'nowrap';
                            fragment.appendChild(label);
                        }
                    }
                }
            }
        }
        layer.appendChild(fragment);
    }, [noteLabelMode, notation, trackIndex]);

    useEffect(() => {
        drawNoteLabelsRef.current = drawNoteLabels;
        drawNoteLabels();
    }, [drawNoteLabels]);

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
                // includeNoteBounds populates BeatBounds.notes (per-notehead
                // bounds), needed for the note-name/solfège label overlay.
                core: { fontDirectory: '/alphatab-font/', useWorkers: false, includeNoteBounds: true },
                display: {
                    staveProfile: showTab ? 'ScoreTab' : 'Score',
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
                drawNoteLabelsRef.current();
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
        // instead of tearing down and reloading the whole score. portalSlot is
        // included because the render host only exists in the DOM once the portal
        // slot has mounted, one tick after this component's own first commit - the
        // effect needs to retry once that happens instead of silently no-oping
        // forever against a null host. fullView is included because toggling it
        // swaps the portal's container (slot div <-> document.body), which remounts
        // the render host as a fresh DOM node rather than moving the existing one -
        // the api has to be recreated against that new node.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notation, trackIndex, updateCursor, portalSlot, fullView]);

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

    // Re-applies the tab staff visibility on the already-loaded score when
    // the user toggles it, without reloading/reparsing the whole score.
    useEffect(() => {
        const api = apiRef.current;
        const alphaTab = alphaTabModuleRef.current;
        if (!ready || !api || !alphaTab) return;
        api.settings.display.staveProfile = showTab ? alphaTab.StaveProfile.ScoreTab : alphaTab.StaveProfile.Score;
        api.updateSettings();
        api.render();
    }, [ready, showTab]);

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

    // Keeps the highlighted loop-range band in sync with the caller's
    // loopStartMs/loopEndMs (which may also change from the seconds inputs,
    // not just from clicking the staff).
    useEffect(() => {
        updateLoopBand(loopStartMs, loopEndMs);
    }, [ready, loopStartMs, loopEndMs, updateLoopBand]);

    // Click-to-select a loop range directly on the staff/tab: a drag spanning
    // more than a few pixels selects [down-position, up-position] directly;
    // a plain click instead marks a pending start point, and a second plain
    // click on a later beat completes the range. Either way the result is
    // reported via onLoopRangeSelect for the caller to store/enable.
    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (!onLoopRangeSelect) return;
            const ms = msAtClientPos(e.clientX, e.clientY);
            if (ms === null) return;
            dragRef.current = { downX: e.clientX, downY: e.clientY, startMs: ms };
        },
        [onLoopRangeSelect, msAtClientPos]
    );

    const handlePointerUp = useCallback(
        (e: React.PointerEvent) => {
            if (!onLoopRangeSelect) return;
            const drag = dragRef.current;
            dragRef.current = null;
            if (!drag) return;

            const dx = e.clientX - drag.downX;
            const dy = e.clientY - drag.downY;
            const dragged = Math.hypot(dx, dy) > 6;

            if (dragged) {
                const upMs = msAtClientPos(e.clientX, e.clientY) ?? drag.startMs;
                pendingStartMsRef.current = null;
                const startMs = Math.min(drag.startMs, upMs);
                const endMs = Math.max(drag.startMs, upMs);
                if (endMs > startMs) onLoopRangeSelect(startMs, endMs);
                return;
            }

            // Plain click: first click marks the pending start, second
            // (later) click completes the range.
            const clickMs = drag.startMs;
            const pendingMs = pendingStartMsRef.current;
            if (pendingMs === null) {
                pendingStartMsRef.current = clickMs;
                updateLoopBand(clickMs, clickMs);
                return;
            }
            pendingStartMsRef.current = null;
            const startMs = Math.min(pendingMs, clickMs);
            const endMs = Math.max(pendingMs, clickMs);
            if (endMs > startMs) onLoopRangeSelect(startMs, endMs);
        },
        [onLoopRangeSelect, msAtClientPos, updateLoopBand]
    );

    const content = (
        <div
            className={
                fullView
                    ? 'fixed inset-0 z-50 theme-secondary-bg p-2 flex flex-col'
                    : 'rounded-lg theme-secondary-bg p-2'
            }
        >
            <div className="flex items-center justify-between px-2">
                <p ref={statusRef} className="text-sm theme-secondary-text pb-2 min-h-[1.25rem]" />
                <button
                    onClick={() => setFullView((cur) => !cur)}
                    className="px-3 py-1 rounded-lg text-sm theme-muted-bg theme-secondary-text hover:opacity-90 shrink-0"
                >
                    {fullView ? '✕ Exit Full View' : '⤢ Full View'}
                </button>
            </div>
            {onLoopRangeSelect && (
                <p className="text-xs theme-secondary-text px-2 pb-1">
                    Click a note to mark the loop start, then click another to set the end — or drag across a range.
                </p>
            )}
            <div
                ref={containerRef}
                className={`relative w-full overflow-y-auto rounded-lg ${fullView ? 'flex-1' : ''}`}
                style={{
                    maxHeight: fullView ? FULL_VIEW_MAX_HEIGHT : MAX_HEIGHT,
                    backgroundColor: NOTATION_THEME_COLORS[theme].background,
                }}
            >
                <div
                    ref={renderHostRef}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    style={{ cursor: onLoopRangeSelect ? 'crosshair' : undefined }}
                />
                <div
                    ref={loopBandRef}
                    className="absolute top-0 left-0 pointer-events-none"
                    style={{ visibility: 'hidden', willChange: 'transform', backgroundColor: 'rgba(99, 102, 241, 0.3)' }}
                />
                <div ref={labelLayerRef} className="absolute top-0 left-0 pointer-events-none" />
                <div
                    ref={cursorRef}
                    className="absolute top-0 left-0 w-[2px] pointer-events-none"
                    style={{ visibility: 'hidden', willChange: 'transform', backgroundColor: DEFAULT_CURSOR_COLOR }}
                />
            </div>
        </div>
    );

    const portalContainer = fullView ? (typeof document !== 'undefined' ? document.body : null) : portalSlot;

    return (
        <>
            <div ref={setPortalSlot} />
            {portalContainer && createPortal(content, portalContainer)}
        </>
    );
};

export default ScoreNotation;
