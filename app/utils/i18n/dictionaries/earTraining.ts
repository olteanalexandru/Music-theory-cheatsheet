export interface EarTrainingDict {
    title: string;
    categories: {
        intervals: string;
        chords: string;
        scales: string;
        notes: string;
        keysig: string;
        guitar: string;
        rhythm: string;
        progressions: string;
    };
    difficulty: {
        label: string;
        easy: string;
        medium: string;
        hard: string;
        expert: string;
    };
    session: {
        weakAreasReview: string;
        practiceSession: string;
        length: string;
        mixAllCategories: string;
        startSession: string;
        sessionComplete: (correct: number, total: number, percent: number) => string;
        missed: string;
        missedItem: (categoryLabel: string, correctAnswer: string) => string;
        perfectScore: string;
        startNewSession: string;
        backToFreePractice: string;
        questionProgress: (index: number, length: number, correct: number) => string;
        endSession: string;
    };
    answerMode: {
        answerWith: string;
        multipleChoice: string;
        midiKeyboard: string;
    };
    notes: {
        clef: string;
        range: string;
        rangeStaffOnly: string;
        rangeExtended: string;
        rangeWide: string;
        keySignatures: string;
        keyMajor: (keyName: string) => string;
    };
    guitar: {
        standardTuning: string;
    };
    keysig: {
        howManyAccidentals: string;
        noSharpsOrFlats: string;
        sharp: string;
        sharps: string;
        flat: string;
        flats: string;
        modeMajor: string;
        modeMinor: string;
    };
    rhythm: {
        timeLabel: (label: string) => string;
        listenAndPick: string;
    };
    progressions: {
        keyMajor: (keyName: string) => string;
        listenAndIdentify: string;
    };
    midi: {
        connectMidiDevice: string;
        requestingAccess: string;
        midiUnsupported: string;
        midiDenied: string;
        orClickKeys: string;
        device: string;
        allDevices: string;
        noMidiDevices: string;
        currentlyHeld: (notes: string) => string;
        currentlyHeldNone: string;
    };
    controls: {
        play: string;
        newQuestion: string;
        score: (correct: number, total: number) => string;
        checkMyAnswer: string;
        answer: (value: string) => string;
    };
    feedback: {
        correct: string;
        incorrect: (correctAnswer: string) => string;
        learn: string;
    };
}

export const en: EarTrainingDict = {
    title: 'Ear Training',
    categories: {
        intervals: 'Intervals',
        chords: 'Chords',
        scales: 'Scales',
        notes: 'Notes on Staff',
        keysig: 'Key Signatures',
        guitar: 'Guitar Fretboard',
        rhythm: 'Rhythm',
        progressions: 'Chord Progressions',
    },
    difficulty: {
        label: 'Difficulty:',
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard',
        expert: 'Expert',
    },
    session: {
        weakAreasReview: 'Weak Areas Review',
        practiceSession: 'Practice Session',
        length: 'Length:',
        mixAllCategories: 'Mix all categories',
        startSession: 'Start Session',
        sessionComplete: (correct, total, percent) => `Session complete: ${correct} / ${total} correct (${percent}%)`,
        missed: 'Missed:',
        missedItem: (categoryLabel, correctAnswer) => `${categoryLabel}: ${correctAnswer}`,
        perfectScore: 'Perfect score — no missed questions!',
        startNewSession: 'Start New Session',
        backToFreePractice: 'Back to Free Practice',
        questionProgress: (index, length, correct) => `Question ${index} / ${length} · ${correct} correct`,
        endSession: 'End Session',
    },
    answerMode: {
        answerWith: 'Answer with:',
        multipleChoice: 'Multiple Choice',
        midiKeyboard: 'MIDI Keyboard',
    },
    notes: {
        clef: 'Clef:',
        range: 'Range:',
        rangeStaffOnly: 'Staff Only',
        rangeExtended: '+ Ledger Lines',
        rangeWide: 'Wide Range',
        keySignatures: 'Key signatures (select one or more):',
        keyMajor: (keyName) => `Key: ${keyName} major`,
    },
    guitar: {
        standardTuning: 'Standard tuning',
    },
    keysig: {
        howManyAccidentals: 'How many sharps or flats does this key signature have?',
        noSharpsOrFlats: 'No sharps or flats',
        sharp: 'sharp',
        sharps: 'sharps',
        flat: 'flat',
        flats: 'flats',
        modeMajor: 'major',
        modeMinor: 'minor',
    },
    rhythm: {
        timeLabel: (label) => `${label} time`,
        listenAndPick: 'Listen and pick the rhythm pattern you heard.',
    },
    progressions: {
        keyMajor: (keyName) => `Key: ${keyName} major`,
        listenAndIdentify: 'Listen and identify the chord progression (Roman numeral analysis).',
    },
    midi: {
        connectMidiDevice: 'Connect MIDI Device',
        requestingAccess: 'Requesting access…',
        midiUnsupported: "Web MIDI isn't supported in this browser. Try Chrome or Edge.",
        midiDenied: 'MIDI access was denied.',
        orClickKeys: 'Or just click the keys below.',
        device: 'Device:',
        allDevices: 'All devices',
        noMidiDevices: 'No MIDI devices detected.',
        currentlyHeld: (notes) => `Currently held: ${notes}`,
        currentlyHeldNone: '—',
    },
    controls: {
        play: '▶ Play',
        newQuestion: 'New Question',
        score: (correct, total) => `Score: ${correct} / ${total}`,
        checkMyAnswer: 'Check My Answer',
        answer: (value) => `Answer: ${value}`,
    },
    feedback: {
        correct: 'Correct!',
        incorrect: (correctAnswer) => `Not quite — it was ${correctAnswer}.`,
        learn: 'Learn',
    },
};

