'use client';

import React, { useState } from 'react';
import { circleOfFifths } from '@/app/utils/musicTheory';
import type { SynthController } from '@/app/utils/useSynth';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';

interface CircleOfFifthsProps {
    initialSelectedRoot: string;
    mode: 'bass' | 'guitar';
    synth: SynthController;
}

const BASE_PITCH_CLASS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

function noteNameToPitchClass(name: string): number {
    const base = BASE_PITCH_CLASS[name[0].toUpperCase()] ?? 0;
    let offset = 0;
    for (const accidental of name.slice(1)) {
        if (accidental === '#' || accidental === '♯') offset += 1;
        else if (accidental === 'b' || accidental === '♭') offset -= 1;
    }
    return (((base + offset) % 12) + 12) % 12;
}

const CHORD_ROOT_MIDI = 60; // C4 — chord chips just need to sound right, not sit at a specific octave.

// Chord names here are always `${root}`, `${root}m`, or `${root}dim` (see
// getPrimaryChords/getDerivedChords below), so a triad is fully determined by
// stripping the quality suffix and picking the matching third/fifth.
function chordNameToMidiNotes(chord: string): number[] {
    const quality = chord.endsWith('dim') ? 'dim' : chord.endsWith('m') ? 'minor' : 'major';
    const root = quality === 'dim' ? chord.slice(0, -3) : quality === 'minor' ? chord.slice(0, -1) : chord;
    const rootMidi = CHORD_ROOT_MIDI + noteNameToPitchClass(root);
    const third = quality === 'major' ? 4 : 3;
    const fifth = quality === 'dim' ? 6 : 7;
    return [rootMidi, rootMidi + third, rootMidi + fifth];
}

