"use client";

import { useEffect, useState } from "react";
import { guitarTunings, defaultGuitarTuningName } from "@/app/utils/guitarTunings";
import type { Instrument, Patterns, PatternType } from "@/app/types/music";

interface PatternControlsProps {
  patterns: Patterns;
  patternType: PatternType;
  setPatternType: (type: PatternType) => void;
  selectedPattern: string | null;
  setSelectedPattern: (pattern: string | null) => void;
  chromaticScale: readonly string[][];
  selectedRoot: string | null;
  setSelectedRoot: (root: string) => void;
  numChords: number;
  setNumChords: (num: number) => void;
  useLandmarkNumbers: boolean;
  setUseLandmarkNumbers: (use: boolean) => void;
  instrument: Instrument;
  setInstrument: (instrument: Instrument) => void;
  setTuning: (tuning: string[]) => void;
}

export default function PatternControls({
  patterns,
  patternType,
  setPatternType,
  selectedPattern,
  setSelectedPattern,
  chromaticScale,
  selectedRoot,
  setSelectedRoot,
  numChords,
  setNumChords,
  useLandmarkNumbers,
  setUseLandmarkNumbers,
  instrument,
  setInstrument,
  setTuning,
}: PatternControlsProps) {
  const [selectedTuningName, setSelectedTuningName] = useState(defaultGuitarTuningName);

  useEffect(() => {
    if (instrument === "guitar") {
      setTuning(guitarTunings[selectedTuningName]);
    }
  }, [instrument, selectedTuningName, setTuning]);

  const handleInstrumentChange = (next: Instrument) => {
    setInstrument(next);
    if (next === "guitar") {
      setSelectedTuningName(defaultGuitarTuningName);
    }
  };

  return (
    <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="theme-card rounded-lg p-4">
        <label className="theme-secondary-text text-sm mb-2 block">Pattern Type</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(patterns) as PatternType[]).map((option) => (
            <button
              key={option}
              onClick={() => {
                setPatternType(option);
                setSelectedPattern(null);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${patternType === option ? "theme-accent-bg" : "theme-muted-bg theme-secondary-text hover:opacity-90"}`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="theme-card rounded-lg p-4">
        <label className="theme-secondary-text text-sm mb-2 block">Root Note</label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
          {chromaticScale.flat().map((note) => (
            <button
              key={note}
              onClick={() => setSelectedRoot(note)}
              className={`p-2 rounded text-sm font-medium transition-colors
                ${selectedRoot === note ? "theme-accent-bg" : "theme-muted-bg theme-secondary-text hover:opacity-90"}`}
            >
              {note}
            </button>
          ))}
        </div>
      </div>

      {instrument === "bass" && (
        <div className="theme-card rounded-lg p-4">
          <label className="theme-secondary-text text-sm mb-2 block">Number of Strings</label>
          <select
            value={numChords}
            onChange={(e) => setNumChords(Number(e.target.value))}
            className="w-full theme-muted-bg theme-secondary-text p-2 rounded-lg"
          >
            {[4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="theme-card rounded-lg p-4">
        <label className="theme-secondary-text text-sm mb-2 block">Instrument</label>
        <select
          value={instrument}
          onChange={(e) => handleInstrumentChange(e.target.value as Instrument)}
          className="w-full theme-muted-bg theme-secondary-text p-2 rounded-lg"
        >
          {(["bass", "guitar"] as const).map((inst) => (
            <option key={inst} value={inst}>
              {inst.charAt(0).toUpperCase() + inst.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {instrument === "guitar" && (
        <div className="theme-card rounded-lg p-4">
          <label className="theme-secondary-text text-sm mb-2 block">Tuning</label>
          <select
            value={selectedTuningName}
            onChange={(e) => setSelectedTuningName(e.target.value)}
            className="w-full theme-muted-bg theme-secondary-text p-2 rounded-lg"
          >
            {Object.keys(guitarTunings).map((tuningName) => (
              <option key={tuningName} value={tuningName}>
                {tuningName.charAt(0).toUpperCase() + tuningName.slice(1)} ({guitarTunings[tuningName].join(" ")})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="theme-card rounded-lg p-4 col-span-2">
        <label className="theme-secondary-text text-sm mb-2 block">
          {patternType === "scales" ? "Scale/Mode" : patternType === "arpeggios" ? "Arpeggio Type" : "Chord Type"}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.keys(patterns[patternType]).map((pattern) => (
            <button
              key={pattern}
              onClick={() => setSelectedPattern(pattern)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${selectedPattern === pattern ? "theme-accent-bg" : "theme-muted-bg theme-secondary-text hover:opacity-90"}`}
            >
              {pattern}
            </button>
          ))}
        </div>
      </div>

      <div className="theme-card rounded-lg p-4">
        <label className="theme-secondary-text text-sm mb-2 block">Display Mode</label>
        <button
          onClick={() => setUseLandmarkNumbers(!useLandmarkNumbers)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full mb-2
            ${useLandmarkNumbers ? "theme-accent-bg" : "theme-muted-bg theme-secondary-text hover:opacity-90"}`}
        >
          {useLandmarkNumbers ? "Landmark Numbers" : "Note System"}
        </button>
        {useLandmarkNumbers && !selectedRoot && (
          <p className="text-xs text-yellow-400 mt-1">Select a root note to see landmark numbers.</p>
        )}
      </div>
    </div>
  );
}
