import type { NoteTimelineEntry, ParsedScore } from '@/app/utils/scoreTypes';
import { buildNotationFromMidi } from '@/app/utils/midiToNotation';

// Hand-rolled Standard MIDI File (SMF) reader. alphaTab (used for Guitar Pro
// import elsewhere in this feature) explicitly cannot import standalone .mid
// files as a renderable score, so plain MIDI files need their own parser here.

const DEFAULT_MICROS_PER_QUARTER = 500000; // 120 BPM, the MIDI spec's implicit default

interface RawNote {
    track: number;
    pitch: number;
    velocity: number;
    startTick: number;
    endTick: number;
}

interface TempoChange {
    tick: number;
    microsecondsPerQuarter: number;
}

class ByteReader {
    private pos = 0;
    constructor(private readonly bytes: Uint8Array) {}

    get position(): number {
        return this.pos;
    }

    get remaining(): number {
        return this.bytes.length - this.pos;
    }

    readUint8(): number {
        return this.bytes[this.pos++];
    }

    readUint16(): number {
        const value = (this.bytes[this.pos] << 8) | this.bytes[this.pos + 1];
        this.pos += 2;
        return value;
    }

    readUint32(): number {
        const value =
            (this.bytes[this.pos] << 24) |
            (this.bytes[this.pos + 1] << 16) |
            (this.bytes[this.pos + 2] << 8) |
            this.bytes[this.pos + 3];
        this.pos += 4;
        return value >>> 0;
    }

    readString(length: number): string {
        let s = '';
        for (let i = 0; i < length; i++) s += String.fromCharCode(this.readUint8());
        return s;
    }

    skip(count: number): void {
        this.pos += count;
    }

    readVarLength(): number {
        let value = 0;
        for (let i = 0; i < 4; i++) {
            const byte = this.readUint8();
            value = (value << 7) | (byte & 0x7f);
            if ((byte & 0x80) === 0) break;
        }
        return value >>> 0;
    }
}

// Channel-message data-byte counts (status byte high nibble 0x8-0xE), used to
// skip messages we don't care about (aftertouch, pitch bend, etc.) by the
// correct number of bytes instead of guessing.
const CHANNEL_MESSAGE_DATA_BYTES: Record<number, number> = {
    0x8: 2, // note off
    0x9: 2, // note on
    0xa: 2, // polyphonic key pressure
    0xb: 2, // control change
    0xc: 1, // program change
    0xd: 1, // channel pressure
    0xe: 2, // pitch bend
};

function parseTrack(
    reader: ByteReader,
    trackIndex: number,
    trackEnd: number,
    notesOut: RawNote[],
    tempoOut: TempoChange[],
    nameOut: { name: string | null }
): void {
    let tick = 0;
    let runningStatus = 0;
    const openNotes = new Map<string, { startTick: number; velocity: number }>();

    while (reader.position < trackEnd) {
        tick += reader.readVarLength();
        let status = reader.readUint8();

        if (status < 0x80) {
            // Running status: this byte is actually the first data byte of the
            // previous channel message, so back up and reuse the prior status.
            reader.skip(-1);
            status = runningStatus;
        } else if (status < 0xf0) {
            runningStatus = status;
        }

        if (status === 0xff) {
            // Meta event
            const metaType = reader.readUint8();
            const length = reader.readVarLength();
            const dataStart = reader.position;
            if (metaType === 0x51 && length === 3) {
                const microsecondsPerQuarter = (reader.readUint8() << 16) | (reader.readUint8() << 8) | reader.readUint8();
                tempoOut.push({ tick, microsecondsPerQuarter });
            } else if (metaType === 0x03 && nameOut.name === null) {
                nameOut.name = reader.readString(length).trim();
            }
            reader.skip(dataStart + length - reader.position);
        } else if (status === 0xf0 || status === 0xf7) {
            // SysEx event
            const length = reader.readVarLength();
            reader.skip(length);
        } else if (status >= 0x80 && status < 0xf0) {
            const command = status >> 4;
            const channel = status & 0x0f;
            const dataByteCount = CHANNEL_MESSAGE_DATA_BYTES[command] ?? 0;
            const data1 = dataByteCount >= 1 ? reader.readUint8() : 0;
            const data2 = dataByteCount >= 2 ? reader.readUint8() : 0;

            const key = `${channel}:${data1}`;
            if (command === 0x9 && data2 > 0) {
                openNotes.set(key, { startTick: tick, velocity: data2 });
            } else if (command === 0x8 || (command === 0x9 && data2 === 0)) {
                const open = openNotes.get(key);
                if (open) {
                    openNotes.delete(key);
                    if (tick > open.startTick) {
                        notesOut.push({
                            track: trackIndex,
                            pitch: data1,
                            velocity: open.velocity,
                            startTick: open.startTick,
                            endTick: tick,
                        });
                    }
                }
            }
        } else {
            // Unknown/unsupported status byte (shouldn't normally happen) — bail
            // out of this track rather than reading garbage as further events.
            break;
        }
    }
}

