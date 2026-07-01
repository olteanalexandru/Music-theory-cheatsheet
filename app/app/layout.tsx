'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import ScrollHint from '@/app/components/ScrollHint';
import GamificationPanel from '@/app/components/GamificationPanel';
import { PracticeToolsProvider, usePracticeTools } from '@/app/utils/PracticeToolsContext';
import type { Waveform } from '@/app/utils/audioSynth';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';

const WAVEFORMS: Waveform[] = ['sine', 'triangle', 'sawtooth', 'square'];

function ToolNav() {
    const pathname = usePathname();
    const t = useTranslations('common');
    const TOOL_LINKS = [
        { href: '/app', label: t.toolNav.overview },
        { href: '/app/fretboard', label: t.toolNav.fretboard },
        { href: '/app/circle-of-fifths', label: t.toolNav.circleOfFifths },
        { href: '/app/staff', label: t.toolNav.staff },
        { href: '/app/clef-trainer', label: t.toolNav.clefTrainer },
        { href: '/app/rhythm', label: t.toolNav.rhythm },
        { href: '/app/ear-training', label: t.toolNav.earTraining },
        { href: '/app/play-along', label: t.toolNav.playAlong },
        { href: '/app/curriculum', label: t.toolNav.curriculum },
    ];
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
    const t = useTranslations('common');

    return (
        <div className="mb-6 theme-card rounded-xl shadow-lg overflow-hidden">
            <button
                onClick={() => setShowSettings((v) => !v)}
                className="flex w-full items-center justify-between gap-3 p-3 text-left hover:opacity-90"
                aria-expanded={showSettings}
            >
                <span className="flex items-center gap-2 text-sm font-semibold theme-text">
                    <Settings size={16} /> {t.audioSettings.title}
                </span>
                {showSettings ? <ChevronUp size={18} className="theme-secondary-text" /> : <ChevronDown size={18} className="theme-secondary-text" />}
            </button>

            {showSettings && (
                <div className="border-t theme-secondary-bg p-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <p className="text-sm font-semibold theme-text">{t.audioSettings.synth}</p>
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
                            {t.audioSettings.volume}
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
                        <p className="text-sm font-semibold theme-text">{t.audioSettings.midi}</p>
                        {midi.permission !== 'granted' ? (
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    onClick={midi.connect}
                                    className="px-3 py-1.5 theme-btn rounded-lg text-sm hover:opacity-90"
                                >
                                    {t.audioSettings.connectMidi}
                                </button>
                                {midi.permission === 'pending' && (
                                    <span className="text-sm theme-secondary-text">{t.audioSettings.requestingAccess}</span>
                                )}
                                {midi.permission === 'unsupported' && (
                                    <span className="text-sm theme-warning-text">
                                        {t.audioSettings.midiUnsupported}
                                    </span>
                                )}
                                {midi.permission === 'denied' && (
                                    <span className="text-sm theme-warning-text">
                                        {midi.error || t.audioSettings.midiDenied}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center gap-2">
                                <label className="text-sm theme-secondary-text">{t.audioSettings.device}</label>
                                <select
                                    value={midi.selectedDeviceId ?? ''}
                                    onChange={(e) => midi.selectDevice(e.target.value || null)}
                                    className="theme-muted-bg theme-secondary-text px-3 py-1.5 rounded-lg text-sm"
                                >
                                    <option value="">{t.audioSettings.allDevices}</option>
                                    {midi.devices.map((device) => (
                                        <option key={device.id} value={device.id}>
                                            {device.name}
                                        </option>
                                    ))}
                                </select>
                                {midi.devices.length === 0 && (
                                    <span className="text-sm theme-warning-text">{t.audioSettings.noMidiDevices}</span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 border-t theme-secondary-bg pt-3">
                        <p className="text-sm font-semibold theme-text">{t.audioSettings.microphone}</p>
                        {audio.permission !== 'granted' ? (
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    onClick={audio.connect}
                                    className="px-3 py-1.5 theme-btn rounded-lg text-sm hover:opacity-90"
                                >
                                    {t.audioSettings.connectMicrophone}
                                </button>
                                {audio.permission === 'pending' && (
                                    <span className="text-sm theme-secondary-text">{t.audioSettings.requestingAccess}</span>
                                )}
                                {audio.permission === 'unsupported' && (
                                    <span className="text-sm theme-warning-text">
                                        {t.audioSettings.microphoneUnsupported}
                                    </span>
                                )}
                                {audio.permission === 'denied' && (
                                    <span className="text-sm theme-warning-text">
                                        {audio.error || t.audioSettings.microphoneDenied}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-sm theme-secondary-text">{t.audioSettings.listening}</span>
                                <button
                                    onClick={audio.disconnect}
                                    className="px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90"
                                >
                                    {t.audioSettings.disconnect}
                                </button>
                            </div>
                        )}
                        <span className="text-xs theme-secondary-text">
                            {t.audioSettings.micTip}
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
