'use client';

import { midiToFrequency } from '@/app/utils/notes';

export type Waveform = 'sine' | 'triangle' | 'sawtooth' | 'square';

export interface SynthSettings {
    waveform: Waveform;
    volume: number;
}

export const DEFAULT_SYNTH_SETTINGS: SynthSettings = { waveform: 'sine', volume: 0.25 };

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!audioContext) {
        audioContext = new AudioContext();
    }
    if (audioContext.state === 'suspended') {
        void audioContext.resume();
    }
    return audioContext;
}

function scheduleNote(
    ctx: AudioContext,
    midiNote: number,
    startTime: number,
    duration: number,
    settings: SynthSettings
) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = settings.waveform;
    oscillator.frequency.value = midiToFrequency(midiNote);

    // Quick attack/decay envelope so notes don't click or overlap harshly.
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(settings.volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.05);
}

export function playNotesInSequence(
    midiNotes: number[],
    settings: SynthSettings = DEFAULT_SYNTH_SETTINGS,
    noteDuration = 0.55,
    gap = 0.08
): void {
    const ctx = getAudioContext();
    if (!ctx) return;
    let time = ctx.currentTime + 0.05;
    midiNotes.forEach((note) => {
        scheduleNote(ctx, note, time, noteDuration, settings);
        time += noteDuration + gap;
    });
}

export function playNotesTogether(
    midiNotes: number[],
    settings: SynthSettings = DEFAULT_SYNTH_SETTINGS,
    duration = 1.4
): void {
    const ctx = getAudioContext();
    if (!ctx) return;
    const time = ctx.currentTime + 0.05;
    midiNotes.forEach((note) => scheduleNote(ctx, note, time, duration, settings));
}

export interface TimedEvent {
    midi: number | null; // null marks a rest — the time cursor still advances, nothing sounds
    beats: number;
}

// Schedules a sequence of variable-duration events (rhythm dictation, metronome
// clicks) at the given tempo, unlike playNotesInSequence's fixed per-note duration.
export function playTimedSequence(
    events: TimedEvent[],
    bpm: number,
    settings: SynthSettings = DEFAULT_SYNTH_SETTINGS
): void {
    const ctx = getAudioContext();
    if (!ctx) return;
    const secondsPerBeat = 60 / bpm;
    let time = ctx.currentTime + 0.05;
    events.forEach(({ midi, beats }) => {
        const duration = beats * secondsPerBeat;
        if (midi !== null) {
            scheduleNote(ctx, midi, time, Math.min(duration * 0.6, 0.3), settings);
        }
        time += duration;
    });
}

// Schedules a sequence of chords back-to-back, each chord's notes sounding
// together — for chord-progression ear training, unlike playNotesInSequence
// (one note at a time) or playNotesTogether (a single chord).
export function playChordProgression(
    chords: number[][],
    settings: SynthSettings = DEFAULT_SYNTH_SETTINGS,
    chordDuration = 0.9,
    gap = 0.1
): void {
    const ctx = getAudioContext();
    if (!ctx) return;
    let time = ctx.currentTime + 0.05;
    chords.forEach((chord) => {
        chord.forEach((note) => scheduleNote(ctx, note, time, chordDuration, settings));
        time += chordDuration + gap;
    });
}

interface LiveVoice {
    oscillator: OscillatorNode;
    gain: GainNode;
}

// Sustained voices for press-and-hold input (real MIDI hardware, on-screen piano
// clicks) — distinct from the fire-and-forget scheduled notes above, which know
// their full duration up front and need no registry.
const liveVoices = new Map<number, LiveVoice>();
const LIVE_ATTACK = 0.012;
const LIVE_RELEASE = 0.12;

export function noteOn(midiNote: number, settings: SynthSettings = DEFAULT_SYNTH_SETTINGS): void {
    const ctx = getAudioContext();
    if (!ctx) return;
    noteOff(midiNote);

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = settings.waveform;
    oscillator.frequency.value = midiToFrequency(midiNote);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(settings.volume, now + LIVE_ATTACK);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(now);
    liveVoices.set(midiNote, { oscillator, gain });
}

export function noteOff(midiNote: number): void {
    const ctx = audioContext;
    const voice = liveVoices.get(midiNote);
    if (!ctx || !voice) return;
    liveVoices.delete(midiNote);

    const now = ctx.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(Math.max(voice.gain.gain.value, 0.0001), now);
    voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + LIVE_RELEASE);
    voice.oscillator.stop(now + LIVE_RELEASE + 0.02);
}

export function stopAllLiveNotes(): void {
    Array.from(liveVoices.keys()).forEach(noteOff);
}
