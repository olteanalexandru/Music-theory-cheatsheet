// Shared tempo-map math used to translate between midi ticks (alphaTab's/the
// Play Along engine's native unit for a parsed score) and the milliseconds
// clock that actually drives playback (PianoRoll/notation cursor, grading).
// Both guitarProParser.ts and ScoreNotation.tsx need this, and must use the
// exact same tempo points to stay in sync with each other.

// alphaTab's internal ticks-per-quarter-note resolution (MidiUtils.QuarterTime).
// Not exported publicly, but it's a fixed constant the library always uses for
// the tick values passed into IMidiFileHandler, so it's safe to hardcode here.
export const ALPHATAB_TICKS_PER_QUARTER = 960;

interface TempoPoint {
    tick: number;
    bpm: number;
}

function buildTempoPoints(tempoTicks: number[], tempoBpm: number[]): { points: TempoPoint[]; segmentStartMs: number[] } {
    const points: TempoPoint[] = tempoTicks
        .map((tick, i) => ({ tick, bpm: tempoBpm[i] }))
        .sort((a, b) => a.tick - b.tick);
    if (points.length === 0 || points[0].tick > 0) {
        points.unshift({ tick: 0, bpm: 120 });
    }

    const segmentStartMs: number[] = [0];
    for (let i = 1; i < points.length; i++) {
        const deltaTicks = points[i].tick - points[i - 1].tick;
        const msPerTick = 60000 / (points[i - 1].bpm * ALPHATAB_TICKS_PER_QUARTER);
        segmentStartMs.push(segmentStartMs[i - 1] + deltaTicks * msPerTick);
    }

    return { points, segmentStartMs };
}

export function buildTickToMsConverter(tempoTicks: number[], tempoBpm: number[]): (tick: number) => number {
    const { points, segmentStartMs } = buildTempoPoints(tempoTicks, tempoBpm);
    return (tick: number): number => {
        let segment = 0;
        for (let i = points.length - 1; i >= 0; i--) {
            if (tick >= points[i].tick) {
                segment = i;
                break;
            }
        }
        const msPerTick = 60000 / (points[segment].bpm * ALPHATAB_TICKS_PER_QUARTER);
        return segmentStartMs[segment] + (tick - points[segment].tick) * msPerTick;
    };
}

export function buildMsToTickConverter(tempoTicks: number[], tempoBpm: number[]): (ms: number) => number {
    const { points, segmentStartMs } = buildTempoPoints(tempoTicks, tempoBpm);
    return (ms: number): number => {
        let segment = 0;
        for (let i = segmentStartMs.length - 1; i >= 0; i--) {
            if (ms >= segmentStartMs[i]) {
                segment = i;
                break;
            }
        }
        const msPerTick = 60000 / (points[segment].bpm * ALPHATAB_TICKS_PER_QUARTER);
        return points[segment].tick + (ms - segmentStartMs[segment]) / msPerTick;
    };
}
