'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { SynthController } from '@/app/utils/useSynth';
import {
    DURATION_NAMES,
    DURATION_LABELS,
    TIME_SIGNATURE_NAMES,
    TIME_SIGNATURES,
    generateRhythmPattern,
    type TimeSignatureName,
    type RhythmEvent,
} from '@/app/utils/rhythmData';
import RhythmNotation from '@/app/components/RhythmNotation';

interface RhythmSectionProps {
    synth: SynthController;
}

const EXAMPLE_BPM = 90;

function buildExamplePatterns(): Record<TimeSignatureName, RhythmEvent[]> {
    const initial = {} as Record<TimeSignatureName, RhythmEvent[]>;
    TIME_SIGNATURE_NAMES.forEach((name) => {
        initial[name] = generateRhythmPattern(name, 'medium');
    });
    return initial;
}

const RhythmSection: React.FC<RhythmSectionProps> = ({ synth }) => {
    const [bpm, setBpm] = useState(100);
    const [timeSig, setTimeSig] = useState<TimeSignatureName>('4/4');
    const [isPlaying, setIsPlaying] = useState(false);
    const [examplePatterns, setExamplePatterns] = useState<Record<TimeSignatureName, RhythmEvent[]>>(buildExamplePatterns);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const beatsPerMeasure = TIME_SIGNATURES[timeSig].beatsPerMeasure;

    // Plain quarter-note-equivalent clicks, one per beat of the selected time
    // signature — a simple steady pulse rather than full notation playback.
    useEffect(() => {
        if (!isPlaying) return;
        const clickPattern: RhythmEvent[] = Array.from({ length: beatsPerMeasure }, () => ({
            type: 'note',
            duration: 'quarter',
            beats: 1,
        }));
        const measureSeconds = beatsPerMeasure * (60 / bpm);
        synth.playRhythm(clickPattern, bpm);
        intervalRef.current = setInterval(() => synth.playRhythm(clickPattern, bpm), measureSeconds * 1000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPlaying, bpm, beatsPerMeasure, synth]);

    const regenerateExample = (name: TimeSignatureName) => {
        setExamplePatterns((current) => ({ ...current, [name]: generateRhythmPattern(name, 'medium') }));
    };

    return (
        <div className="mt-8 theme-card rounded-lg p-4 md:p-6 shadow-lg">
            <h2 className="text-2xl font-bold theme-text mb-6">Rhythm</h2>

            <div className="mb-8">
                <h3 className="text-lg font-semibold theme-text mb-3">Note &amp; Rest Durations</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {DURATION_NAMES.map((duration) => (
                        <div key={duration} className="p-3 rounded-lg theme-secondary-bg">
                            <p className="theme-secondary-text text-xs mb-1">{DURATION_LABELS[duration]}</p>
                            <RhythmNotation events={[{ type: 'note', duration, beats: 1 }]} compact />
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-semibold theme-text mb-3">Time Signatures</h3>
                <div className="space-y-4">
                    {TIME_SIGNATURE_NAMES.map((name) => (
                        <div key={name} className="p-3 md:p-4 rounded-lg theme-secondary-bg">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <p className="theme-text font-semibold">
                                    {TIME_SIGNATURES[name].label} — {TIME_SIGNATURES[name].beatsPerMeasure} beats per measure
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => synth.playRhythm(examplePatterns[name], EXAMPLE_BPM)}
                                        className="px-3 py-1.5 theme-btn rounded-lg text-sm hover:opacity-90"
                                    >
                                        ▶ Play
                                    </button>
                                    <button
                                        onClick={() => regenerateExample(name)}
                                        className="px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90"
                                    >
                                        New Example
                                    </button>
                                </div>
                            </div>
                            <RhythmNotation events={examplePatterns[name]} />
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold theme-text mb-3">Metronome</h3>
                <div className="p-3 md:p-4 rounded-lg theme-secondary-bg space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="theme-secondary-text text-sm">Time Signature:</span>
                        {TIME_SIGNATURE_NAMES.map((name) => (
                            <button
                                key={name}
                                onClick={() => setTimeSig(name)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                                    ${timeSig === name ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                            >
                                {TIME_SIGNATURES[name].label}
                            </button>
                        ))}
                    </div>
                    <label className="flex flex-wrap items-center gap-3 text-sm theme-secondary-text">
                        Tempo: {bpm} BPM
                        <input
                            type="range"
                            min={40}
                            max={208}
                            step={2}
                            value={bpm}
                            onChange={(e) => setBpm(Number(e.target.value))}
                            className="w-full sm:w-48"
                        />
                    </label>
                    <button
                        onClick={() => setIsPlaying((current) => !current)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            isPlaying ? 'bg-red-500 text-white hover:opacity-90' : 'theme-btn hover:opacity-90'
                        }`}
                    >
                        {isPlaying ? '■ Stop' : '▶ Start'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RhythmSection;
