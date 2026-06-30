'use client';

import { useCallback, useRef, useState } from 'react';

export interface MidiDeviceInfo {
    id: string;
    name: string;
}

export type MidiPermission = 'idle' | 'pending' | 'granted' | 'denied' | 'unsupported';

export interface MidiNoteOnEvent {
    pitch: number;
    velocity: number;
    /** DOMHighResTimeStamp, same clock as performance.now(). */
    timestamp: number;
}

export type MidiNoteOnListener = (event: MidiNoteOnEvent) => void;

export interface MidiInputController {
    permission: MidiPermission;
    devices: MidiDeviceInfo[];
    selectedDeviceId: string | null;
    selectDevice: (deviceId: string | null) => void;
    activeNotes: Set<number>;
    error: string | null;
    connect: () => Promise<void>;
    /**
     * Low-latency note-on subscription, fired synchronously from the raw
     * MIDIMessageEvent handler (not via React state/render diffing, which is
     * too jittery for timing-sensitive grading like rhythm-tap accuracy).
     */
    subscribeNoteOn: (listener: MidiNoteOnListener) => () => void;
}

export function useMidiInput(): MidiInputController {
    const [permission, setPermission] = useState<MidiPermission>('idle');
    const [devices, setDevices] = useState<MidiDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceIdState] = useState<string | null>(null);
    const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const midiAccessRef = useRef<MIDIAccess | null>(null);
    const selectedDeviceIdRef = useRef<string | null>(null);
    // MPE controllers spread notes across member channels (2-15), and can hold
    // the same pitch on more than one channel at once (e.g. a glide/bend
    // crossing onto a new channel while the original is still ringing). Track
    // which channels currently hold each pitch so a note-off on one channel
    // doesn't clear a pitch that's still sounding on another.
    const heldChannelsRef = useRef<Map<number, Set<number>>>(new Map());
    const noteOnListenersRef = useRef<Set<MidiNoteOnListener>>(new Set());

    const subscribeNoteOn = useCallback((listener: MidiNoteOnListener) => {
        noteOnListenersRef.current.add(listener);
        return () => {
            noteOnListenersRef.current.delete(listener);
        };
    }, []);

    const handleMessage = useCallback((event: MIDIMessageEvent) => {
        const data = event.data;
        if (!data || data.length < 3) return;
        const [status, note, velocity] = data;
        const command = status & 0xf0;
        const channel = status & 0x0f;

        if (command === 0x90 && velocity > 0) {
            noteOnListenersRef.current.forEach((listener) => listener({ pitch: note, velocity, timestamp: event.timeStamp }));
            let channels = heldChannelsRef.current.get(note);
            if (!channels) {
                channels = new Set();
                heldChannelsRef.current.set(note, channels);
            }
            channels.add(channel);
            setActiveNotes((current) => {
                if (current.has(note)) return current;
                const next = new Set(current);
                next.add(note);
                return next;
            });
        } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
            const channels = heldChannelsRef.current.get(note);
            channels?.delete(channel);
            if (channels && channels.size > 0) return;
            heldChannelsRef.current.delete(note);
            setActiveNotes((current) => {
                if (!current.has(note)) return current;
                const next = new Set(current);
                next.delete(note);
                return next;
            });
        }
    }, []);

    const attachListeners = useCallback((access: MIDIAccess) => {
        const deviceId = selectedDeviceIdRef.current;
        access.inputs.forEach((input) => {
            input.onmidimessage = deviceId === null || input.id === deviceId ? handleMessage : null;
        });
    }, [handleMessage]);

    const refreshDevices = useCallback((access: MIDIAccess) => {
        const list: MidiDeviceInfo[] = [];
        access.inputs.forEach((input) => {
            list.push({ id: input.id, name: input.name || `MIDI Input ${input.id}` });
        });
        setDevices(list);
    }, []);

    const connect = useCallback(async () => {
        if (typeof navigator === 'undefined' || !('requestMIDIAccess' in navigator)) {
            setPermission('unsupported');
            return;
        }
        setPermission('pending');
        try {
            const access = await navigator.requestMIDIAccess();
            midiAccessRef.current = access;
            refreshDevices(access);
            attachListeners(access);
            access.onstatechange = () => {
                refreshDevices(access);
                attachListeners(access);
            };
            setPermission('granted');
            setError(null);
        } catch (err) {
            setPermission('denied');
            setError(err instanceof Error ? err.message : 'MIDI access was denied.');
        }
    }, [attachListeners, refreshDevices]);

    const selectDevice = useCallback((deviceId: string | null) => {
        selectedDeviceIdRef.current = deviceId;
        setSelectedDeviceIdState(deviceId);
        heldChannelsRef.current.clear();
        setActiveNotes(new Set());
        if (midiAccessRef.current) {
            attachListeners(midiAccessRef.current);
        }
    }, [attachListeners]);

    return {
        permission,
        devices,
        selectedDeviceId,
        selectDevice,
        activeNotes,
        error,
        connect,
        subscribeNoteOn,
    };
}
