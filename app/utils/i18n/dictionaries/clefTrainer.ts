export interface ClefTrainerDict {
    title: string;
    modes: {
        practice: string;
        speedRun: string;
        score: (correct: number, total: number) => string;
    };
    weakNotes: (count: number) => string;
    settings: {
        clef: string;
        clefOptions: { treble: string; bass: string; grand: string };
        range: string;
        rangeOptions: { staff: string; extended: string; wide: string };
        keySignatures: string;
        justC: string;
        all12Keys: string;
        noteNaming: string;
        namingOptions: { letters: string; solfegeFixed: string; solfegeMovable: string };
        answerWith: string;
        multipleChoice: string;
        playTheNote: string;
        connecting: string;
        connectMidiKeyboard: string;
    };
    sprint: {
        title: string;
        start: string;
        secondsLeft: (n: number) => string;
        correctOf: (correct: number, total: number) => string;
        endEarly: string;
        resultCorrectOf: (correct: number, total: number) => string;
        accuracyInSeconds: (pct: number, seconds: number) => string;
        newBest: string;
        runAgain: string;
        done: string;
    };
    flashcard: {
        keyMajor: (keyName: string) => string;
        trebleClefSuffix: string;
        bassClefSuffix: string;
        correct: string;
        incorrectLetters: (note: string, octave: number) => string;
        incorrectSolfege: (syllable: string, note: string, octave: number) => string;
    };
    stats: {
        noteReadingStats: (pct: string, correct: number, total: number) => string;
        hide: string;
        details: string;
        weakestNotes: string;
        notEnoughAttempts: string;
        clefNote: (clefLabel: string) => string;
        accuracyAvgMs: (pct: number, ms: number) => string;
        bestSprintResults: string;
        noTimedRuns: string;
        durationCorrect: (clefLabel: string, durationSec: number) => string;
        correctOfTotal: (correct: number, total: number) => string;
        trackingNotes: (count: number, lastPracticed: string) => string;
        resetStats: string;
        clefLabels: { treble: string; bass: string; grand: string };
        never: string;
        justNow: string;
        minutesAgo: (n: number) => string;
        hoursAgo: (n: number) => string;
        daysAgo: (n: number) => string;
    };
}

export const en: ClefTrainerDict = {
    title: 'Clef Trainer',
    modes: {
        practice: 'Practice',
        speedRun: 'Speed Run',
        score: (correct, total) => `Score: ${correct} / ${total}`,
    },
    weakNotes: (count) => `You have ${count} note${count === 1 ? '' : 's'} under 70% accuracy - see Note Reading Stats above.`,
    settings: {
        clef: 'Clef',
        clefOptions: { treble: 'Treble', bass: 'Bass', grand: 'Grand Staff' },
        range: 'Range',
        rangeOptions: { staff: 'Staff Only', extended: '+ Ledger Lines', wide: 'Wide Range' },
        keySignatures: 'Key Signatures',
        justC: 'Just C',
        all12Keys: 'All 12 Keys',
        noteNaming: 'Note Naming',
        namingOptions: { letters: 'Letters', solfegeFixed: 'Solfège (Fixed Do)', solfegeMovable: 'Solfège (Relative Do)' },
        answerWith: 'Answer With',
        multipleChoice: 'Multiple Choice',
        playTheNote: 'Play the Note',
        connecting: 'Connecting…',
        connectMidiKeyboard: 'Connect MIDI Keyboard',
    },
    sprint: {
        title: 'Speed Run',
        start: 'Start Speed Run',
        secondsLeft: (n) => `${n}s left`,
        correctOf: (correct, total) => `${correct} / ${total} correct`,
        endEarly: 'End Early',
        resultCorrectOf: (correct, total) => `${correct} / ${total} correct`,
        accuracyInSeconds: (pct, seconds) => `${pct}% accuracy in ${seconds}s`,
        newBest: 'New best!',
        runAgain: 'Run Again',
        done: 'Done',
    },
    flashcard: {
        keyMajor: (keyName) => `Key: ${keyName} major`,
        trebleClefSuffix: 'Treble clef',
        bassClefSuffix: 'Bass clef',
        correct: 'Correct!',
        incorrectLetters: (note, octave) => `Not quite — that was ${note}${octave}.`,
        incorrectSolfege: (syllable, note, octave) => `Not quite — that was ${syllable} (${note}${octave}).`,
    },
    stats: {
        noteReadingStats: (pct, correct, total) => `Note Reading Stats: ${pct} (${correct} / ${total})`,
        hide: '▲ Hide',
        details: '▼ Details',
        weakestNotes: 'Weakest Notes',
        notEnoughAttempts: 'Not enough attempts yet — practice a few notes to see your weak spots here.',
        clefNote: (clefLabel) => `${clefLabel} clef:`,
        accuracyAvgMs: (pct, ms) => `${pct}% · ${ms}ms avg`,
        bestSprintResults: 'Best Sprint Results',
        noTimedRuns: 'No timed runs yet.',
        durationCorrect: (clefLabel, durationSec) => `${clefLabel} · ${durationSec}s`,
        correctOfTotal: (correct, total) => `${correct} / ${total} correct`,
        trackingNotes: (count, lastPracticed) => `Tracking ${count} distinct notes · last practiced ${lastPracticed}`,
        resetStats: 'Reset Note Reading Stats',
        clefLabels: { treble: 'Treble', bass: 'Bass', grand: 'Grand Staff' },
        never: 'Never',
        justNow: 'Just now',
        minutesAgo: (n) => `${n}m ago`,
        hoursAgo: (n) => `${n}h ago`,
        daysAgo: (n) => `${n}d ago`,
    },
};

