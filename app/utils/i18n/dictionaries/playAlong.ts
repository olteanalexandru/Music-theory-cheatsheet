export interface PlayAlongDict {
    intro: {
        title: string;
        description: string;
    };
    upload: {
        loading: string;
        chooseFile: string;
        myFiles: string;
        myFilesCount: (n: number) => string;
        noSavedFiles: string;
        guitarPro: string;
        midi: string;
        signInHint: string;
        savingToAccount: string;
        savedToAccount: string;
        saveError: string;
        couldNotLoadSaved: string;
        unsupportedFileType: string;
        noPlayableNotes: string;
        couldNotReadGuitarPro: (message: string) => string;
        failedToLoad: string;
        fileSummary: (title: string, kind: string, count: number) => string;
    };
    metronome: {
        start: string;
        stop: string;
        tempo: (bpm: number) => string;
    };
    controls: {
        track: string;
        trackOption: (name: string, count: number) => string;
        strictness: string;
        strictnessRelaxed: string;
        strictnessNormal: string;
        strictnessStrict: string;
        transpose: string;
        semitones: (value: string) => string;
        tuning: string;
        speed: (percent: number) => string;
        waitModeLabel: string;
        waitModeTooltip: string;
        loopLabel: string;
        loopFrom: string;
        loopTo: string;
        seconds: string;
    };
    tuningPanel: {
        instrument: string;
        guitar: string;
        bass: string;
        strings: string;
        stringNumber: (n: number) => string;
        resetToFileTuning: string;
    };
    notation: {
        clef: string;
        clefAuto: string;
        clefTreble: string;
        clefBass: string;
        showTab: string;
        hideTab: string;
        noteLabels: string;
        noteLabelsOff: string;
        noteLabelsNames: string;
        noteLabelsSolfege: string;
        customTuningNotice: string;
        midiNotationNotice: string;
        loopSelectHint: string;
        renderingNotation: string;
        renderError: (message: string) => string;
        fullViewEnter: string;
        fullViewExit: string;
    };
    transport: {
        start: string;
        pause: string;
        resume: string;
        stop: string;
        hit: string;
        wrong: string;
        missed: string;
    };
    viz: {
        pianoRoll: string;
        staff: string;
        staffAndTab: string;
        noteHighway: string;
        legendUpcoming: string;
        legendHit: string;
        legendWrong: string;
        legendMissed: string;
        noFrettedNotes: string;
        switchToPianoRoll: string;
        connectDevicePrompt: string;
    };
    report: {
        title: string;
        shareLabel: string;
        shareText: (accuracy: number, hit: number, wrong: number, missed: number) => string;
        accuracy: string;
        hit: string;
        wrong: string;
        missed: string;
        extraNotes: (n: number) => string;
        timingOnTime: string;
        timingEarly: (ms: number) => string;
        timingLate: (ms: number) => string;
    };
}