export const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({ initialSelectedRoot, mode, synth }) => {
    const t = useTranslations('tools');
    const [prevInitialRoot, setPrevInitialRoot] = useState(initialSelectedRoot);
    const [selectedRoot, setSelectedRoot] = useState(initialSelectedRoot);
    const [showChords, setShowChords] = useState<boolean>(false);

    // Reset the selection when the parent supplies a new root, while still
    // letting the user pick a different note locally (React's documented
    // pattern for adjusting state during render instead of in an effect).
    if (initialSelectedRoot !== prevInitialRoot) {
        setPrevInitialRoot(initialSelectedRoot);
        setSelectedRoot(initialSelectedRoot);
    }

    type Note = keyof typeof circleOfFifths.scaleDegrees;

    const getKeySignature = (note: Note): string => {
        const scale = circleOfFifths.scaleDegrees[note];
        if (!scale) return 'Unknown key signature';
        const accidentals = Array.from(new Set(scale.filter((n) => /[#b]/.test(n))));
        if (accidentals.length === 0) return t.circleOfFifths.noSharpsOrFlats;
        const type = accidentals.every((n) => n.includes('#'))
            ? t.circleOfFifths.sharpLabel
            : accidentals.every((n) => n.includes('b'))
            ? t.circleOfFifths.flatLabel
            : 'accidental';
        return `${accidentals.length} ${type}${accidentals.length > 1 ? 's' : ''}: ${accidentals.join(', ')}`;
    };

    const getPrimaryChords = (root: string) => {
        const scale = circleOfFifths.scaleDegrees[root as keyof typeof circleOfFifths.scaleDegrees];
        return {
            I: scale[0],             // Tonic (1st degree)
            IV: scale[3],            // Subdominant (4th degree)
            V: scale[4]              // Dominant (5th degree)
        };
    };

    const getDerivedChords = (root: string) => {
        const scale = circleOfFifths.scaleDegrees[root as keyof typeof circleOfFifths.scaleDegrees];
        return {
            ii: `${scale[1]}m`,      // Supertonic (2nd degree)
            iii: `${scale[2]}m`,     // Mediant (3rd degree)
            vi: `${scale[5]}m`,      // Submediant (6th degree)
            vii: `${scale[6]}dim`    // Leading tone (7th degree)
        };
    };

    const renderNote = (note: string, index: number, radius: number, isMajor: boolean) => {
        const angle = (index * 30 - 90) * (Math.PI / 180);
        const x = (50 + radius * Math.cos(angle)).toFixed(2);
        const y = (50 + radius * Math.sin(angle)).toFixed(2);
        const isSelected = selectedRoot === note;
        const bgColor = isMajor 
            ? (isSelected ? 'theme-accent-bg' : 'theme-muted-bg hover:opacity-90') 
            : (isSelected ? 'bg-indigo-400' : 'theme-secondary-bg');
        const size = isMajor ? 'w-12 h-12' : 'w-10 h-10';
        const fontSize = isMajor ? 'font-bold' : 'text-sm';
        const chordLabel = isMajor ? note : circleOfFifths.relatives[note as keyof typeof circleOfFifths.relatives];

        return (
            <div
                key={note}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${size} rounded-full
                    flex items-center justify-center cursor-pointer transition-colors duration-200
                    ${bgColor} theme-text ${fontSize}`}
                style={{ left: `${x}%`, top: `${y}%` }}
                onClick={() => {
                    setSelectedRoot(note);
                    synth.playChord(chordNameToMidiNotes(chordLabel));
                }}
            >
                {chordLabel}
            </div>
        );
    };

    return (
        <div className={`theme-card rounded-lg p-4 md:p-6 shadow-lg ${mode === 'guitar' ? 'guitar-mode' : 'bass-mode'} relative`}>
            {/* Background animation - ensure it's behind other elements */}
            <div className="absolute inset-0 overflow-hidden -z-10"> 
                <div className="moving-part bg-indigo-500 opacity-50"></div>
                <div className="moving-part bg-indigo-400 opacity-50"></div>
                <div className="moving-part bg-indigo-300 opacity-50"></div>
            </div>
            {/* Content container - ensure it's above the background */}
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg md:text-xl font-bold theme-text">{t.circleOfFifths.title}</h3>
                    <button
                        onClick={() => setShowChords(!showChords)}
                        className="px-4 py-2 theme-btn rounded-sm hover:opacity-90 z-20" // Added z-20
                    >
                        {showChords ? t.circleOfFifths.hideChords : t.circleOfFifths.showChords}
                    </button>
                </div>

                <div className="relative w-full aspect-square max-w-[300px] md:max-w-[500px] mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 theme-secondary-text opacity-30" />
                    <div className="absolute inset-[25%] rounded-full border-2 theme-secondary-text opacity-30" />

                    {circleOfFifths.order.map((note, index) => renderNote(note, index, 40, true))}
                    {circleOfFifths.order.map((note, index) => renderNote(note, index, 25, false))}
                </div>

                <div className="mt-6 theme-text space-y-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h4 className="font-semibold mb-2">{t.circleOfFifths.selectedKey} {selectedRoot}</h4>
                            <button
                                onClick={() => synth.playChord(chordNameToMidiNotes(selectedRoot))}
                                className="px-3 py-1 theme-btn rounded-sm text-sm hover:opacity-90"
                            >
                                {t.circleOfFifths.play}
                            </button>
                        </div>
                        <p>{t.circleOfFifths.keySignature} {getKeySignature(selectedRoot as Note)}</p>
                        <p>{t.circleOfFifths.relativeMinor} {circleOfFifths.relatives[selectedRoot as Note]}</p>
                    </div>

                    {showChords && (
                        <div>
                            <h4 className="font-semibold mb-2">{t.circleOfFifths.primaryChords}</h4>
                            <div className="grid grid-cols-3 gap-4">
                                {Object.entries(getPrimaryChords(selectedRoot)).map(([roman, chord]) => (
                                    <div
                                        key={roman}
                                        className="theme-secondary-bg p-2 rounded-sm text-center cursor-pointer hover:opacity-90"
                                        onClick={() => synth.playChord(chordNameToMidiNotes(chord))}
                                    >
                                        <div className="text-sm theme-secondary-text">{roman}</div>
                                        <div className="font-bold theme-text">{chord}</div>
                                    </div>
                                ))}
                            </div>

                            <h4 className="font-semibold mt-4 mb-2">{t.circleOfFifths.derivedChords}</h4>
                            <div className="grid grid-cols-4 gap-4">
                                {Object.entries(getDerivedChords(selectedRoot)).map(([roman, chord]) => (
                                    <div
                                        key={roman}
                                        className="theme-secondary-bg p-2 rounded-sm text-center cursor-pointer hover:opacity-90"
                                        onClick={() => synth.playChord(chordNameToMidiNotes(chord))}
                                    >
                                        <div className="text-sm theme-secondary-text">{roman}</div>
                                        <div className="font-bold theme-text">{chord}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 className="font-semibold mb-2">{t.circleOfFifths.keyRelationships}</h4>
                        <ul className="list-disc list-inside space-y-1">
                            <li>{t.circleOfFifths.relMoveClockwise}</li>
                            <li>{t.circleOfFifths.relMoveCounterclockwise}</li>
                            <li>{t.circleOfFifths.relInnerCircle}</li>
                            <li>{t.circleOfFifths.relAdjacentKeys}</li>
                        </ul>
                    </div>
                    <br/><br/>
                    <h1>{t.circleOfFifths.findingRelativesTitle}</h1>
                    <ul>
                        <li>
                            <p><strong>{t.circleOfFifths.degree2Title}</strong></p>
                            <p>{t.circleOfFifths.degree2Line1}<br/>
                               {t.circleOfFifths.degree2Line2}</p>
                        </li>
                        <li>
                            <p><strong>{t.circleOfFifths.degree3Title}</strong></p>
                            <p>{t.circleOfFifths.degree3Line1}<br/>
                               {t.circleOfFifths.degree3Line2}</p>
                        </li>
                        <li>
                            <p><strong>{t.circleOfFifths.degree4Title}</strong></p>
                            <p>{t.circleOfFifths.degree4Line1}</p>
                        </li>
                        <li>
                            <p><strong>{t.circleOfFifths.degree5Title}</strong></p>
                            <p>{t.circleOfFifths.degree5Line1}</p>
                        </li>
                        <li>
                            <p><strong>{t.circleOfFifths.degree6Title}</strong></p>
                            <p>{t.circleOfFifths.degree6Line1}<br/>
                               {t.circleOfFifths.degree6Line2}</p>
                        </li>
                        <li>
                            <p><strong>{t.circleOfFifths.degree7Title}</strong></p>
                            <p>{t.circleOfFifths.degree7Line1}<br/>
                               {t.circleOfFifths.degree7Line2}</p>
                        </li>
                    </ul>
                </div>
            </div> {/* Close relative z-10 container */}
        </div>
    );
};

export default CircleOfFifths;
