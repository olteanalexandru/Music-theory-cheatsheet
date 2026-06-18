"use client";
import React, { useState } from 'react';

interface StaffSectionProps {
  chromaticScale: string[][];
  selectedRoot?: string;
  setSelectedRoot?: (root: string) => void;
}

type DisplayMode = 'letters' | 'movable-do' | 'fixed-do';

const StaffSection: React.FC<StaffSectionProps> = ({ chromaticScale, selectedRoot = 'C', setSelectedRoot }) => {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('letters');
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);
  const effectiveRoot = selectedRoot || 'C';
  const rootOptions = chromaticScale.map((notes) => notes[0]);

  const majorScaleSpelling: Record<string, string[]> = {
    'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    'C♯': ['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#'],
    'D♭': ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'],
    'D': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
    'D♯': ['D#', 'E#', 'F##', 'G#', 'A#', 'B#', 'C##'],
    'E♭': ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
    'E': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
    'F': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
    'F♯': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'],
    'G♭': ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'],
    'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
    'G♯': ['G#', 'A#', 'B#', 'C#', 'D#', 'E#', 'F##'],
    'A♭': ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
    'A': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
    'A♯': ['A#', 'B#', 'C##', 'D#', 'E#', 'F##', 'G##'],
    'B♭': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
    'B': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#']

  };

  const activeScale = majorScaleSpelling[effectiveRoot] || majorScaleSpelling.C;

  const getKeySignatureSymbols = () => {
    const accidentals = activeScale.filter((note) => note.includes('#') || note.includes('b'));
    const uniqueAccidentals = Array.from(new Set(accidentals));
    if (uniqueAccidentals.length === 0) return 'No sharps or flats';
    const type = uniqueAccidentals.every((note) => note.includes('#')) ? 'sharp' : 'flat';
    return `${uniqueAccidentals.length} ${type}${uniqueAccidentals.length > 1 ? 's' : ''}: ${uniqueAccidentals.join(', ')}`;
  };

  const applyKeySignatureToNoteLetter = (note: string) => {
    const letter = note.replace(/[♯♭]/g, '');
    const mapping: Record<string, string> = {
      C: activeScale[0],
      D: activeScale[1],
      E: activeScale[2],
      F: activeScale[3],
      G: activeScale[4],
      A: activeScale[5],
      B: activeScale[6]
    };
    return mapping[letter] || note;
  };
  // Notes on a treble clef staff from bottom to top
  // Lines: E, G, B, D, F (bottom to top)
  // Spaces: F, A, C, E (bottom to top)
  // Extended: ledger lines for low notes
  const staffPositions = [
    { note: 'C', position: 0, isSpace: false, isLedger: true }, // Below staff
    { note: 'D', position: 1, isSpace: true, isLedger: false },
    { note: 'E', position: 2, isSpace: false, isLedger: false }, // Line
    { note: 'F', position: 3, isSpace: true, isLedger: false },
    { note: 'G', position: 4, isSpace: false, isLedger: false }, // Line
    { note: 'A', position: 5, isSpace: true, isLedger: false },
    { note: 'B', position: 6, isSpace: false, isLedger: false }, // Line
    { note: 'C', position: 7, isSpace: true, isLedger: false },
    { note: 'D', position: 8, isSpace: false, isLedger: false }, // Line
    { note: 'E', position: 9, isSpace: true, isLedger: false },
    { note: 'F', position: 10, isSpace: false, isLedger: false }, // Line
    { note: 'G', position: 11, isSpace: true, isLedger: false },
    { note: 'A', position: 12, isSpace: false, isLedger: true }, // Above staff
  ];

  
  // (fixed-do syllable mapping intentionally removed — fixed-do now shows absolute pitches)

  // Convert note to movable solfège based on selected root
  const noteToMovableDo = (note: string, root: string): string => {
    const movableDoMap: Record<number, string> = {
      0: 'Do',
      1: 'Di/Ra',
      2: 'Re',
      3: 'Ri/Mi',
      4: 'Mi',
      5: 'Fa',
      6: 'Fi/Sol',
      7: 'Sol',
      8: 'Si/La',
      9: 'La',
      10: 'Li/Ti',
      11: 'Ti'
    };

    const getNoteIndex = (n: string) => {
      return chromaticScale.findIndex(notes => notes.some(en => en === n));
    };

    const rootIndex = getNoteIndex(root);
    const noteIndex = getNoteIndex(note);
    const interval = (noteIndex - rootIndex + 12) % 12;

    return movableDoMap[interval] || note;
  };

  const getDisplayText = (note: string): string => {
    const keyedNote = applyKeySignatureToNoteLetter(note);

    switch (displayMode) {
      case 'letters':
        return keyedNote;
      case 'fixed-do':
        // Fixed Do: show absolute pitch names (C, D, E, etc.) adjusted by key signature
        return applyKeySignatureToNoteLetter(note);
      case 'movable-do':
        return noteToMovableDo(keyedNote, effectiveRoot);
      default:
        return keyedNote;
    }
  };

  return (
    <div className="mt-8 theme-card rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold theme-text mb-6">Interactive Staff</h2>

      {/* Controls */}
      <div className="mb-8 flex flex-wrap gap-4 items-center">
        <div>
          <label className="theme-secondary-text mr-3 block md:inline-block mb-2 md:mb-0">
            Display Mode:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDisplayMode('letters')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                displayMode === 'letters'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-indigo-900/30 text-indigo-300 hover:bg-indigo-900/50'
              }`}
            >
              Letter Names
            </button>
            <button
              onClick={() => setDisplayMode('fixed-do')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                displayMode === 'fixed-do'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-indigo-900/30 text-indigo-300 hover:bg-indigo-900/50'
              }`}
            >
              Fixed Do (Solfège)
            </button>
            <button
              onClick={() => setDisplayMode('movable-do')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                displayMode === 'movable-do'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-indigo-900/30 text-indigo-300 hover:bg-indigo-900/50'
              }`}
            >
              Movable Do (Root: {effectiveRoot})
            </button>
          </div>
        </div>
        <div>
          <p className="theme-secondary-text mb-2">Key Signature</p>
          <div className="px-4 py-2 rounded-lg bg-indigo-900/30 text-indigo-100 border border-indigo-700">
            {getKeySignatureSymbols()}
          </div>
        </div>
        <div>
          <label className="theme-secondary-text block mb-2">Select Key</label>
          <select
            value={effectiveRoot}
            onChange={(event) => {
              const newRoot = event.target.value;
              if (setSelectedRoot) {
                setSelectedRoot(newRoot);
              }
            }}
            className="px-4 py-2 rounded-lg bg-indigo-950/70 text-indigo-100 border border-indigo-700"
          >
            {rootOptions.map((root) => (
              <option key={root} value={root}>
                {root}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Display */}
      <div className="bg-indigo-950/50 rounded-lg p-8 overflow-x-auto">
        <svg viewBox="0 0 1200 400" className="w-full min-w-[800px]" style={{ height: 'auto' }}>
          {/* Treble Clef Staff */}
          <g>
            {/* Staff lines (5 lines) */}
            {[1, 2, 3, 4, 5].map((line) => (
              <line
                key={`line-${line}`}
                x1="80"
                y1={100 + (line - 1) * 30}
                x2="1100"
                y2={100 + (line - 1) * 30}
                stroke="rgba(129, 140, 248, 0.5)"
                strokeWidth="2"
              />
            ))}

            {/* Treble Clef Symbol */}
            <text
              x="100"
              y="160"
              fontSize="80"
              fill="rgba(129, 140, 248, 0.7)"
              fontFamily="serif"
            >
              𝄞
            </text>

            {/* Staff positions for notes */}
            {staffPositions.map((pos) => {
              const yPosition = 250 - pos.position * 15; // Calculate Y position on staff
              const xStart = 280;
              const spacing = 60;
              const noteX = xStart + pos.position * spacing;
              const isSelected = selectedNote === pos.note;
              const isHovered = hoveredNote === pos.note;
              const isVisible = isSelected || isHovered;
              const displayText = getDisplayText(pos.note);

              return (
                <g
                  key={`note-${pos.position}`}
                  onMouseEnter={() => setHoveredNote(pos.note)}
                  onMouseLeave={() => setHoveredNote((current) => (current === pos.note ? null : current))}
                  onClick={() => setSelectedNote(pos.note)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Ledger line for notes outside staff */}
                  {pos.isLedger && (
                    <line
                      x1={noteX - 20}
                      y1={yPosition}
                      x2={noteX + 20}
                      y2={yPosition}
                      stroke="rgba(129, 140, 248, 0.3)"
                      strokeWidth="1"
                    />
                  )}

                  {/* Highlight circle on hover/select */}
                  <circle
                    cx={noteX}
                    cy={yPosition}
                    r="20"
                    fill={isSelected ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.1)'}
                    stroke={isSelected || isHovered ? 'rgba(129, 140, 248, 1)' : 'rgba(129, 140, 248, 0.3)'}
                    strokeWidth="2"
                    style={{
                      transition: 'all 0.2s ease'
                    }}
                  />

                  {/* Note head (filled circle) */}
                  <circle
                    cx={noteX}
                    cy={yPosition}
                    r="12"
                    fill="rgba(129, 140, 248, 0.8)"
                  />

                  {/* Display text below the staff */}
                  <text
                    x={noteX}
                    y={yPosition + 60}
                    fontSize="14"
                    fill="rgba(129, 140, 248, 0.7)"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    opacity={isVisible ? 1 : 0}
                    style={{ transition: 'opacity 0.2s ease' }}
                  >
                    {displayText}
                  </text>

                  {/* Position labels */}
                  <text
                    x={noteX}
                    y={yPosition - 40}
                    fontSize="12"
                    fill="rgba(129, 140, 248, 0.4)"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    opacity={isVisible ? 1 : 0}
                    style={{ transition: 'opacity 0.2s ease' }}
                  >
                    {applyKeySignatureToNoteLetter(pos.note)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Selected Note Display */}
      {selectedNote && (
        <div className="mt-6 p-4 bg-indigo-900/30 rounded-lg border border-indigo-500/50">
          <h3 className="theme-text font-semibold mb-2">Selected Note: {selectedNote ? applyKeySignatureToNoteLetter(selectedNote) : ''}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="theme-secondary-text text-sm">Letter Name</p>
              <p className="text-indigo-300 font-semibold text-lg">{applyKeySignatureToNoteLetter(selectedNote)}</p>
            </div>
            <div>
              <p className="theme-secondary-text text-sm">Fixed Do (Absolute Pitch)</p>
              <p className="text-indigo-300 font-semibold text-lg">
                {selectedNote ? applyKeySignatureToNoteLetter(selectedNote) : ''}
              </p>
            </div>
            <div>
              <p className="theme-secondary-text text-sm">Movable Do (Root: {effectiveRoot})</p>
              <p className="text-indigo-300 font-semibold text-lg">
                {noteToMovableDo(selectedNote, effectiveRoot)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Information */}
      <div className="mt-6 p-4 bg-indigo-900/20 rounded-lg">
        <h4 className="theme-text font-semibold mb-2">How to use:</h4>
        <ul className="theme-secondary-text text-sm space-y-1 list-disc list-inside">
          <li>Click on any note on the staff to select it</li>
          <li>
            <strong>Letter Names:</strong> Display traditional musical note names (C, D, E, etc.)
          </li>
          <li>
            <strong>Fixed Do:</strong> Solfège syllables where C is always &quot;Do&quot;
          </li>
          <li>
            <strong>Movable Do:</strong> Solfège syllables relative to the selected root note
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StaffSection;
