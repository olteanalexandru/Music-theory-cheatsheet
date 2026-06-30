'use client';

import React, { useState } from 'react';
import type { SynthController } from '@/app/utils/useSynth';
import { RHYTHM_LESSONS } from '@/app/utils/rhythmLessons';
import RhythmNotation from '@/app/components/RhythmNotation';

interface RhythmLessonsProps {
    synth: SynthController;
}

const SPEEDS = { slow: 60, normal: 92 } as const;
type SpeedKey = keyof typeof SPEEDS;

// A fixed, hand-authored walkthrough (see rhythmLessons.ts) rather than the
// quiz-style curriculum unit — these are short explanations paired with
// playable, re-listenable examples, meant to be read and heard side by side
// before attempting the graded Tap-Along tab.
const RhythmLessons: React.FC<RhythmLessonsProps> = ({ synth }) => {
    const [lessonIndex, setLessonIndex] = useState(0);
    const [speed, setSpeed] = useState<SpeedKey>('normal');
    const lesson = RHYTHM_LESSONS[lessonIndex];

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {RHYTHM_LESSONS.map((l, i) => (
                    <button
                        key={l.id}
                        onClick={() => setLessonIndex(i)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                            ${i === lessonIndex ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            <div className="p-4 md:p-6 rounded-lg theme-secondary-bg space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <h3 className="text-lg font-semibold theme-text">{lesson.title}</h3>
                        <p className="theme-secondary-text text-sm">{lesson.summary}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                        <span className="theme-secondary-text mr-1">Playback:</span>
                        {(Object.keys(SPEEDS) as SpeedKey[]).map((key) => (
                            <button
                                key={key}
                                onClick={() => setSpeed(key)}
                                className={`px-2 py-1 rounded-md capitalize transition-colors
                                    ${speed === key ? 'theme-accent-bg' : 'theme-muted-bg theme-secondary-text hover:opacity-90'}`}
                            >
                                {key}
                            </button>
                        ))}
                    </div>
                </div>

                {lesson.body.map((paragraph, i) => (
                    <p key={i} className="theme-text text-sm leading-relaxed">{paragraph}</p>
                ))}

                <div className="space-y-4">
                    {lesson.examples.map((example, i) => (
                        <div key={i} className="p-3 rounded-lg theme-muted-bg">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <p className="theme-text text-sm font-medium">{example.label}</p>
                                <button
                                    onClick={() => synth.playRhythm(example.events, SPEEDS[speed])}
                                    className="px-3 py-1.5 theme-btn rounded-lg text-sm hover:opacity-90"
                                >
                                    ▶ Play
                                </button>
                            </div>
                            <p className="theme-secondary-text text-xs font-mono mb-2 tracking-wide">{example.counting}</p>
                            <RhythmNotation events={example.events} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <button
                    onClick={() => setLessonIndex((i) => Math.max(0, i - 1))}
                    disabled={lessonIndex === 0}
                    className="px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                >
                    ← Previous
                </button>
                <span className="theme-secondary-text text-xs">{lessonIndex + 1} / {RHYTHM_LESSONS.length}</span>
                <button
                    onClick={() => setLessonIndex((i) => Math.min(RHYTHM_LESSONS.length - 1, i + 1))}
                    disabled={lessonIndex === RHYTHM_LESSONS.length - 1}
                    className="px-3 py-1.5 theme-muted-bg theme-secondary-text rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                >
                    Next →
                </button>
            </div>
        </div>
    );
};

export default RhythmLessons;