export const en: PlayAlongDict = {
    intro: {
        title: 'Play Along',
        description:
            'Import a Guitar Pro or MIDI file, then play it back on your MIDI keyboard (or the on-screen ' +
            'keyboard) in real time. Notes are graded live for pitch and rhythm accuracy as the playhead scrolls.',
    },
    upload: {
        loading: 'Loading…',
        chooseFile: 'Choose File',
        myFiles: 'My Files',
        myFilesCount: (n) => ` (${n})`,
        noSavedFiles: 'Files you upload while signed in are saved here automatically.',
        guitarPro: 'Guitar Pro',
        midi: 'MIDI',
        signInHint: 'Sign in to automatically save files you upload here and reopen them on any device.',
        savingToAccount: 'Saving to your account…',
        savedToAccount: 'Saved to your account',
        saveError: "Couldn't save to your account",
        couldNotLoadSaved: 'Could not load this saved file.',
        unsupportedFileType: 'Unsupported file type. Use .gp, .gp3, .gp4, .gp5, .gpx, .mid, or .midi.',
        noPlayableNotes: 'No playable notes were found in this file.',
        couldNotReadGuitarPro: (message) => `Could not read this Guitar Pro file: ${message}`,
        failedToLoad: 'Failed to load this file.',
        fileSummary: (title, kind, count) => `${title} · ${kind} · ${count} notes`,
    },
    metronome: {
        start: '▶ Metronome',
        stop: '■ Stop Metronome',
        tempo: (bpm) => `Tempo: ${bpm} BPM`,
    },
    controls: {
        track: 'Track:',
        trackOption: (name, count) => `${name} (${count} notes)`,
        strictness: 'Strictness:',
        strictnessRelaxed: 'Relaxed (±300ms)',
        strictnessNormal: 'Normal (±200ms)',
        strictnessStrict: 'Strict (±120ms)',
        transpose: 'Transpose:',
        semitones: (value) => `${value} st`,
        tuning: 'Tuning',
        speed: (percent) => `Speed: ${percent}%`,
        waitModeLabel: 'Wait Mode',
        waitModeTooltip: 'Pause on each note until you play the correct pitch, no rhythm penalty.',
        loopLabel: 'Loop',
        loopFrom: 'From',
        loopTo: 'To',
        seconds: 's',
    },
    tuningPanel: {
        instrument: 'Instrument:',
        guitar: 'Guitar',
        bass: 'Bass',
        strings: 'Strings:',
        stringNumber: (n) => `String ${n}`,
        resetToFileTuning: 'Reset to file tuning',
    },
    notation: {
        clef: 'Clef:',
        clefAuto: 'Auto',
        clefTreble: 'Treble (G)',
        clefBass: 'Bass (F)',
        showTab: 'Show Tab',
        hideTab: 'Hide Tab',
        noteLabels: 'Note Labels:',
        noteLabelsOff: 'Off',
        noteLabelsNames: 'Names',
        noteLabelsSolfege: 'Solfège',
        customTuningNotice:
            "Custom tuning changes what you play in the Piano Roll, Note Highway, and live grading, " +
            "but the Staff + Tab view still shows the file's original tuning.",
        midiNotationNotice:
            'MIDI files carry no fret/string data, so only a standard notation staff (no tab) is ' +
            'shown — note positions are quantized to a sixteenth-note grid and may not exactly ' +
            'match the original rhythm.',
        loopSelectHint: 'Click a note to mark the loop start, then click another to set the end — or drag across a range.',
        renderingNotation: 'Rendering notation…',
        renderError: (message) => `Could not render notation: ${message}`,
        fullViewEnter: '⤢ Full View',
        fullViewExit: '✕ Exit Full View',
    },
    transport: {
        start: '▶ Start',
        pause: '⏸ Pause',
        resume: '▶ Resume',
        stop: '■ Stop',
        hit: 'Hit:',
        wrong: 'Wrong:',
        missed: 'Missed:',
    },
    viz: {
        pianoRoll: 'Piano Roll',
        staff: 'Staff',
        staffAndTab: 'Staff + Tab',
        noteHighway: 'Note Highway',
        legendUpcoming: 'Upcoming',
        legendHit: 'Hit',
        legendWrong: 'Wrong note',
        legendMissed: 'Missed',
        noFrettedNotes: 'This track has no fretted note positions to display in the Note Highway.',
        switchToPianoRoll: 'Switch to Piano Roll',
        connectDevicePrompt:
            'Connect a MIDI device or microphone from the panel above for hands-on grading, or use the ' +
            'on-screen keyboard.',
    },
    report: {
        title: 'Session Report',
        shareLabel: 'Share results',
        shareText: (accuracy, hit, wrong, missed) =>
            `I just scored ${accuracy}% accuracy (${hit} hit, ${wrong} wrong, ${missed} missed) on my Play Along session in Music Theory Cheatsheet! 🎸`,
        accuracy: 'Accuracy',
        hit: 'Hit',
        wrong: 'Wrong',
        missed: 'Missed',
        extraNotes: (n) => `Extra notes played: ${n}`,
        timingOnTime: 'right on time, on average',
        timingEarly: (ms) => `${ms}ms early on average (rushing)`,
        timingLate: (ms) => `${ms}ms late on average (dragging)`,
    },
};

