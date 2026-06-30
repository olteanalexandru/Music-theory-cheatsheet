'use client';

import React, { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import PatternControls from '@/app/components/PatternControls';
import Fretboard from '@/app/components/Fretboard';
import { guitarTunings, defaultGuitarTuningName } from '@/app/utils/guitarTunings';
import { noteNameFromMidi } from '@/app/utils/notes';
import { usePracticeTools } from '@/app/utils/PracticeToolsContext';
import {
    CHROMATIC_SCALE,
    FRETBOARD_PATTERNS,
    getNoteIndex,
    getNoteAtFret,
    isNoteInPattern,
    type PatternName,
    type PatternType,
} from '@/app/utils/fretboardTheory';
import { useTranslations } from '@/app/utils/i18n/LocaleContext';

type NoteName = string;

export default function FretboardPage() {
    const [hoveredNote, setHoveredNote] = useState<NoteName | null>(null);
    const [selectedRoot, setSelectedRoot] = useState<NoteName | null>(null);
    const [selectedPattern, setSelectedPattern] = useState<PatternName | null>(null);
    const [patternType, setPatternType] = useState<PatternType>('scales');
    const [showTheory, setShowTheory] = useState(false);
    const [numChords, setNumChords] = useState<number>(4);
    const [useLandmarkNumbers, setUseLandmarkNumbers] = useState(false);
    const [instrument, setInstrument] = useState<'bass' | 'guitar'>('bass');
    const [selectedTuningName, setSelectedTuningName] = useState<string>(defaultGuitarTuningName);

    const { midi } = usePracticeTools();
    const t = useTranslations('tools');

    const midiActiveNoteNames = useMemo(
        () => new Set(Array.from(midi.activeNotes, noteNameFromMidi)),
        [midi.activeNotes]
    );

    const tuning = useMemo<string[]>(() => {
        if (instrument === 'bass') {
            const bassStringsMap: Record<number, string[]> = {
                4: ['G', 'D', 'A', 'E'],
                5: ['G', 'D', 'A', 'E', 'B'],
                6: ['C', 'G', 'D', 'A', 'E', 'B'],
            };
            return bassStringsMap[numChords] || bassStringsMap[4];
        }
        return guitarTunings[selectedTuningName] || guitarTunings[defaultGuitarTuningName];
    }, [instrument, numChords, selectedTuningName]);

    const noteToLandmarkNumber = (note: string) => {
        if (!selectedRoot) return note;
        const rootIndex = getNoteIndex(selectedRoot);
        const noteIndex = getNoteIndex(note);
        const distance = (noteIndex - rootIndex + 12) % 12;
        const majorScale = [0, 2, 4, 5, 7, 9, 11];
        const scaleDegree = majorScale.indexOf(distance);
        return scaleDegree !== -1 ? scaleDegree + 1 : note;
    };

    const instrumentWord = instrument === 'bass' ? t.fretboardPage.titleBass : t.fretboardPage.titleGuitar;

    return (
        <div>
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold theme-text mb-2">
                    {t.fretboardPage.pageTitle(instrumentWord)}
                </h1>
                <p className="theme-secondary-text">
                    {t.fretboardPage.subtitle(instrument === 'bass' ? t.fretboardPage.bassWord : t.fretboardPage.guitarWord)}
                </p>
            </div>

            <button
                onClick={() => setShowTheory(!showTheory)}
                className="mb-4 flex items-center justify-center md:justify-start space-x-2 text-indigo-400 hover:text-indigo-300 transition-colors"
            >
                <Info size={20} />
                <span>{showTheory ? t.fretboardPage.hideTheory : t.fretboardPage.showTheory}</span>
            </button>

            <div className="mb-8 theme-card rounded-lg p-4 md:p-6 shadow-lg">
                <PatternControls
                    patterns={FRETBOARD_PATTERNS}
                    patternType={patternType}
                    setPatternType={setPatternType}
                    selectedPattern={selectedPattern}
                    setSelectedPattern={setSelectedPattern}
                    chromaticScale={CHROMATIC_SCALE}
                    selectedRoot={selectedRoot}
                    setSelectedRoot={setSelectedRoot}
                    numChords={numChords}
                    setNumChords={setNumChords}
                    useLandmarkNumbers={useLandmarkNumbers}
                    setUseLandmarkNumbers={setUseLandmarkNumbers}
                    instrument={instrument}
                    setInstrument={setInstrument}
                    selectedTuningName={selectedTuningName}
                    setSelectedTuningName={setSelectedTuningName}
                />
                <div className="mt-4">
                    <Fretboard
                        getNoteAtFret={getNoteAtFret}
                        hoveredNote={hoveredNote}
                        setHoveredNote={setHoveredNote}
                        selectedRoot={selectedRoot}
                        selectedPattern={selectedPattern}
                        patterns={FRETBOARD_PATTERNS}
                        patternType={patternType}
                        isNoteInPattern={isNoteInPattern}
                        numChords={numChords}
                        useLandmarkNumbers={useLandmarkNumbers}
                        noteToLandmarkNumber={noteToLandmarkNumber}
                        instrument={instrument}
                        tuning={tuning}
                        midiActiveNoteNames={midiActiveNoteNames}
                    />
                </div>
            </div>

            {showTheory && selectedPattern && selectedRoot && (
                <div className="mt-8 theme-card rounded-lg p-4 md:p-6 shadow-lg">
                    <h3 className="text-lg md:text-xl font-bold theme-text mb-4">{t.fretboardPage.patternDetails}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-indigo-400 font-semibold mb-2">
                                {t.fretboardPage.patternInKey(selectedPattern, selectedRoot)}
                            </h4>
                            <p className="theme-secondary-text mb-4">{FRETBOARD_PATTERNS[patternType][selectedPattern].description}</p>
                        </div>
                        <div>
                            <h4 className="text-indigo-400 font-semibold mb-2">
                                {patternType === 'scales'
                                    ? t.fretboardPage.relatedArpeggios
                                    : patternType === 'arpeggios'
                                    ? t.fretboardPage.relatedModes
                                    : t.fretboardPage.relatedChords}
                            </h4>
                            <ul className="list-disc list-inside theme-secondary-text">
                                {patternType === 'scales'
                                    ? FRETBOARD_PATTERNS[patternType][selectedPattern].relatedArpeggios?.map((arp) => (
                                          <li key={arp} className="mb-1">{arp}</li>
                                      ))
                                    : patternType === 'arpeggios'
                                    ? FRETBOARD_PATTERNS[patternType][selectedPattern].relatedModes?.map((mode) => (
                                          <li key={mode} className="mb-1">{mode}</li>
                                      ))
                                    : FRETBOARD_PATTERNS[patternType][selectedPattern].relatedModes?.map((chord) => (
                                          <li key={chord} className="mb-1">{chord}</li>
                                      ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {showTheory && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="theme-card rounded-lg p-4 shadow-lg">
                        <h3 className="theme-text font-semibold mb-2">{t.fretboardPage.scaleModeCharacteristics}</h3>
                        <div className="space-y-2 theme-secondary-text text-sm">
                            <p>{t.fretboardPage.scaleModeIntro}</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{t.fretboardPage.modes.ionian}</li>
                                <li>{t.fretboardPage.modes.dorian}</li>
                                <li>{t.fretboardPage.modes.phrygian}</li>
                                <li>{t.fretboardPage.modes.lydian}</li>
                                <li>{t.fretboardPage.modes.mixolydian}</li>
                                <li>{t.fretboardPage.modes.aeolian}</li>
                                <li>{t.fretboardPage.modes.locrian}</li>
                                <li>{t.fretboardPage.modes.harmonicMinor}</li>
                                <li>{t.fretboardPage.modes.melodicMinor}</li>
                                <li>{t.fretboardPage.modes.pentatonicMajor}</li>
                                <li>{t.fretboardPage.modes.pentatonicMinor}</li>
                                <li>{t.fretboardPage.modes.bluesScale}</li>
                            </ul>
                        </div>
                    </div>

                    <div className="theme-card rounded-lg p-4 shadow-lg">
                        <h3 className="theme-text font-semibold mb-2">{t.fretboardPage.arpeggioConstruction}</h3>
                        <div className="space-y-2 theme-secondary-text text-sm">
                            <p>{t.fretboardPage.arpeggioConstructionIntro}</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{t.fretboardPage.arpeggios.major7}</li>
                                <li>{t.fretboardPage.arpeggios.minor7}</li>
                                <li>{t.fretboardPage.arpeggios.dominant7}</li>
                                <li>{t.fretboardPage.arpeggios.minor7flat5}</li>
                                <li>{t.fretboardPage.arpeggios.diminished7}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {showTheory && (
                <div className="mt-8 theme-card rounded-lg p-4 md:p-6 shadow-lg">
                    <h3 className="text-lg md:text-xl font-bold theme-text mb-4">{t.fretboardPage.nashvilleTitle}</h3>
                    <p className="theme-secondary-text mb-4">{t.fretboardPage.nashvilleIntro1}</p>
                    <p className="theme-secondary-text mb-4">{t.fretboardPage.nashvilleIntro2}</p>
                    <ul className="list-disc list-inside theme-secondary-text mb-4">
                        <li>{t.fretboardPage.keyExampleC}</li>
                        <li>{t.fretboardPage.keyExampleG}</li>
                        <li>{t.fretboardPage.keyExampleF}</li>
                    </ul>
                    <p className="theme-secondary-text mb-4">{t.fretboardPage.nashvilleIntro3}</p>
                    <ul className="list-disc list-inside theme-secondary-text mb-4">
                        <li>{t.fretboardPage.degree1}</li>
                        <li>{t.fretboardPage.degree2}</li>
                        <li>{t.fretboardPage.degree3}</li>
                        <li>{t.fretboardPage.degree4}</li>
                        <li>{t.fretboardPage.degree5}</li>
                        <li>{t.fretboardPage.degree6}</li>
                        <li>{t.fretboardPage.degree7}</li>
                    </ul>
                    <p className="theme-secondary-text mb-4">{t.fretboardPage.nashvilleBenefitsIntro}</p>
                    <ul className="list-disc list-inside theme-secondary-text mb-4">
                        <li>{t.fretboardPage.benefitTranspose}</li>
                        <li>{t.fretboardPage.benefitRecognize}</li>
                        <li>{t.fretboardPage.benefitCommunicate}</li>
                    </ul>
                    <p className="theme-secondary-text">{t.fretboardPage.nashvilleExample}</p>
                </div>
            )}
        </div>
    );
}
