// Autocorrelation-based pitch detector for microphone input (monophonic only —
// good enough for "play one note at a time" use cases like Play Along note
// grading; it has no way to separate simultaneous pitches in a chord).

const MIN_RMS = 0.01; // below this the signal is treated as silence, not a pitch
const MIN_FREQUENCY_HZ = 60; // below the lowest note we ever ask players to match
const MAX_FREQUENCY_HZ = 1500; // above the highest note we ever ask players to match

function rms(buffer: Float32Array): number {
    let sumSquares = 0;
    for (let i = 0; i < buffer.length; i++) sumSquares += buffer[i] * buffer[i];
    return Math.sqrt(sumSquares / buffer.length);
}

// Returns the detected pitch in Hz, or -1 if no confident pitch was found
// (silence, noise, or a signal too quiet/ambiguous to lock onto).
export function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
    if (rms(buffer) < MIN_RMS) return -1;

    // Trim near-silent leading/trailing samples so the autocorrelation window
    // is centered on the actual signal rather than diluted by silence.
    let start = 0;
    let end = buffer.length - 1;
    const trimThreshold = MIN_RMS / 2;
    while (start < buffer.length && Math.abs(buffer[start]) < trimThreshold) start++;
    while (end > start && Math.abs(buffer[end]) < trimThreshold) end--;
    const trimmed = buffer.slice(start, end + 1);
    if (trimmed.length < 8) return -1;

    const maxLag = Math.floor(trimmed.length / 2);
    const minLag = Math.floor(sampleRate / MAX_FREQUENCY_HZ);
    const searchMaxLag = Math.min(maxLag, Math.floor(sampleRate / MIN_FREQUENCY_HZ));

    const correlations = new Float32Array(searchMaxLag + 1);
    for (let lag = 0; lag <= searchMaxLag; lag++) {
        let sum = 0;
        for (let i = 0; i < trimmed.length - lag; i++) {
            sum += trimmed[i] * trimmed[i + lag];
        }
        correlations[lag] = sum / (trimmed.length - lag);
    }

    // Skip the initial downward slope from lag 0 so we don't lock onto the
    // trivial self-correlation peak at lag 0 instead of the true period.
    let lag = minLag;
    while (lag < searchMaxLag - 1 && correlations[lag] > correlations[lag + 1]) lag++;

    // Stop at the first local maximum after that trough — the fundamental
    // period — rather than scanning the rest of the range for a global max.
    // A periodic signal re-peaks at every harmonic multiple of the period
    // with similar correlation magnitude, so a global-max search can lock
    // onto a harmonic, or onto a spurious spike near the far edge of the
    // search window where only a few samples overlap.
    let bestLag = lag;
    while (bestLag < searchMaxLag - 1 && correlations[bestLag + 1] > correlations[bestLag]) bestLag++;
    const bestCorrelation = correlations[bestLag];
    if (bestLag <= 0 || bestCorrelation <= 0) return -1;

    // Parabolic interpolation across the 3 points around the peak for
    // sub-sample lag precision.
    const prev = correlations[bestLag - 1] ?? correlations[bestLag];
    const next = correlations[bestLag + 1] ?? correlations[bestLag];
    const denom = 2 * (2 * correlations[bestLag] - prev - next);
    const refinedLag = denom !== 0 ? bestLag + (prev - next) / denom : bestLag;
    if (refinedLag <= 0) return -1;

    return sampleRate / refinedLag;
}