export const ro: PlayAlongDict = {
    intro: {
        title: 'Cântă Alături',
        description:
            'Importă un fișier Guitar Pro sau MIDI, apoi cântă-l pe claviatura ta MIDI (sau pe claviatura ' +
            'de pe ecran) în timp real. Notele sunt evaluate live pentru acuratețea înălțimii și a ritmului ' +
            'pe măsură ce cursorul avansează.',
    },
    upload: {
        loading: 'Se încarcă…',
        chooseFile: 'Alege Fișier',
        myFiles: 'Fișierele Mele',
        myFilesCount: (n) => ` (${n})`,
        noSavedFiles: 'Fișierele pe care le încarci cât timp ești conectat sunt salvate aici automat.',
        guitarPro: 'Guitar Pro',
        midi: 'MIDI',
        signInHint: 'Conectează-te pentru a salva automat fișierele încărcate aici și a le redeschide pe orice dispozitiv.',
        savingToAccount: 'Se salvează în contul tău…',
        savedToAccount: 'Salvat în contul tău',
        saveError: 'Nu s-a putut salva în contul tău',
        couldNotLoadSaved: 'Nu s-a putut încărca acest fișier salvat.',
        unsupportedFileType: 'Tip de fișier neacceptat. Folosește .gp, .gp3, .gp4, .gp5, .gpx, .mid sau .midi.',
        noPlayableNotes: 'Nu au fost găsite note redabile în acest fișier.',
        couldNotReadGuitarPro: (message) => `Nu s-a putut citi acest fișier Guitar Pro: ${message}`,
        failedToLoad: 'Încărcarea acestui fișier a eșuat.',
        fileSummary: (title, kind, count) => `${title} · ${kind} · ${count} note`,
    },
    metronome: {
        start: '▶ Metronom',
        stop: '■ Oprește Metronomul',
        tempo: (bpm) => `Tempo: ${bpm} BPM`,
    },
    controls: {
        track: 'Pistă:',
        trackOption: (name, count) => `${name} (${count} note)`,
        strictness: 'Exigență:',
        strictnessRelaxed: 'Relaxat (±300ms)',
        strictnessNormal: 'Normal (±200ms)',
        strictnessStrict: 'Strict (±120ms)',
        transpose: 'Transpune:',
        semitones: (value) => `${value} semit.`,
        tuning: 'Acordaj',
        speed: (percent) => `Viteză: ${percent}%`,
        waitModeLabel: 'Mod Așteptare',
        waitModeTooltip: 'Pune pauză la fiecare notă până cânți înălțimea corectă, fără penalizare de ritm.',
        loopLabel: 'Buclă',
        loopFrom: 'De la',
        loopTo: 'Până la',
        seconds: 's',
    },
    tuningPanel: {
        instrument: 'Instrument:',
        guitar: 'Chitară',
        bass: 'Bas',
        strings: 'Corzi:',
        stringNumber: (n) => `Coarda ${n}`,
        resetToFileTuning: 'Revino la acordajul fișierului',
    },
    notation: {
        clef: 'Cheie:',
        clefAuto: 'Automat',
        clefTreble: 'Sol (G)',
        clefBass: 'Fa (F)',
        showTab: 'Arată Tabulatura',
        hideTab: 'Ascunde Tabulatura',
        noteLabels: 'Etichete Note:',
        noteLabelsOff: 'Dezactivat',
        noteLabelsNames: 'Nume',
        noteLabelsSolfege: 'Solfegiu',
        customTuningNotice:
            'Acordajul personalizat schimbă ce cânți în Pian Defilant, Culoarul de Note și evaluarea live, ' +
            'dar vizualizarea Portativ + Tabulatură arată în continuare acordajul original al fișierului.',
        midiNotationNotice:
            'Fișierele MIDI nu conțin date de coardă/spațiu, așa că este afișat doar un portativ standard ' +
            '(fără tabulatură) — pozițiile notelor sunt cuantizate la o grilă de șaisprezecimi și e posibil ' +
            'să nu corespundă exact ritmului original.',
        loopSelectHint: 'Apasă pe o notă pentru a marca începutul buclei, apoi pe alta pentru a marca sfârșitul — sau trage peste un interval.',
        renderingNotation: 'Se randează notația…',
        renderError: (message) => `Notația nu a putut fi randată: ${message}`,
        fullViewEnter: '⤢ Vizualizare Completă',
        fullViewExit: '✕ Ieși din Vizualizarea Completă',
    },
    transport: {
        start: '▶ Start',
        pause: '⏸ Pauză',
        resume: '▶ Continuă',
        stop: '■ Stop',
        hit: 'Reușite:',
        wrong: 'Greșite:',
        missed: 'Ratate:',
    },
    viz: {
        pianoRoll: 'Pian Defilant',
        staff: 'Portativ',
        staffAndTab: 'Portativ + Tabulatură',
        noteHighway: 'Culoarul de Note',
        legendUpcoming: 'Următoarele',
        legendHit: 'Reușită',
        legendWrong: 'Notă greșită',
        legendMissed: 'Ratată',
        noFrettedNotes: 'Această pistă nu are poziții de coardă/spațiu de afișat în Culoarul de Note.',
        switchToPianoRoll: 'Comută la Pianul Defilant',
        connectDevicePrompt:
            'Conectează un dispozitiv MIDI sau un microfon din panoul de mai sus pentru evaluare practică, ' +
            'sau folosește claviatura de pe ecran.',
    },
    report: {
        title: 'Raport Sesiune',
        shareLabel: 'Distribuie rezultatele',
        shareText: (accuracy, hit, wrong, missed) =>
            `Tocmai am obținut ${accuracy}% acuratețe (${hit} reușite, ${wrong} greșite, ${missed} ratate) în sesiunea mea Cântă Alături din Music Theory Cheatsheet! 🎸`,
        accuracy: 'Acuratețe',
        hit: 'Reușite',
        wrong: 'Greșite',
        missed: 'Ratate',
        extraNotes: (n) => `Note suplimentare cântate: ${n}`,
        timingOnTime: 'exact la timp, în medie',
        timingEarly: (ms) => `${ms}ms mai devreme în medie (grăbit)`,
        timingLate: (ms) => `${ms}ms mai târziu în medie (întârziat)`,
    },
};
