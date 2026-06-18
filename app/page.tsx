"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { CircleOfFifths } from "@/app/components/CircleOfFifths";
import PatternControls from "@/app/components/PatternControls";
import Fretboard from "@/app/components/Fretboard";
import StaffSection from "@/app/components/StaffSection";
import { useInstrumentTuning } from "@/app/hooks/useInstrumentTuning";
import { patterns } from "@/app/lib/patterns";
import {
  CHROMATIC_SCALE,
  getNoteAtFret,
  isNoteInPattern,
  noteToLandmarkNumber,
} from "@/app/lib/notes";
import type { Instrument, NoteName, PatternName, PatternType } from "@/app/types/music";

export default function HomePage() {
  const [hoveredNote, setHoveredNote] = useState<NoteName | null>(null);
  const [selectedRoot, setSelectedRoot] = useState<NoteName | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<PatternName | null>(null);
  const [patternType, setPatternType] = useState<PatternType>("scales");
  const [showTheory, setShowTheory] = useState(false);
  const [numChords, setNumChords] = useState(4);
  const [useLandmarkNumbers, setUseLandmarkNumbers] = useState(false);
  const [instrument, setInstrument] = useState<Instrument>("bass");
  const [tuning, setTuning] = useInstrumentTuning(instrument, numChords);

  const selectedPatternDetails =
    selectedPattern && patterns[patternType][selectedPattern];

  const relatedItems =
    patternType === "scales"
      ? selectedPatternDetails?.relatedArpeggios
      : selectedPatternDetails?.relatedModes;

  const relatedLabel =
    patternType === "scales"
      ? "Related Arpeggios"
      : patternType === "arpeggios"
        ? "Related Modes"
        : "Related Chords";

  return (
    <div className="min-h-screen theme-bg p-4 md:p-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="moving-part bg-indigo-500 opacity-50" />
        <div className="moving-part bg-indigo-400 opacity-50" />
        <div className="moving-part bg-indigo-300 opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-8 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold theme-text mb-2">
            {instrument === "bass" ? "Bass" : "Guitar"} Fretboard Navigator
          </h1>
          <p className="theme-secondary-text">
            Explore modes, scales, arpeggios, and chords on the {instrument}
          </p>
        </header>

        <PatternControls
          patterns={patterns}
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
          setTuning={setTuning}
        />

        <button
          onClick={() => setShowTheory((prev) => !prev)}
          className="mb-4 flex items-center justify-center md:justify-start gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Info size={20} />
          <span>{showTheory ? "Hide Theory" : "Show Theory"}</span>
        </button>

        <Fretboard
          getNoteAtFret={getNoteAtFret}
          hoveredNote={hoveredNote}
          setHoveredNote={setHoveredNote}
          selectedRoot={selectedRoot}
          selectedPattern={selectedPattern}
          patterns={patterns}
          patternType={patternType}
          isNoteInPattern={isNoteInPattern}
          numChords={numChords}
          useLandmarkNumbers={useLandmarkNumbers}
          noteToLandmarkNumber={(note) => noteToLandmarkNumber(note, selectedRoot)}
          instrument={instrument}
          tuning={tuning}
        />

        <StaffSection chromaticScale={CHROMATIC_SCALE} selectedRoot={selectedRoot ?? "C"} />

        {showTheory && selectedPatternDetails && selectedRoot && selectedPattern && (
          <section className="mt-8 theme-card rounded-lg p-4 md:p-6 shadow-lg">
            <h3 className="text-lg md:text-xl font-bold theme-text mb-4">Pattern Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-indigo-400 font-semibold mb-2">
                  {selectedPattern} in {selectedRoot}
                </h4>
                <p className="theme-secondary-text mb-4">{selectedPatternDetails.description}</p>
              </div>
              <div>
                <h4 className="text-indigo-400 font-semibold mb-2">{relatedLabel}</h4>
                <ul className="list-disc list-inside theme-secondary-text">
                  {relatedItems?.map((item) => (
                    <li key={item} className="mb-1">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="theme-card rounded-lg p-4 shadow-lg">
            <h3 className="theme-text font-semibold mb-2">Scale/Mode Characteristics</h3>
            <div className="space-y-2 theme-secondary-text text-sm">
              <p>Each mode has a unique character based on its intervals:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Ionian: Natural major scale (1 2 3 4 5 6 7)</li>
                <li>Dorian: Minor with bright 6th (1 2 ♭3 4 5 6 ♭7)</li>
                <li>Phrygian: Minor with dark ♭2 (1 ♭2 ♭3 4 5 ♭6 ♭7)</li>
                <li>Lydian: Major with bright #4 (1 2 3 #4 5 6 7)</li>
                <li>Mixolydian: Major with ♭7 (1 2 3 4 5 6 ♭7)</li>
                <li>Aeolian: Natural minor (1 2 ♭3 4 5 ♭6 ♭7)</li>
                <li>Locrian: Diminished (1 ♭2 ♭3 4 ♭5 ♭6 ♭7)</li>
                <li>Harmonic Minor: Minor with raised 7th (1 2 ♭3 4 5 ♭6 7)</li>
                <li>Melodic Minor: Minor with raised 6th and 7th (1 2 ♭3 4 5 6 7)</li>
                <li>Pentatonic Major: Five-note major scale (1 2 3 5 6)</li>
                <li>Pentatonic Minor: Five-note minor scale (1 ♭3 4 5 ♭7)</li>
                <li>Blues Scale: Minor pentatonic with added ♭5 (1 ♭3 4 ♭5 5 ♭7)</li>
              </ul>
            </div>
          </div>

          <div className="theme-card rounded-lg p-4 shadow-lg">
            <h3 className="theme-text font-semibold mb-2">Arpeggio Construction</h3>
            <div className="space-y-2 theme-secondary-text text-sm">
              <p>Common arpeggio formulas:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Major 7th: Root, Major 3rd, Perfect 5th, Major 7th</li>
                <li>Minor 7th: Root, Minor 3rd, Perfect 5th, Minor 7th</li>
                <li>Dominant 7th: Root, Major 3rd, Perfect 5th, Minor 7th</li>
                <li>Minor 7th ♭5: Root, Minor 3rd, Diminished 5th, Minor 7th</li>
                <li>Diminished 7th: Root, Minor 3rd, Diminished 5th, Diminished 7th</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-8 theme-card rounded-lg p-4 md:p-6 shadow-lg">
          <h3 className="text-lg md:text-xl font-bold theme-text mb-4">Nashville Number System</h3>
          <p className="theme-secondary-text mb-4">
            The Nashville Number System is a method of musical notation that represents the
            relationship between chords using numbers instead of traditional chord names. Each
            number represents a scale degree relative to the key you&apos;re in.
          </p>
          <p className="theme-secondary-text mb-4">
            All major scales follow the same pattern of whole steps (W) and half steps (H):
            W-W-H-W-W-W-H. The only difference between keys is the starting note. For example:
          </p>
          <ul className="list-disc list-inside theme-secondary-text mb-4">
            <li>C major: C D E F G A B (no sharps or flats)</li>
            <li>G major: G A B C D E F♯ (one sharp)</li>
            <li>F major: F G A B♭ C D E (one flat)</li>
          </ul>
          <p className="theme-secondary-text mb-4">
            In the number system, regardless of the key, the scale degrees are always:
          </p>
          <ul className="list-disc list-inside theme-secondary-text mb-4">
            <li>1 - Root/Tonic</li>
            <li>2 - Second</li>
            <li>3 - Third</li>
            <li>4 - Fourth</li>
            <li>5 - Fifth</li>
            <li>6 - Sixth</li>
            <li>7 - Seventh</li>
          </ul>
          <p className="theme-secondary-text mb-4">By using numbers instead of chord names, musicians can easily:</p>
          <ul className="list-disc list-inside theme-secondary-text mb-4">
            <li>Transpose songs to any key without rewriting</li>
            <li>Recognize chord relationships regardless of key</li>
            <li>Communicate chord progressions efficiently</li>
          </ul>
          <p className="theme-secondary-text">
            For example, a I-IV-V progression in C would be C-F-G, but in G it would be G-C-D.
            The relationship between the chords remains the same, just starting from a different
            root note.
          </p>
        </section>

        <div className="mt-8">
          <CircleOfFifths initialSelectedRoot={selectedRoot ?? "C"} mode={instrument} />
        </div>
      </div>
    </div>
  );
}