export const ro: ClefTrainerDict = {
    title: 'Antrenor Chei',
    modes: {
        practice: 'Exersează',
        speedRun: 'Cursă Contracronometru',
        score: (correct, total) => `Scor: ${correct} / ${total}`,
    },
    weakNotes: (count) => `Ai ${count} not${count === 1 ? 'ă' : 'e'} sub 70% acuratețe - vezi Statisticile de Citire a Notelor mai sus.`,
    settings: {
        clef: 'Cheie',
        clefOptions: { treble: 'Sol', bass: 'Fa', grand: 'Portativ Dublu' },
        range: 'Interval',
        rangeOptions: { staff: 'Doar Portativ', extended: '+ Linii Suplimentare', wide: 'Interval Larg' },
        keySignatures: 'Armuri',
        justC: 'Doar Do',
        all12Keys: 'Toate cele 12 Tonalități',
        noteNaming: 'Denumire Note',
        namingOptions: { letters: 'Litere', solfegeFixed: 'Solfegiu (Do fix)', solfegeMovable: 'Solfegiu (Do mobil)' },
        answerWith: 'Răspunde Cu',
        multipleChoice: 'Variante Multiple',
        playTheNote: 'Cântă Nota',
        connecting: 'Se conectează…',
        connectMidiKeyboard: 'Conectează Claviatură MIDI',
    },
    sprint: {
        title: 'Cursă Contracronometru',
        start: 'Pornește Cursa',
        secondsLeft: (n) => `${n}s rămase`,
        correctOf: (correct, total) => `${correct} / ${total} corecte`,
        endEarly: 'Termină Mai Devreme',
        resultCorrectOf: (correct, total) => `${correct} / ${total} corecte`,
        accuracyInSeconds: (pct, seconds) => `${pct}% acuratețe în ${seconds}s`,
        newBest: 'Record nou!',
        runAgain: 'Repetă Cursa',
        done: 'Gata',
    },
    flashcard: {
        keyMajor: (keyName) => `Tonalitate: ${keyName} major`,
        trebleClefSuffix: 'cheia Sol',
        bassClefSuffix: 'cheia Fa',
        correct: 'Corect!',
        incorrectLetters: (note, octave) => `Nu chiar — era ${note}${octave}.`,
        incorrectSolfege: (syllable, note, octave) => `Nu chiar — era ${syllable} (${note}${octave}).`,
    },
    stats: {
        noteReadingStats: (pct, correct, total) => `Statistici Citire Note: ${pct} (${correct} / ${total})`,
        hide: '▲ Ascunde',
        details: '▼ Detalii',
        weakestNotes: 'Cele Mai Slabe Note',
        notEnoughAttempts: 'Nu sunt încă suficiente încercări — exersează câteva note pentru a-ți vedea punctele slabe aici.',
        clefNote: (clefLabel) => `Cheia ${clefLabel}:`,
        accuracyAvgMs: (pct, ms) => `${pct}% · ${ms}ms medie`,
        bestSprintResults: 'Cele Mai Bune Rezultate la Cursă',
        noTimedRuns: 'Nicio cursă contracronometru încă.',
        durationCorrect: (clefLabel, durationSec) => `${clefLabel} · ${durationSec}s`,
        correctOfTotal: (correct, total) => `${correct} / ${total} corecte`,
        trackingNotes: (count, lastPracticed) => `Se urmăresc ${count} note distincte · ultima exersare ${lastPracticed}`,
        resetStats: 'Resetează Statisticile de Citire a Notelor',
        clefLabels: { treble: 'Sol', bass: 'Fa', grand: 'Portativ Dublu' },
        never: 'Niciodată',
        justNow: 'Chiar acum',
        minutesAgo: (n) => `acum ${n}m`,
        hoursAgo: (n) => `acum ${n}h`,
        daysAgo: (n) => `acum ${n}z`,
    },
};
