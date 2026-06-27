'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getSharedAudioContext } from '@/app/utils/audioSynth';
import { autoCorrelate } from '@/app/utils/pitchDetect';
import { frequencyToMidi } from '@/app/utils/notes';

export type AudioPermission = 'idle' | 'pending' | 'granted' | 'denied' | 'unsupported';

export interface AudioOnsetEvent {
    /** DOMHighResTimeStamp, same clock as performance.now(). */
    timestamp: number;
}

export type AudioOnsetListener = (event: AudioOnsetEvent) => void;

export interface AudioInputController {
    permission: AudioPermission;
    activeNotes: Set<number>;
    error: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    /**
     * Low-latency onset subscription (fired synchronously from the analysis
     * loop), for tap/rhythm input — mirrors MidiInputController's
     * subscribeNoteOn.
     */
    subscribeOnset: (listener: AudioOnsetListener) => () => void;
}

// How far above the adaptive noise floor the RMS energy must rise to count as
// a new onset, and how long to ignore further onsets right after one fires —
// without the refractory window, a single tap's decay tail can re-cross the
// threshold and register as a second tap.
const ONSET_RMS_RISE = 0.03;
const ONSET_REFRACTORY_MS = 100;
// Below this RMS, treat the signal as silence: stop reporting a held pitch
// and let the noise floor drift to track ambient room noise.
const SILENCE_RMS = 0.015;
const NOISE_FLOOR_SMOOTHING = 0.05;
const FFT_SIZE = 2048;

export function useAudioInput(): AudioInputController {
    const [permission, setPermission] = useState<AudioPermission>('idle');
    const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
    const [error, setError] = useState<string | null>(null);

    const streamRef = useRef<MediaStream | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const bufferRef = useRef<Float32Array<ArrayBuffer> | null>(null);

    const noiseFloorRef = useRef(SILENCE_RMS);
    const wasAboveThresholdRef = useRef(false);
    const lastOnsetTimeRef = useRef(-Infinity);
    const currentNoteRef = useRef<number | null>(null);
    const onsetListenersRef = useRef<Set<AudioOnsetListener>>(new Set());

    const subscribeOnset = useCallback((listener: AudioOnsetListener) => {
        onsetListenersRef.current.add(listener);
        return () => {
            onsetListenersRef.current.delete(listener);
        };
    }, []);

    const stopAnalysis = useCallback(() => {
        sourceRef.current?.disconnect();
        sourceRef.current = null;
        analyserRef.current = null;
        bufferRef.current = null;
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
    }, []);

    // Drives onset/pitch analysis while connected. Declared inside the effect
    // (rather than as a useCallback that re-schedules itself) so the recursive
    // requestAnimationFrame call always refers to this run's own closure,
    // matching the rAF loop pattern used in RhythmTapAlong.tsx.
    useEffect(() => {
        if (permission !== 'granted') return;
        let rafId = 0;

        const tick = () => {
            const analyser = analyserRef.current;
            const buffer = bufferRef.current;
            if (!analyser || !buffer) return;
            analyser.getFloatTimeDomainData(buffer);

            let sumSquares = 0;
            for (let i = 0; i < buffer.length; i++) sumSquares += buffer[i] * buffer[i];
            const energy = Math.sqrt(sumSquares / buffer.length);

            const isAboveThreshold = energy > noiseFloorRef.current + ONSET_RMS_RISE;
            const now = performance.now();
            if (isAboveThreshold && !wasAboveThresholdRef.current && now - lastOnsetTimeRef.current > ONSET_REFRACTORY_MS) {
                lastOnsetTimeRef.current = now;
                onsetListenersRef.current.forEach((listener) => listener({ timestamp: now }));
            }
            wasAboveThresholdRef.current = isAboveThreshold;
            if (!isAboveThreshold) {
                noiseFloorRef.current += (energy - noiseFloorRef.current) * NOISE_FLOOR_SMOOTHING;
            }

            if (energy < SILENCE_RMS) {
                if (currentNoteRef.current !== null) {
                    currentNoteRef.current = null;
                    setActiveNotes(new Set());
                }
            } else {
                const ctx = analyser.context;
                const freq = autoCorrelate(buffer, ctx.sampleRate);
                if (freq !== -1) {
                    const note = frequencyToMidi(freq);
                    if (note !== currentNoteRef.current) {
                        currentNoteRef.current = note;
                        setActiveNotes(new Set([note]));
                    }
                }
            }

            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [permission]);

    const connect = useCallback(async () => {
        if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
            setPermission('unsupported');
            return;
        }
        setPermission('pending');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
            });
            const ctx = getSharedAudioContext();
            if (!ctx) throw new Error('Audio is not available in this browser.');

            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = FFT_SIZE;
            // Analysis-only: deliberately not connected to ctx.destination, so
            // the mic signal is never routed back out through the speakers.
            source.connect(analyser);

            streamRef.current = stream;
            sourceRef.current = source;
            analyserRef.current = analyser;
            bufferRef.current = new Float32Array(analyser.fftSize);
            noiseFloorRef.current = SILENCE_RMS;
            wasAboveThresholdRef.current = false;
            lastOnsetTimeRef.current = -Infinity;
            currentNoteRef.current = null;
            setActiveNotes(new Set());

            setPermission('granted');
            setError(null);
        } catch (err) {
            setPermission('denied');
            setError(err instanceof Error ? err.message : 'Microphone access was denied.');
        }
    }, []);

    const disconnect = useCallback(() => {
        stopAnalysis();
        setActiveNotes(new Set());
        setPermission('idle');
    }, [stopAnalysis]);

    useEffect(() => stopAnalysis, [stopAnalysis]);

    return {
        permission,
        activeNotes,
        error,
        connect,
        disconnect,
        subscribeOnset,
    };
}
