import type { Instrument, Patterns, PatternType } from "@/app/types/music";

const BASS_STRINGS_BY_COUNT: Record<number, string[]> = {
  4: ["G", "D", "A", "E"],
  5: ["G", "D", "A", "E", "B"],
  6: ["C", "G", "D", "A", "E", "B"],
};

interface FretboardProps {
  getNoteAtFret: (openNote: string, fret: number) => string;
  hoveredNote: string | null;
  setHoveredNote: (note: string | null) => void;
  selectedRoot: string | null;
  selectedPattern: string | null;
  patterns: Patterns;
  patternType: PatternType;
  isNoteInPattern: (note: string, root: string | null, intervals: number[] | undefined) => boolean;
  numChords: number;
  useLandmarkNumbers: boolean;
  noteToLandmarkNumber: (note: string) => number | string;
  instrument: Instrument;
  tuning: string[];
}

const FRET_COUNT = 16;
const FRET_MARKERS = [3, 5, 7, 9, 12, 15];

function getDisplayStrings(instrument: Instrument, tuning: string[], numChords: number): string[] {
  if (instrument === "guitar") return tuning;
  return BASS_STRINGS_BY_COUNT[numChords] ?? BASS_STRINGS_BY_COUNT[4];
}

export default function Fretboard({
  getNoteAtFret,
  hoveredNote,
  setHoveredNote,
  selectedRoot,
  selectedPattern,
  patterns,
  patternType,
  isNoteInPattern,
  numChords,
  useLandmarkNumbers,
  noteToLandmarkNumber,
  instrument,
  tuning,
}: FretboardProps) {
  const displayStrings = getDisplayStrings(instrument, tuning, numChords);
  const stringCount = displayStrings.length;

  const stringLabelSize =
    stringCount > 6 ? "text-xs" : stringCount > 4 ? "text-xs md:text-sm" : "text-sm md:text-base";
  const noteSize =
    stringCount > 6
      ? "w-6 h-6 md:w-9 md:h-9"
      : stringCount > 4
        ? "w-7 h-7 md:w-10 md:h-10"
        : "w-8 h-8 md:w-12 md:h-12";
  const rowSpacing = stringCount > 6 ? "space-y-1" : stringCount > 4 ? "space-y-2" : "space-y-4";

  const selectedIntervals =
    selectedPattern && patterns[patternType][selectedPattern]?.intervals;

  return (
    <div className="theme-card rounded-xl shadow-2xl overflow-x-auto">
      <div className="flex px-4 md:px-8 py-2 border-b theme-secondary-bg">
        <div className="w-8 md:w-16 flex-shrink-0" />
        {Array.from({ length: FRET_COUNT }, (_, fret) => (
          <div
            key={fret}
            className="flex-1 min-w-[30px] md:min-w-[60px] text-center theme-secondary-text text-xs md:text-sm"
          >
            {fret}
            {FRET_MARKERS.includes(fret) && (
              <div className={`flex justify-center mt-1 ${fret === 12 ? "space-x-2" : ""}`}>
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-indigo-400" />
                {fret === 12 && <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-indigo-400" />}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={`px-2 md:px-4 py-4 ${rowSpacing}`}>
        {displayStrings.map((stringNote, stringIndex) => (
          <div key={`${stringNote}-${stringIndex}`} className="flex items-center">
            <div className="w-8 md:w-12 text-right pr-2 md:pr-4">
              <span
                className={`inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-indigo-500 text-white font-semibold ${stringLabelSize}`}
              >
                {useLandmarkNumbers ? noteToLandmarkNumber(stringNote) : stringNote}
              </span>
            </div>

            {Array.from({ length: FRET_COUNT }, (_, fret) => {
              if (fret === 0) {
                return (
                  <div key={fret} className="flex-1 min-w-[30px] md:min-w-[60px] flex justify-center relative" />
                );
              }

              const note = getNoteAtFret(stringNote, fret);
              const displayNote = useLandmarkNumbers ? noteToLandmarkNumber(note) : note;
              const isHovered = hoveredNote === note;
              const isInPattern = isNoteInPattern(note, selectedRoot, selectedIntervals);
              const isRoot = note === selectedRoot;

              return (
                <div key={fret} className="flex-1 min-w-[30px] md:min-w-[60px] flex justify-center relative">
                  <div
                    className={`
                      ${noteSize}
                      rounded-full flex items-center justify-center
                      text-xs md:text-sm font-medium transition-all duration-200
                      ${
                        isRoot
                          ? "theme-accent-bg theme-text scale-110"
                          : isInPattern
                            ? "bg-indigo-400 bg-opacity-75 theme-text"
                            : isHovered
                              ? "theme-secondary-bg theme-text"
                              : "theme-muted-bg theme-secondary-text hover:opacity-90"
                      }
                      cursor-pointer transform hover:scale-105
                    `}
                    onMouseEnter={() => setHoveredNote(note)}
                    onMouseLeave={() => setHoveredNote(null)}
                  >
                    {displayNote}
                  </div>
                  <div
                    className="absolute top-1/2 left-0 w-full h-[1px] md:h-[2px] theme-secondary-bg"
                    style={{ zIndex: -1, transform: "translateY(-50%)" }}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