function buildTickToMsConverter(tempoChanges: TempoChange[], division: number): (tick: number) => number {
    const sorted = [...tempoChanges].sort((a, b) => a.tick - b.tick);
    if (sorted.length === 0 || sorted[0].tick > 0) {
        sorted.unshift({ tick: 0, microsecondsPerQuarter: DEFAULT_MICROS_PER_QUARTER });
    }

    // Precompute cumulative milliseconds at the start of each tempo segment so
    // arbitrary ticks can be converted with a single segment lookup.
    const segmentStartMs: number[] = [0];
    for (let i = 1; i < sorted.length; i++) {
        const deltaTicks = sorted[i].tick - sorted[i - 1].tick;
        const msPerTick = sorted[i - 1].microsecondsPerQuarter / division / 1000;
        segmentStartMs.push(segmentStartMs[i - 1] + deltaTicks * msPerTick);
    }

    return (tick: number): number => {
        let segment = 0;
        for (let i = sorted.length - 1; i >= 0; i--) {
            if (tick >= sorted[i].tick) {
                segment = i;
                break;
            }
        }
        const msPerTick = sorted[segment].microsecondsPerQuarter / division / 1000;
        return segmentStartMs[segment] + (tick - sorted[segment].tick) * msPerTick;
    };
}

export async function parseMidiFile(buffer: ArrayBuffer, fileName: string): Promise<ParsedScore> {
    const reader = new ByteReader(new Uint8Array(buffer));

    if (reader.readString(4) !== 'MThd') {
        throw new Error('Not a valid MIDI file (missing MThd header).');
    }
    const headerLength = reader.readUint32();
    const headerEnd = reader.position + headerLength;
    reader.readUint16(); // format (0/1/2) — not needed, we flatten all tracks
    const trackCount = reader.readUint16();
    const division = reader.readUint16();
    reader.skip(headerEnd - reader.position);

    if ((division & 0x8000) !== 0) {
        throw new Error('SMPTE time-division MIDI files are not supported.');
    }

    const rawNotes: RawNote[] = [];
    const tempoChanges: TempoChange[] = [];
    const trackNames: string[] = [];

    for (let t = 0; t < trackCount && reader.remaining > 0; t++) {
        if (reader.readString(4) !== 'MTrk') {
            throw new Error('Malformed MIDI file (missing MTrk chunk).');
        }
        const trackLength = reader.readUint32();
        const trackEnd = reader.position + trackLength;
        const nameHolder = { name: null as string | null };
        parseTrack(reader, t, trackEnd, rawNotes, tempoChanges, nameHolder);
        reader.skip(trackEnd - reader.position);
        trackNames.push(nameHolder.name || `Track ${t + 1}`);
    }

    const ticksToMs = buildTickToMsConverter(tempoChanges, division);

    const notes: NoteTimelineEntry[] = rawNotes
        .map((note) => {
            const startMs = ticksToMs(note.startTick);
            const endMs = ticksToMs(note.endTick);
            return {
                pitch: note.pitch,
                startMs,
                durationMs: Math.max(endMs - startMs, 1),
                track: note.track,
                velocity: note.velocity,
            };
        })
        .sort((a, b) => a.startMs - b.startMs);

    const durationMs = notes.reduce((max, n) => Math.max(max, n.startMs + n.durationMs), 0);
    const title = fileName.replace(/\.[^/.]+$/, '');
    const notation = await buildNotationFromMidi(rawNotes, tempoChanges, division, trackNames, title).catch(() => null);

    return {
        title,
        trackNames,
        notes,
        durationMs,
        ...(notation ? { notation } : {}),
    };
}
