'use client';

import { midiToFrequency } from '@/app/utils/notes';

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

function scheduleNote(ctx: AudioContext, midiNote: number, startTime: number, duration: number) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = midiToFrequency(midiNote);

    // Quick attack/decay envelope so notes don't click or overlap harshly.
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.05);
}

export function playNotesInSequence(midiNotes: number[], noteDuration = 0.55, gap = 0.08): void {
    const ctx = getAudioContext();
    if (!ctx) return;
    let time = ctx.currentTime + 0.05;
    midiNotes.forEach((note) => {
        scheduleNote(ctx, note, time, noteDuration);
        time += noteDuration + gap;
    });
}

export function playNotesTogether(midiNotes: number[], duration = 1.4): void {
    const ctx = getAudioContext();
    if (!ctx) return;
    const time = ctx.currentTime + 0.05;
    midiNotes.forEach((note) => scheduleNote(ctx, note, time, duration));
}
