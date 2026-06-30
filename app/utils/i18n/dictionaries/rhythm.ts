export interface RhythmDict {
    section: {
        heading: string;
        tabs: { reference: string; lessons: string; tapAlong: string };
        reference: {
            durationsHeading: string;
            timeSignaturesHeading: string;
            beatsPerMeasure: (n: number) => string;
            play: string;
            newExample: string;
            metronomeHeading: string;
            timeSignatureLabel: string;
            tempo: (bpm: number) => string;
            start: string;
            stop: string;
        };
    };
    lessons: {
        playbackLabel: string;
        speeds: { slow: string; normal: string };
        play: string;
        previous: string;
        next: string;
        progress: (current: number, total: number) => string;
    };
    tapAlong: {
        instructions: string;
        difficultyLabel: string;
        timeSignatureLabel: string;
        newPattern: string;
        bpm: (n: number) => string;
        midiHint: {
            midiConnected: string;
            microphoneConnected: string;
            joiner: string;
            suffixWithInput: string;
            noInput: string;
        };
        start: string;
        tryAgain: string;
        listen: string;
        countIn: (beat: number, total: number) => string;
        tap: string;
        liveCounts: (hit: number, missed: number, total: number) => string;
        cancel: string;
        resultSummary: (accuracyPct: number, hit: number, total: number, missed: number) => string;
        extraTaps: (n: number) => string;
        timingRightOnTime: string;
        timingRushing: string;
        timingDragging: string;
    };
    patternControls: {
        patternType: string;
        rootNote: string;
        numberOfStrings: string;
        instrument: string;
        tuning: string;
        scaleMode: string;
        arpeggioType: string;
        chordType: string;
        displayMode: string;
        landmarkNumbers: string;
        noteSystem: string;
        selectRootHint: string;
    };
}

export const en: RhythmDict = {
    section: {
        heading: 'Rhythm',
        tabs: { reference: 'Reference', lessons: 'Lessons', tapAlong: 'Tap-Along' },
        reference: {
            durationsHeading: 'Note & Rest Durations',
            timeSignaturesHeading: 'Time Signatures',
            beatsPerMeasure: (n) => `${n} beats per measure`,
            play: '▶ Play',
            newExample: 'New Example',
            metronomeHeading: 'Metronome',
            timeSignatureLabel: 'Time Signature:',
            tempo: (bpm) => `Tempo: ${bpm} BPM`,
            start: '▶ Start',
            stop: '■ Stop',
        },
    },
    lessons: {
        playbackLabel: 'Playback:',
        speeds: { slow: 'slow', normal: 'normal' },
        play: '▶ Play',
        previous: '← Previous',
        next: 'Next →',
        progress: (current, total) => `${current} / ${total}`,
    },
    tapAlong: {
        instructions:
            "Listen to a one-measure pattern, then tap it back in time — on your MIDI device, the button, or the spacebar. Graded on timing only; pitch doesn't matter.",
        difficultyLabel: 'Difficulty:',
        timeSignatureLabel: 'Time Signature:',
        newPattern: 'New Pattern',
        bpm: (n) => `${n} BPM`,
        midiHint: {
            midiConnected: 'MIDI connected — tap any pad/key',
            microphoneConnected: 'microphone connected — tap, clap, or play a note near it',
            joiner: ', or ',
            suffixWithInput: ', or use the button or spacebar below.',
            noInput: 'No MIDI device or microphone connected — use the button or spacebar below, or connect one via Display & Audio Settings above.',
        },
        start: '▶ Start',
        tryAgain: '▶ Try Again',
        listen: 'Listen…',
        countIn: (beat, total) => `${beat} / ${total}`,
        tap: 'TAP',
        liveCounts: (hit, missed, total) => `Hit: ${hit} · Missed: ${missed} / ${total}`,
        cancel: 'Cancel',
        resultSummary: (accuracyPct, hit, total, missed) => `${accuracyPct}% accuracy (${hit}/${total} hit, ${missed} missed`,
        extraTaps: (n) => `, ${n} extra taps`,
        timingRightOnTime: 'Right on time!',
        timingRushing: 'You’re rushing slightly — try to relax into the beat.',
        timingDragging: 'You’re dragging slightly — try to anticipate the beat.',
    },
    patternControls: {
        patternType: 'Pattern Type',
        rootNote: 'Root Note',
        numberOfStrings: 'Number of Strings',
        instrument: 'Instrument',
        tuning: 'Tuning',
        scaleMode: 'Scale/Mode',
        arpeggioType: 'Arpeggio Type',
        chordType: 'Chord Type',
        displayMode: 'Display Mode',
        landmarkNumbers: 'Landmark Numbers',
        noteSystem: 'Note System',
        selectRootHint: 'Select a root note to see landmark numbers.',
    },
};

