'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { SynthController } from '@/app/utils/useSynth';
import type { MidiInputController } from '@/app/utils/useMidiInput';
import type { AudioInputController } from '@/app/utils/useAudioInput';
import {
    DURATION_NAMES,
    TIME_SIGNATURE_NAMES,
    TIME_SIGNATURES,
    generateRhythmPattern,
    type TimeSignatureName,
    type RhythmEvent,
} from '@/app/utils/rhythmData';
import RhythmNotation from '@/app/components/RhythmNotation';
import RhythmLessons from '@/app/components/RhythmLessons';
import RhythmTapAlong from '@/app/components/RhythmTapAlong';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';

interface RhythmSectionProps {
    synth: SynthController;
    midi: MidiInputController;
    audio: AudioInputController;
}

type RhythmTab = 'reference' | 'lessons' | 'tap-along';

const EXAMPLE_BPM = 90;

function buildExamplePatterns(): Record<TimeSignatureName, RhythmEvent[]> {
    const initial = {} as Record<TimeSignatureName, RhythmEvent[]>;
    TIME_SIGNATURE_NAMES.forEach((name) => {
        initial[name] = generateRhythmPattern(name, 'medium');
    });
    return initial;
}

// A fixed, non-random measure of quarter notes per time signature, used only
// as the initial render's example pattern so server and client markup match.
// generateRhythmPattern uses Math.random(), so calling it directly in a
// useState initializer would render a different pattern on the server vs.
// the client's first render and trigger a hydration mismatch.
function buildDefaultExamplePatterns(): Record<TimeSignatureName, RhythmEvent[]> {
    const initial = {} as Record<TimeSignatureName, RhythmEvent[]>;
    TIME_SIGNATURE_NAMES.forEach((name) => {
        initial[name] = Array.from({ length: TIME_SIGNATURES[name].beatsPerMeasure }, () => ({
            type: 'note' as const,
            duration: 'quarter' as const,
            beats: 1,
        }));
    });
    return initial;
}

const RhythmSection: React.FC<RhythmSectionProps> = ({ synth, midi, audio }) => {
    const t = useTranslations('rhythm');
    const RHYTHM_TABS: { key: RhythmTab; label: string }[] = [
        { key: 'reference', label: t.section.tabs.reference },
        { key: 'lessons', label: t.section.tabs.lessons },
        { key: 'tap-along', label: t.section.tabs.tapAlong },
    ];
    const [tab, setTab] = useState<RhythmTab>('reference');
    const [bpm, setBpm] = useState(100);
    const [timeSig, setTimeSig] = useState<TimeSignatureName>('4/4');
    const [isPlaying, setIsPlaying] = useState(false);
    const [examplePatterns, setExamplePatterns] = useState<Record<TimeSignatureName, RhythmEvent[]>>(
        buildDefaultExamplePatterns
    );
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Swaps in the randomized example patterns after mount, once the
    // server-matching deterministic initial render has already committed.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setExamplePatterns(buildExamplePatterns());
    }, []);

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
            <h2 className="text-2xl font-bold theme-text mb-6">{t.section.heading}</h2>

            <div className="flex flex-wrap gap-2 mb-6">
                {RHYTHM_TABS.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => {
                            setTab(key);
                            if (key !== 'reference') setIsPlaying(false);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors
                            ${tab === key ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === 'reference' && (
                <>
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold theme-text mb-3">{t.section.reference.durationsHeading}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {DURATION_NAMES.map((duration) => (
                                <div key={duration} className="p-3 rounded-lg theme-secondary-bg">
                                    <p className="theme-secondary-text text-xs mb-1">{t.section.reference.durationLabels[duration]}</p>
                                    <RhythmNotation events={[{ type: 'note', duration, beats: 1 }]} compact />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-lg font-semibold theme-text mb-3">{t.section.reference.timeSignaturesHeading}</h3>
                        <div className="space-y-4">
                            {TIME_SIGNATURE_NAMES.map((name) => (
                                <div key={name} className="p-3 md:p-4 rounded-lg theme-secondary-bg">
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                        <p className="theme-text font-semibold">
                                            {TIME_SIGNATURES[name].label} — {t.section.reference.beatsPerMeasure(TIME_SIGNATURES[name].beatsPerMeasure)}
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => synth.playRhythm(examplePatterns[name], EXAMPLE_BPM)}
                                                className="px-3 py-1.5 theme-btn rounded-lg text-sm hover:opacity-90"
                                            >
                                                {t.section.reference.play}
                                            </button>
                                            <button
                                                onClick={() => regenerateExample(name)}
                                                className="px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90"
                                            >
                                                {t.section.reference.newExample}
                                            </button>
                                        </div>
                                    </div>
                                    <RhythmNotation events={examplePatterns[name]} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold theme-text mb-3">{t.section.reference.metronomeHeading}</h3>
                        <div className="p-3 md:p-4 rounded-lg theme-secondary-bg space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="theme-secondary-text text-sm">{t.section.reference.timeSignatureLabel}</span>
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
                                {t.section.reference.tempo(bpm)}
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
                                {isPlaying ? t.section.reference.stop : t.section.reference.start}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {tab === 'lessons' && <RhythmLessons synth={synth} />}

            {tab === 'tap-along' && <RhythmTapAlong synth={synth} midi={midi} audio={audio} />}
        </div>
    );
};

export default RhythmSection;
