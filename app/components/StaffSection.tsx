'use client';
import React, { useState } from 'react';

interface StaffSectionProps {
  chromaticScale: string[][];
  selectedRoot?: string;
}

type DisplayMode = 'letters' | 'movable-do' | 'fixed-do';

const StaffSection: React.FC<StaffSectionProps> = ({ chromaticScale, selectedRoot: initialRoot = 'C' }) => {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('letters');
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string>(initialRoot);
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);

  // All available keys
  const keys = ['C', 'C♯', 'D♭', 'D', 'D♯', 'E♭', 'E', 'F', 'F♯', 'G♭', 'G', 'G♯', 'A♭', 'A', 'A♯', 'B♭', 'B'];

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

  // Convert note to solfège syllable
  const noteToFixedDo = (note: string): string => {
    const fixedDoMap: Record<string, string> = {
      'C': 'Do',
      'D': 'Re',
      'E': 'Mi',
      'F': 'Fa',
      'G': 'Sol',
      'A': 'La',
      'B': 'Si'
    };
    return fixedDoMap[note] || note;
  };

  // Convert note to movable solfège based on selected key
  const noteToMovableDo = (note: string, key: string): string => {
    const movableDoMap: Record<number, string> = {
      0: 'Do',
      1: 'Di/Ra',
      2: 'Re',
      3: 'Ri/Me',
      4: 'Mi',
      5: 'Fa',
      6: 'Fi/Se',
      7: 'Sol',
      8: 'Si/Le',
      9: 'La',
      10: 'Li/Te',
      11: 'Ti'
    };

    const getNoteIndex = (n: string) => {
      return chromaticScale.findIndex(notes => notes.some(en => en === n));
    };

    const keyIndex = getNoteIndex(key);
    const noteIndex = getNoteIndex(note);
    const interval = (noteIndex - keyIndex + 12) % 12;

    return movableDoMap[interval] || note;
  };

  const getDisplayText = (note: string): string => {
    const baseNote = note.replace(/[♯♭]/g, '').toUpperCase();
    
    switch (displayMode) {
      case 'letters':
        return note;
      case 'fixed-do':
        return noteToFixedDo(baseNote);
      case 'movable-do':
        return noteToMovableDo(note, selectedKey);
      default:
        return note;
    }
  };

  // Check if note should be visible (on hover or click)
  const isNoteVisible = (note: string): boolean => {
    return note === hoveredNote || note === selectedNote;
  };

  return (
    <div className="mt-8 theme-card rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold theme-text mb-6">Interactive Staff</h2>

      {/* Controls */}
      <div className="mb-8 flex flex-col gap-4">
        {/* Key Selector */}
        <div>
          <label className="theme-secondary-text mr-3 block md:inline-block mb-2 md:mb-0">
            Select Key:
          </label>
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="px-4 py-2 rounded-lg bg-indigo-900/30 text-indigo-300 border border-indigo-500/50 hover:bg-indigo-900/50 transition-colors"
          >
            {keys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        {/* Display Mode */}
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
              Movable Do (Key: {selectedKey})
            </button>
          </div>
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
              const yPosition = 220 - pos.position * 15; // Calculate Y position on staff
              const xStart = 280;
              const spacing = 60;
              const noteX = xStart + pos.position * spacing;
              const isSelected = selectedNote === pos.note;
              const isHovered = hoveredNote === pos.note;
              const displayText = getDisplayText(pos.note);
              const shouldShowNote = isNoteVisible(pos.note);

              return (
                <g
                  key={`note-${pos.position}`}
                  onMouseEnter={() => setHoveredNote(pos.note)}
                  onMouseLeave={() => setHoveredNote(null)}
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

                  {/* Clickable note position */}
                  <g onClick={() => setSelectedNote(shouldShowNote ? null : pos.note)}>
                    {/* Highlight circle on hover/select */}
                    <circle
                      cx={noteX}
                      cy={yPosition}
                      r="20"
                      fill={
                        isSelected
                          ? 'rgba(99, 102, 241, 0.6)'
                          : isHovered
                          ? 'rgba(99, 102, 241, 0.4)'
                          : 'rgba(99, 102, 241, 0.1)'
                      }
                      stroke={
                        isSelected || isHovered
                          ? 'rgba(129, 140, 248, 1)'
                          : 'rgba(129, 140, 248, 0.3)'
                      }
                      strokeWidth="2"
                      style={{
                        transition: 'all 0.2s ease'
                      }}
                    />

                    {/* Note head (filled circle) - only visible on hover/click */}
                    {shouldShowNote && (
                      <circle
                        cx={noteX}
                        cy={yPosition}
                        r="12"
                        fill="rgba(129, 140, 248, 0.9)"
                        style={{
                          transition: 'all 0.2s ease'
                        }}
                      />
                    )}
                  </g>

                  {/* Display text below the staff - only visible on hover/click */}
                  {shouldShowNote && (
                    <text
                      x={noteX}
                      y={yPosition + 60}
                      fontSize="14"
                      fill="rgba(129, 140, 248, 0.9)"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                      style={{
                        transition: 'all 0.2s ease',
                        fontWeight: 'bold'
                      }}
                    >
                      {displayText}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Selected Note Display */}
      {selectedNote && (
        <div className="mt-6 p-4 bg-indigo-900/30 rounded-lg border border-indigo-500/50">
          <h3 className="theme-text font-semibold mb-2">Selected Note: {selectedNote}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="theme-secondary-text text-sm">Letter Name</p>
              <p className="text-indigo-300 font-semibold text-lg">{selectedNote}</p>
            </div>
            <div>
              <p className="theme-secondary-text text-sm">Fixed Do (Solfège)</p>
              <p className="text-indigo-300 font-semibold text-lg">
                {noteToFixedDo(selectedNote.replace(/[♯♭]/g, ''))}
              </p>
            </div>
            <div>
              <p className="theme-secondary-text text-sm">Movable Do (Key: {selectedKey})</p>
              <p className="text-indigo-300 font-semibold text-lg">
                {noteToMovableDo(selectedNote, selectedKey)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Information */}
      <div className="mt-6 p-4 bg-indigo-900/20 rounded-lg">
        <h4 className="theme-text font-semibold mb-2">How to use:</h4>
        <ul className="theme-secondary-text text-sm space-y-1 list-disc list-inside">
          <li>Hover over or click any note on the staff to reveal it</li>
          <li>Use the "Select Key" dropdown to change the key for Movable Do solfège</li>
          <li>
            <strong>Letter Names:</strong> Display traditional musical note names (C, D, E, etc.)
          </li>
          <li>
            <strong>Fixed Do:</strong> Solfège syllables where C is always "Do"
          </li>
          <li>
            <strong>Movable Do:</strong> Solfège syllables relative to the selected key
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StaffSection;