export const ro: EarTrainingDict = {
    title: 'Antrenament Auditiv',
    categories: {
        intervals: 'Intervale',
        chords: 'Acorduri',
        scales: 'Game',
        notes: 'Note pe Portativ',
        keysig: 'Armuri',
        guitar: 'Tastatură Chitară',
        rhythm: 'Ritm',
        progressions: 'Progresii de Acorduri',
    },
    difficulty: {
        label: 'Dificultate:',
        easy: 'Ușor',
        medium: 'Mediu',
        hard: 'Greu',
        expert: 'Expert',
    },
    session: {
        weakAreasReview: 'Recapitulare Puncte Slabe',
        practiceSession: 'Sesiune de Exersare',
        length: 'Lungime:',
        mixAllCategories: 'Amestecă toate categoriile',
        startSession: 'Începe Sesiunea',
        sessionComplete: (correct, total, percent) => `Sesiune încheiată: ${correct} / ${total} corecte (${percent}%)`,
        missed: 'Greșite:',
        missedItem: (categoryLabel, correctAnswer) => `${categoryLabel}: ${correctAnswer}`,
        perfectScore: 'Punctaj perfect — nicio întrebare greșită!',
        startNewSession: 'Începe o Sesiune Nouă',
        backToFreePractice: 'Înapoi la exersare liberă',
        questionProgress: (index, length, correct) => `Întrebarea ${index} / ${length} · ${correct} corecte`,
        endSession: 'Încheie Sesiunea',
    },
    answerMode: {
        answerWith: 'Răspunde cu:',
        multipleChoice: 'Variante Multiple',
        midiKeyboard: 'Claviatură MIDI',
    },
    notes: {
        clef: 'Cheie:',
        range: 'Interval:',
        rangeStaffOnly: 'Doar Portativ',
        rangeExtended: '+ Linii Suplimentare',
        rangeWide: 'Interval Larg',
        keySignatures: 'Armuri (selectează una sau mai multe):',
        keyMajor: (keyName) => `Tonalitate: ${keyName} major`,
    },
    guitar: {
        standardTuning: 'Acordaj standard',
    },
    keysig: {
        howManyAccidentals: 'Câte diezi sau bemoli are această armură?',
        noSharpsOrFlats: 'Fără diezi sau bemoli',
        sharp: 'diez',
        sharps: 'diezi',
        flat: 'bemol',
        flats: 'bemoli',
        modeMajor: 'major',
        modeMinor: 'minor',
    },
    rhythm: {
        timeLabel: (label) => `Măsură ${label}`,
        listenAndPick: 'Ascultă și alege tiparul ritmic auzit.',
    },
    progressions: {
        keyMajor: (keyName) => `Tonalitate: ${keyName} major`,
        listenAndIdentify: 'Ascultă și identifică progresia de acorduri (analiză în cifre romane).',
    },
    midi: {
        connectMidiDevice: 'Conectează Dispozitiv MIDI',
        requestingAccess: 'Se solicită accesul…',
        midiUnsupported: 'Web MIDI nu este acceptat în acest browser. Încearcă Chrome sau Edge.',
        midiDenied: 'Accesul MIDI a fost refuzat.',
        orClickKeys: 'Sau apasă pe clapele de mai jos.',
        device: 'Dispozitiv:',
        allDevices: 'Toate dispozitivele',
        noMidiDevices: 'Niciun dispozitiv MIDI detectat.',
        currentlyHeld: (notes) => `Apăsate acum: ${notes}`,
        currentlyHeldNone: '—',
    },
    controls: {
        play: '▶ Redă',
        newQuestion: 'Întrebare Nouă',
        score: (correct, total) => `Scor: ${correct} / ${total}`,
        checkMyAnswer: 'Verifică Răspunsul',
        answer: (value) => `Răspuns: ${value}`,
    },
    feedback: {
        correct: 'Corect!',
        incorrect: (correctAnswer) => `Nu chiar — era ${correctAnswer}.`,
        learn: 'Detalii',
    },
};