export const ro: RhythmDict = {
    section: {
        heading: 'Ritm',
        tabs: { reference: 'Referință', lessons: 'Lecții', tapAlong: 'Bate Ritmul' },
        reference: {
            durationsHeading: 'Durate de Note și Pauze',
            timeSignaturesHeading: 'Măsuri',
            beatsPerMeasure: (n) => `${n} timpi pe măsură`,
            play: '▶ Redă',
            newExample: 'Exemplu Nou',
            metronomeHeading: 'Metronom',
            timeSignatureLabel: 'Măsură:',
            tempo: (bpm) => `Tempo: ${bpm} BPM`,
            start: '▶ Pornește',
            stop: '■ Oprește',
        },
    },
    lessons: {
        playbackLabel: 'Redare:',
        speeds: { slow: 'lent', normal: 'normal' },
        play: '▶ Redă',
        previous: '← Anterior',
        next: 'Următor →',
        progress: (current, total) => `${current} / ${total}`,
    },
    tapAlong: {
        instructions:
            'Ascultă un tipar de o măsură, apoi bate-l înapoi la timp — de pe dispozitivul tău MIDI, din buton sau cu bara de spațiu. Notat doar pe timing; înălțimea sunetului nu contează.',
        difficultyLabel: 'Dificultate:',
        timeSignatureLabel: 'Măsură:',
        newPattern: 'Tipar Nou',
        bpm: (n) => `${n} BPM`,
        midiHint: {
            midiConnected: 'MIDI conectat — atinge orice clapă/pad',
            microphoneConnected: 'microfon conectat — bate, pocnește din palme sau cântă o notă aproape de el',
            joiner: ', sau ',
            suffixWithInput: ', sau folosește butonul ori bara de spațiu de mai jos.',
            noInput: 'Niciun dispozitiv MIDI sau microfon conectat — folosește butonul ori bara de spațiu de mai jos, sau conectează unul din Setări Afișaj și Audio de mai sus.',
        },
        start: '▶ Pornește',
        tryAgain: '▶ Încearcă din nou',
        listen: 'Ascultă…',
        countIn: (beat, total) => `${beat} / ${total}`,
        tap: 'BATE',
        liveCounts: (hit, missed, total) => `Nimerite: ${hit} · Ratate: ${missed} / ${total}`,
        cancel: 'Anulează',
        resultSummary: (accuracyPct, hit, total, missed) => `${accuracyPct}% precizie (${hit}/${total} nimerite, ${missed} ratate`,
        extraTaps: (n) => `, ${n} atingeri în plus`,
        timingRightOnTime: 'Chiar la timp!',
        timingRushing: 'Grăbești puțin ritmul — încearcă să te relaxezi pe timp.',
        timingDragging: 'Întârzii puțin ritmul — încearcă să anticipezi timpul.',
    },
    patternControls: {
        patternType: 'Tip Tipar',
        rootNote: 'Notă Fundamentală',
        numberOfStrings: 'Număr de Corzi',
        instrument: 'Instrument',
        tuning: 'Acordaj',
        scaleMode: 'Gamă/Mod',
        arpeggioType: 'Tip Arpegiu',
        chordType: 'Tip Acord',
        displayMode: 'Mod de Afișare',
        landmarkNumbers: 'Numere de Referință',
        noteSystem: 'Sistem de Note',
        selectRootHint: 'Selectează o notă fundamentală pentru a vedea numerele de referință.',
    },
};
