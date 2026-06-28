'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import ScrollHint from '@/app/components/ScrollHint';
import GamificationPanel from '@/app/components/GamificationPanel';
import { PracticeToolsProvider, usePracticeTools } from '@/app/utils/PracticeToolsContext';
import type { Waveform } from '@/app/utils/audioSynth';

const WAVEFORMS: Waveform[] = ['sine', 'triangle', 'sawtooth', 'square'];

const TOOL_LINKS = [
    { href: '/app', label: 'Overview' },
    { href: '/app/fretboard', label: 'Fretboard' },
    { href: '/app/circle-of-fifths', label: 'Circle of Fifths' },
    { href: '/app/staff', label: 'Staff' },
    { href: '/app/rhythm', label: 'Rhythm' },
    { href: '/app/ear-training', label: 'Ear Training' },
    { href: '/app/play-along', label: 'Play Along' },
    { href: '/app/curriculum', label: 'Curriculum' },
];

function ToolNav() {
    const pathname = usePathname();
    return (
        <ScrollHint as="nav" className="mb-6 flex items-center gap-1">
            {TOOL_LINKS.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                        pathname === link.href ? 'nav-link-active' : 'theme-muted-bg theme-secondary-text hover:opacity-90'
                    }`}
                >
                    {link.label}
                </Link>
            ))}
        </ScrollHint>
    );
}

const settingsToggleClass = (isActive: boolean) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'
    }`;

function AudioMidiSettings() {
    const { midi, audio, synth } = usePracticeTools();
    const [showSettings, setShowSettings] = useState(false);

    return (
        <div className="mb-6 theme-card rounded-xl shadow-lg overflow-hidden">
            <button
                onClick={() => setShowSettings((v) => !v)}
                className="flex w-full items-center justify-between gap-3 p-3 text-left hover:opacity-90"
                aria-expanded={showSettings}
            >
                <span className="flex items-center gap-2 text-sm font-semibold theme-text">
                    <Settings size={16} /> Display &amp; Audio Settings
                </span>
                {showSettings ? <ChevronUp size={18} className="theme-secondary-text" /> : <ChevronDown size={18} className="theme-secondary-text" />}
            </button>

            {showSettings && (
                <div className="border-t theme-secondary-bg p-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <p className="text-sm font-semibold theme-text">Synth</p>
                        <div className="flex flex-wrap gap-2">
                            {WAVEFORMS.map((wave) => (
                                <button
                                    key={wave}
                                    className={settingsToggleClass(synth.waveform === wave)}
                                    onClick={() => synth.setWaveform(wave)}
                                >
                                    {wave.charAt(0).toUpperCase() + wave.slice(1)}
                                </button>
                            ))}
                        </div>
                        <label className="flex items-center gap-2 text-sm theme-secondary-text">
                            Volume
                            <input
                                type="range"
                                min={0}
                                max={0.6}
                                step={0.02}
                                value={synth.volume}
                                onChange={(e) => synth.setVolume(Number(e.target.value))}
                                className="w-32"
                            />
                        </label>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 border-t theme-secondary-bg pt-3">
                        <p className="text-sm font-semibold theme-text">MIDI</p>
                        {midi.permission !== 'granted' ? (
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    onClick={midi.connect}
                                    className="px-3 py-1.5 theme-btn rounded-lg text-sm hover:opacity-90"
                                >
                                    Connect MIDI Device
                                </button>
                                {midi.permission === 'pending' && (
                                    <span className="text-sm theme-secondary-text">Requesting access…</span>
                                )}
                                {midi.permission === 'unsupported' && (
                                    <span className="text-sm theme-warning-text">
                                        Web MIDI isn&apos;t supported in this browser. Try Chrome or Edge.
                                    </span>
                                )}
                                {midi.permission === 'denied' && (
                                    <span className="text-sm theme-warning-text">
                                        {midi.error || 'MIDI access was denied.'}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center gap-2">
                                <label className="text-sm theme-secondary-text">Device:</label>
                                <select
                                    value={midi.selectedDeviceId ?? ''}
                                    onChange={(e) => midi.selectDevice(e.target.value || null)}
                                    className="theme-muted-bg theme-secondary-text px-3 py-1.5 rounded-lg text-sm"
                                >
                                    <option value="">All devices</option>
                                    {midi.devices.map((device) => (
                                        <option key={device.id} value={device.id}>
                                            {device.name}
                                        </option>
                                    ))}
                                </select>
                                {midi.devices.length === 0 && (
                                    <span className="text-sm theme-warning-text">No MIDI devices detected.</span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 border-t theme-secondary-bg pt-3">
                        <p className="text-sm font-semibold theme-text">Microphone</p>
                        {audio.permission !== 'granted' ? (
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    onClick={audio.connect}
                                    className="px-3 py-1.5 theme-btn rounded-lg text-sm hover:opacity-90"
                                >
                                    Connect Microphone
                                </button>
                                {audio.permission === 'pending' && (
                                    <span className="text-sm theme-secondary-text">Requesting access…</span>
                                )}
                                {audio.permission === 'unsupported' && (
                                    <span className="text-sm theme-warning-text">
                                        Microphone input isn&apos;t supported in this browser.
                                    </span>
                                )}
                                {audio.permission === 'denied' && (
                                    <span className="text-sm theme-warning-text">
                                        {audio.error || 'Microphone access was denied.'}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-sm theme-secondary-text">Listening for taps and notes.</span>
                                <button
                                    onClick={audio.disconnect}
                                    className="px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90"
                                >
                                    Disconnect
                                </button>
                            </div>
                        )}
                        <span className="text-xs theme-secondary-text">
                            Tip: use headphones — the mic can mistake the app&apos;s own sound for your input.
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AppToolsLayout({ children }: { children: React.ReactNode }) {
    return (
        <PracticeToolsProvider>
            <div className="flex-1 theme-bg p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <ToolNav />
                    <AudioMidiSettings />
                    <GamificationPanel />
                    {children}
                </div>
            </div>
        </PracticeToolsProvider>
    );
}
