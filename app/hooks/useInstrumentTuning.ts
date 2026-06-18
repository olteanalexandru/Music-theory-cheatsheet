"use client";

import { useEffect, useState } from "react";
import { guitarTunings, defaultGuitarTuningName } from "@/app/utils/guitarTunings";
import type { Instrument } from "@/app/types/music";

const BASS_STRINGS_BY_COUNT: Record<number, string[]> = {
  4: ["G", "D", "A", "E"],
  5: ["G", "D", "A", "E", "B"],
  6: ["C", "G", "D", "A", "E", "B"],
};

export function getBassTuning(numStrings: number): string[] {
  return BASS_STRINGS_BY_COUNT[numStrings] ?? BASS_STRINGS_BY_COUNT[4];
}

export function useInstrumentTuning(instrument: Instrument, numBassStrings: number) {
  const [tuning, setTuning] = useState<string[]>(() => getBassTuning(numBassStrings));

  useEffect(() => {
    if (instrument === "bass") {
      setTuning(getBassTuning(numBassStrings));
    } else {
      setTuning(guitarTunings[defaultGuitarTuningName]);
    }
  }, [instrument, numBassStrings]);

  return [tuning, setTuning] as const;
}
