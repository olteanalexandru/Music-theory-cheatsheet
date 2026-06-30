export interface ToolsDict {
    hub: {
        title: string;
        subtitle: string;
        fretboard: { title: string; description: string };
        circleOfFifths: { title: string; description: string };
        staff: { title: string; description: string };
        rhythm: { title: string; description: string };
        earTraining: { title: string; description: string };
        playAlong: { title: string; description: string };
        curriculum: { title: string; description: string };
    };
    circleOfFifthsPage: {
        title: string;
        subtitle: string;
    };
    clefTrainerPage: {
        title: string;
        subtitle: string;
    };
    curriculumPage: {
        title: string;
        subtitle: string;
    };
    earTrainingPage: {
        title: string;
        subtitle: string;
    };
    playAlongPage: {
        title: string;
        subtitle: string;
    };
    rhythmPage: {
        title: string;
        subtitle: string;
    };
    staffPage: {
        title: string;
        subtitle: string;
    };
    fretboardPage: {
        pageTitle: (instrument: string) => string;
        titleBass: string;
        titleGuitar: string;
        subtitle: (instrument: string) => string;
        bassWord: string;
        guitarWord: string;
        hideTheory: string;
        showTheory: string;
        patternDetails: string;
        patternInKey: (pattern: string, root: string) => string;
        relatedArpeggios: string;
        relatedModes: string;
        relatedChords: string;
        scaleModeCharacteristics: string;
        scaleModeIntro: string;
        modes: {
            ionian: string;
            dorian: string;
            phrygian: string;
            lydian: string;
            mixolydian: string;
            aeolian: string;
            locrian: string;
            harmonicMinor: string;
            melodicMinor: string;
            pentatonicMajor: string;
            pentatonicMinor: string;
            bluesScale: string;
        };
        arpeggioConstruction: string;
        arpeggioConstructionIntro: string;
        arpeggios: {
            major7: string;
            minor7: string;
            dominant7: string;
            minor7flat5: string;
            diminished7: string;
        };
        nashvilleTitle: string;
        nashvilleIntro1: string;
        nashvilleIntro2: string;
        keyExampleC: string;
        keyExampleG: string;
        keyExampleF: string;
        nashvilleIntro3: string;
        degree1: string;
        degree2: string;
        degree3: string;
        degree4: string;
        degree5: string;
        degree6: string;
        degree7: string;
        nashvilleBenefitsIntro: string;
        benefitTranspose: string;
        benefitRecognize: string;
        benefitCommunicate: string;
        nashvilleExample: string;
        patternControls: {
            patternType: string;
            rootNote: string;
            numStrings: string;
            instrument: string;
            tuning: string;
            scaleModeLabel: string;
            arpeggioTypeLabel: string;
            chordTypeLabel: string;
            displayMode: string;
            landmarkNumbers: string;
            noteSystem: string;
            selectRootForLandmarks: string;
        };
    };
    circleOfFifths: {
        title: string;
        showChords: string;
        hideChords: string;
        selectedKey: string;
        play: string;
        keySignature: string;
        relativeMinor: string;
        primaryChords: string;
        derivedChords: string;
        keyRelationships: string;
        relMoveClockwise: string;
        relMoveCounterclockwise: string;
        relInnerCircle: string;
        relAdjacentKeys: string;
        findingRelativesTitle: string;
        degree2Title: string;
        degree2Line1: string;
        degree2Line2: string;
        degree3Title: string;
        degree3Line1: string;
        degree3Line2: string;
        degree4Title: string;
        degree4Line1: string;
        degree5Title: string;
        degree5Line1: string;
        degree6Title: string;
        degree6Line1: string;
        degree6Line2: string;
        degree7Title: string;
        degree7Line1: string;
        degree7Line2: string;
        noSharpsOrFlats: string;
        sharpLabel: string;
        flatLabel: string;
    };
    staff: {
        title: string;
        displayMode: string;
        fixedDo: string;
        movableDo: (root: string) => string;
        keySignature: string;
        clef: string;
        selectKey: string;
        selectedNote: (note: string) => string;
        letterName: string;
        fixedDoLabel: string;
        movableDoLabel: (root: string) => string;
        howToUse: string;
        howToUseClick: string;
        howToUseLetterNames: string;
        howToUseLetterNamesDesc: string;
        howToUseFixedDo: string;
        howToUseFixedDoDesc: string;
        howToUseMovableDo: string;
        howToUseMovableDoDesc: string;
        noSharpsOrFlats: string;
        sharpLabel: string;
        flatLabel: string;
    };
}

export const en: ToolsDict = {
    hub: {
        title: 'Practice Tools',
        subtitle: 'Pick a tool to start practicing. Your audio and MIDI settings carry over between them.',
        fretboard: {
            title: 'Fretboard Navigator',
            description: 'Explore modes, scales, arpeggios, and chords on bass or guitar.',
        },
        circleOfFifths: {
            title: 'Circle of Fifths',
            description: 'Visualize key relationships and click around the circle to hear them.',
        },
        staff: {
            title: 'Interactive Staff',
            description: 'Read and play notes on a standard staff in any key.',
        },
        rhythm: {
            title: 'Rhythm Trainer',
            description: 'Practice reading and counting rhythmic notation.',
        },
        earTraining: {
            title: 'Ear Training',
            description: 'Drill intervals, chords, scales, and progressions by ear.',
        },
        playAlong: {
            title: 'Play Along',
            description: 'Load a MIDI or Guitar Pro file and play along with real-time feedback.',
        },
        curriculum: {
            title: 'Curriculum',
            description: 'Work through structured lessons and quizzes, from fundamentals to advanced harmony.',
        },
    },
    circleOfFifthsPage: {
        title: 'Circle of Fifths',
        subtitle: 'Click around the circle to hear and explore key relationships',
    },
    clefTrainerPage: {
        title: 'Clef Trainer',
        subtitle: 'Drill note names on the treble, bass, and grand staff with stats and speed runs',
    },
    curriculumPage: {
        title: 'Curriculum',
        subtitle: 'Structured lessons and quizzes, from fundamentals to advanced harmony',
    },
    earTrainingPage: {
        title: 'Ear Training',
        subtitle: 'Drill intervals, chords, scales, and progressions by ear',
    },
    playAlongPage: {
        title: 'Play Along',
        subtitle: 'Load a MIDI or Guitar Pro file and play along with real-time feedback',
    },
    rhythmPage: {
        title: 'Rhythm Trainer',
        subtitle: 'Practice reading and counting rhythmic notation',
    },
    staffPage: {
        title: 'Interactive Staff',
        subtitle: 'Read and play notes on a standard staff in any key',
    },
    fretboardPage: {
        pageTitle: (instrument) => `${instrument} Fretboard Navigator`,
        titleBass: 'Bass',
        titleGuitar: 'Guitar',
        subtitle: (instrument) => `Explore modes, scales, arpeggios, and chords on the ${instrument}`,
        bassWord: 'bass',
        guitarWord: 'guitar',
        hideTheory: 'Hide Theory',
        showTheory: 'Show Theory',
        patternDetails: 'Pattern Details',
        patternInKey: (pattern, root) => `${pattern} in ${root}`,
        relatedArpeggios: 'Related Arpeggios',
        relatedModes: 'Related Modes',
        relatedChords: 'Related Chords',
        scaleModeCharacteristics: 'Scale/Mode Characteristics',
        scaleModeIntro: 'Each mode has a unique character based on its intervals:',
        modes: {
            ionian: 'Ionian: Natural major scale (1 2 3 4 5 6 7)',
            dorian: 'Dorian: Minor with bright 6th (1 2 ♭3 4 5 6 ♭7)',
            phrygian: 'Phrygian: Minor with dark ♭2 (1 ♭2 ♭3 4 5 ♭6 ♭7)',
            lydian: 'Lydian: Major with bright #4 (1 2 3 #4 5 6 7)',
            mixolydian: 'Mixolydian: Major with ♭7 (1 2 3 4 5 6 ♭7)',
            aeolian: 'Aeolian: Natural minor (1 2 ♭3 4 5 ♭6 ♭7)',
            locrian: 'Locrian: Diminished (1 ♭2 ♭3 4 ♭5 ♭6 ♭7)',
            harmonicMinor: 'Harmonic Minor: Minor with raised 7th (1 2 ♭3 4 5 ♭6 7)',
            melodicMinor: 'Melodic Minor: Minor with raised 6th and 7th (1 2 ♭3 4 5 6 7)',
            pentatonicMajor: 'Pentatonic Major: Five-note major scale (1 2 3 5 6)',
            pentatonicMinor: 'Pentatonic Minor: Five-note minor scale (1 ♭3 4 5 ♭7)',
            bluesScale: 'Blues Scale: Minor pentatonic with added ♭5 (1 ♭3 4 ♭5 5 ♭7)',
        },
        arpeggioConstruction: 'Arpeggio Construction',
        arpeggioConstructionIntro: 'Common arpeggio formulas:',
        arpeggios: {
            major7: 'Major 7th: Root, Major 3rd, Perfect 5th, Major 7th',
            minor7: 'Minor 7th: Root, Minor 3rd, Perfect 5th, Minor 7th',
            dominant7: 'Dominant 7th: Root, Major 3rd, Perfect 5th, Minor 7th',
            minor7flat5: 'Minor 7th ♭5: Root, Minor 3rd, Diminished 5th, Minor 7th',
            diminished7: 'Diminished 7th: Root, Minor 3rd, Diminished 5th, Diminished 7th',
        },
        nashvilleTitle: 'Nashville Number System',
        nashvilleIntro1:
            "The Nashville Number System is a method of musical notation that represents the relationship between chords using numbers instead of traditional chord names. Each number represents a scale degree relative to the key you're in.",
        nashvilleIntro2:
            'All major scales follow the same pattern of whole steps (W) and half steps (H): W-W-H-W-W-W-H. The only difference between keys is the starting note. For example:',
        keyExampleC: 'C major: C D E F G A B (no sharps or flats)',
        keyExampleG: 'G major: G A B C D E F♯ (one sharp)',
        keyExampleF: 'F major: F G A B♭ C D E (one flat)',
        nashvilleIntro3: 'In the number system, regardless of the key, the scale degrees are always:',
        degree1: '1 - Root/Tonic',
        degree2: '2 - Second',
        degree3: '3 - Third',
        degree4: '4 - Fourth',
        degree5: '5 - Fifth',
        degree6: '6 - Sixth',
        degree7: '7 - Seventh',
        nashvilleBenefitsIntro: 'By using numbers instead of chord names, musicians can easily:',
        benefitTranspose: 'Transpose songs to any key without rewriting',
        benefitRecognize: 'Recognize chord relationships regardless of key',
        benefitCommunicate: 'Communicate chord progressions efficiently',
        nashvilleExample:
            'For example, a I-IV-V progression in C would be C-F-G, but in G it would be G-C-D. The relationship between the chords remains the same, just starting from a different root note.',
        patternControls: {
            patternType: 'Pattern Type',
            rootNote: 'Root Note',
            numStrings: 'Number of Strings',
            instrument: 'Instrument',
            tuning: 'Tuning',
            scaleModeLabel: 'Scale/Mode',
            arpeggioTypeLabel: 'Arpeggio Type',
            chordTypeLabel: 'Chord Type',
            displayMode: 'Display Mode',
            landmarkNumbers: 'Landmark Numbers',
            noteSystem: 'Note System',
            selectRootForLandmarks: 'Select a root note to see landmark numbers.',
        },
    },
    circleOfFifths: {
        title: 'Circle of Fifths',
        showChords: 'Show Chords',
        hideChords: 'Hide Chords',
        selectedKey: 'Selected Key:',
        play: '▶ Play',
        keySignature: 'Key Signature:',
        relativeMinor: 'Relative Minor:',
        primaryChords: 'Primary Chords:',
        derivedChords: 'Derived Chords',
        keyRelationships: 'Key Relationships:',
        relMoveClockwise: 'Moving clockwise: add one sharp',
        relMoveCounterclockwise: 'Moving counterclockwise: add one flat',
        relInnerCircle: 'Inner circle shows relative minor keys',
        relAdjacentKeys: 'Adjacent keys are closely related',
        findingRelativesTitle: 'Finding Relatives Using the Circle of Fifths',
        degree2Title: 'To find the 2nd degree (Dorian mode)',
        degree2Line1: 'Count 2 notes to the right.',
        degree2Line2: 'Or, look below at the note on the left.',
        degree3Title: 'To find the 3rd degree (Phrygian mode)',
        degree3Line1: 'Count 4 notes to the right.',
        degree3Line2: 'Or, look below at the note on the right.',
        degree4Title: 'To find the 4th degree (Lydian mode)',
        degree4Line1: 'Count 1 note to the left.',
        degree5Title: 'To find the 5th degree (Mixolydian mode)',
        degree5Line1: 'Count 1 note to the right.',
        degree6Title: 'To find the 6th degree (Aeolian mode/relative minor)',
        degree6Line1: 'Count 3 notes to the right.',
        degree6Line2: 'Or, look below.',
        degree7Title: 'To find the 7th degree (Locrian mode)',
        degree7Line1: 'Count 5 notes to the right.',
        degree7Line2: 'Or, look below at the note on the right.',
        noSharpsOrFlats: 'No sharps or flats',
        sharpLabel: 'sharp',
        flatLabel: 'flat',
    },
    staff: {
        title: 'Interactive Staff',
        displayMode: 'Display Mode:',
        fixedDo: 'Fixed Do (Solfège)',
        movableDo: (root) => `Movable Do (Root: ${root})`,
        keySignature: 'Key Signature',
        clef: 'Clef',
        selectKey: 'Select Key',
        selectedNote: (note) => `Selected Note: ${note}`,
        letterName: 'Letter Name',
        fixedDoLabel: 'Fixed Do (Letter + Syllable)',
        movableDoLabel: (root) => `Movable Do (Root: ${root})`,
        howToUse: 'How to use:',
        howToUseClick: 'Click on any note on the staff to select it',
        howToUseLetterNames: 'Letter Names:',
        howToUseLetterNamesDesc: 'Display traditional musical note names (C, D, E, etc.)',
        howToUseFixedDo: 'Fixed Do:',
        howToUseFixedDoDesc: 'Solfège syllables where C is always "Do"',
        howToUseMovableDo: 'Movable Do:',
        howToUseMovableDoDesc: 'Solfège syllables relative to the selected root note',
        noSharpsOrFlats: 'No sharps or flats',
        sharpLabel: 'sharp',
        flatLabel: 'flat',
    },
};

export const ro: ToolsDict = {
    hub: {
        title: 'Unelte de Exersare',
        subtitle: 'Alege o unealtă pentru a începe exersarea. Setările tale audio și MIDI rămân valabile pe toate uneltele.',
        fretboard: {
            title: 'Navigator Taste',
            description: 'Explorează moduri, game, arpegii și acorduri la bas sau chitară.',
        },
        circleOfFifths: {
            title: 'Cercul Cvintelor',
            description: 'Vizualizează relațiile dintre tonalități și apasă pe cerc pentru a le asculta.',
        },
        staff: {
            title: 'Portativ Interactiv',
            description: 'Citește și cântă note pe un portativ standard, în orice tonalitate.',
        },
        rhythm: {
            title: 'Antrenor de Ritm',
            description: 'Exersează citirea și numărarea notației ritmice.',
        },
        earTraining: {
            title: 'Antrenament Auditiv',
            description: 'Exersează recunoașterea intervalelor, acordurilor, gamelor și progresiilor după ureche.',
        },
        playAlong: {
            title: 'Cântă Alături',
            description: 'Încarcă un fișier MIDI sau Guitar Pro și cântă alături, cu feedback în timp real.',
        },
        curriculum: {
            title: 'Curriculum',
            description: 'Parcurge lecții și teste structurate, de la noțiuni de bază până la armonie avansată.',
        },
    },
    circleOfFifthsPage: {
        title: 'Cercul Cvintelor',
        subtitle: 'Apasă pe cerc pentru a asculta și explora relațiile dintre tonalități',
    },
    clefTrainerPage: {
        title: 'Antrenor Chei',
        subtitle: 'Exersează numele notelor pe cheia sol, cheia fa și portativul mare, cu statistici și probe contracronometru',
    },
    curriculumPage: {
        title: 'Curriculum',
        subtitle: 'Lecții și teste structurate, de la noțiuni de bază până la armonie avansată',
    },
    earTrainingPage: {
        title: 'Antrenament Auditiv',
        subtitle: 'Exersează recunoașterea intervalelor, acordurilor, gamelor și progresiilor după ureche',
    },
    playAlongPage: {
        title: 'Cântă Alături',
        subtitle: 'Încarcă un fișier MIDI sau Guitar Pro și cântă alături, cu feedback în timp real',
    },
    rhythmPage: {
        title: 'Antrenor de Ritm',
        subtitle: 'Exersează citirea și numărarea notației ritmice',
    },
    staffPage: {
        title: 'Portativ Interactiv',
        subtitle: 'Citește și cântă note pe un portativ standard, în orice tonalitate',
    },
    fretboardPage: {
        pageTitle: (instrument) => `Navigator Taste pentru ${instrument}`,
        titleBass: 'Bas',
        titleGuitar: 'Chitară',
        subtitle: (instrument) => `Explorează moduri, game, arpegii și acorduri la ${instrument}`,
        bassWord: 'bas',
        guitarWord: 'chitară',
        hideTheory: 'Ascunde Teoria',
        showTheory: 'Arată Teoria',
        patternDetails: 'Detalii Pattern',
        patternInKey: (pattern, root) => `${pattern} în ${root}`,
        relatedArpeggios: 'Arpegii Asociate',
        relatedModes: 'Moduri Asociate',
        relatedChords: 'Acorduri Asociate',
        scaleModeCharacteristics: 'Caracteristici Game/Moduri',
        scaleModeIntro: 'Fiecare mod are un caracter unic, dat de intervalele sale:',
        modes: {
            ionian: 'Ionian: Gama majoră naturală (1 2 3 4 5 6 7)',
            dorian: 'Dorian: Minor cu treapta 6 luminoasă (1 2 ♭3 4 5 6 ♭7)',
            phrygian: 'Frigian: Minor cu treapta ♭2 întunecată (1 ♭2 ♭3 4 5 ♭6 ♭7)',
            lydian: 'Lidian: Major cu treapta #4 luminoasă (1 2 3 #4 5 6 7)',
            mixolydian: 'Mixolidian: Major cu ♭7 (1 2 3 4 5 6 ♭7)',
            aeolian: 'Eolian: Minor natural (1 2 ♭3 4 5 ♭6 ♭7)',
            locrian: 'Locrian: Diminuat (1 ♭2 ♭3 4 ♭5 ♭6 ♭7)',
            harmonicMinor: 'Minor Armonic: Minor cu treapta 7 ridicată (1 2 ♭3 4 5 ♭6 7)',
            melodicMinor: 'Minor Melodic: Minor cu treptele 6 și 7 ridicate (1 2 ♭3 4 5 6 7)',
            pentatonicMajor: 'Pentatonică Majoră: Gamă majoră de cinci note (1 2 3 5 6)',
            pentatonicMinor: 'Pentatonică Minoră: Gamă minoră de cinci note (1 ♭3 4 5 ♭7)',
            bluesScale: 'Gama Blues: Pentatonică minoră cu ♭5 adăugat (1 ♭3 4 ♭5 5 ♭7)',
        },
        arpeggioConstruction: 'Construcția Arpegiilor',
        arpeggioConstructionIntro: 'Formule comune de arpegii:',
        arpeggios: {
            major7: 'Major 7: Fundamentală, terță mare, cvintă justă, septimă mare',
            minor7: 'Minor 7: Fundamentală, terță mică, cvintă justă, septimă mică',
            dominant7: 'Dominant 7: Fundamentală, terță mare, cvintă justă, septimă mică',
            minor7flat5: 'Minor 7 ♭5: Fundamentală, terță mică, cvintă diminuată, septimă mică',
            diminished7: 'Diminuat 7: Fundamentală, terță mică, cvintă diminuată, septimă diminuată',
        },
        nashvilleTitle: 'Sistemul Numeric Nashville',
        nashvilleIntro1:
            'Sistemul Numeric Nashville este o metodă de notație muzicală care reprezintă relația dintre acorduri folosind numere în loc de denumiri tradiționale de acorduri. Fiecare număr reprezintă o treaptă a gamei, relativă la tonalitatea în care te afli.',
        nashvilleIntro2:
            'Toate gamele majore urmează același tipar de tonuri (T) și semitonuri (S): T-T-S-T-T-T-S. Singura diferență dintre tonalități este nota de start. De exemplu:',
        keyExampleC: 'Do major: C D E F G A B (fără diezi sau bemoli)',
        keyExampleG: 'Sol major: G A B C D E F♯ (un diez)',
        keyExampleF: 'Fa major: F G A B♭ C D E (un bemol)',
        nashvilleIntro3: 'În sistemul numeric, indiferent de tonalitate, treptele gamei sunt mereu:',
        degree1: '1 - Tonică',
        degree2: '2 - Treapta a doua',
        degree3: '3 - Treapta a treia',
        degree4: '4 - Treapta a patra',
        degree5: '5 - Treapta a cincea',
        degree6: '6 - Treapta a șasea',
        degree7: '7 - Treapta a șaptea',
        nashvilleBenefitsIntro: 'Folosind numere în loc de denumiri de acorduri, muzicienii pot cu ușurință:',
        benefitTranspose: 'Să transpună piese în orice tonalitate fără a le rescrie',
        benefitRecognize: 'Să recunoască relațiile dintre acorduri indiferent de tonalitate',
        benefitCommunicate: 'Să comunice eficient progresiile de acorduri',
        nashvilleExample:
            'De exemplu, o progresie I-IV-V în Do ar fi C-F-G, dar în Sol ar fi G-C-D. Relația dintre acorduri rămâne aceeași, doar punctul de plecare diferă.',
        patternControls: {
            patternType: 'Tip Pattern',
            rootNote: 'Notă Fundamentală',
            numStrings: 'Număr de Corzi',
            instrument: 'Instrument',
            tuning: 'Acordaj',
            scaleModeLabel: 'Gamă/Mod',
            arpeggioTypeLabel: 'Tip Arpegiu',
            chordTypeLabel: 'Tip Acord',
            displayMode: 'Mod de Afișare',
            landmarkNumbers: 'Numere de Reper',
            noteSystem: 'Sistem de Note',
            selectRootForLandmarks: 'Selectează o notă fundamentală pentru a vedea numerele de reper.',
        },
    },
    circleOfFifths: {
        title: 'Cercul Cvintelor',
        showChords: 'Arată Acordurile',
        hideChords: 'Ascunde Acordurile',
        selectedKey: 'Tonalitate selectată:',
        play: '▶ Redă',
        keySignature: 'Armură:',
        relativeMinor: 'Relativă minoră:',
        primaryChords: 'Acorduri Principale:',
        derivedChords: 'Acorduri Derivate',
        keyRelationships: 'Relații între Tonalități:',
        relMoveClockwise: 'Deplasare în sensul acelor de ceasornic: se adaugă un diez',
        relMoveCounterclockwise: 'Deplasare în sens invers acelor de ceasornic: se adaugă un bemol',
        relInnerCircle: 'Cercul interior arată tonalitățile relative minore',
        relAdjacentKeys: 'Tonalitățile vecine sunt strâns înrudite',
        findingRelativesTitle: 'Găsirea Relativelor Folosind Cercul Cvintelor',
        degree2Title: 'Pentru a găsi treapta a 2-a (modul dorian)',
        degree2Line1: 'Numără 2 note spre dreapta.',
        degree2Line2: 'Sau, privește mai jos nota din stânga.',
        degree3Title: 'Pentru a găsi treapta a 3-a (modul frigian)',
        degree3Line1: 'Numără 4 note spre dreapta.',
        degree3Line2: 'Sau, privește mai jos nota din dreapta.',
        degree4Title: 'Pentru a găsi treapta a 4-a (modul lidian)',
        degree4Line1: 'Numără 1 notă spre stânga.',
        degree5Title: 'Pentru a găsi treapta a 5-a (modul mixolidian)',
        degree5Line1: 'Numără 1 notă spre dreapta.',
        degree6Title: 'Pentru a găsi treapta a 6-a (modul eolian/relativa minoră)',
        degree6Line1: 'Numără 3 note spre dreapta.',
        degree6Line2: 'Sau, privește mai jos.',
        degree7Title: 'Pentru a găsi treapta a 7-a (modul locrian)',
        degree7Line1: 'Numără 5 note spre dreapta.',
        degree7Line2: 'Sau, privește mai jos nota din dreapta.',
        noSharpsOrFlats: 'Fără diezi sau bemoli',
        sharpLabel: 'diez',
        flatLabel: 'bemol',
    },
    staff: {
        title: 'Portativ Interactiv',
        displayMode: 'Mod de Afișare:',
        fixedDo: 'Do Fix (Solfegiu)',
        movableDo: (root) => `Do Mobil (Tonică: ${root})`,
        keySignature: 'Armură',
        clef: 'Cheie',
        selectKey: 'Selectează Tonalitatea',
        selectedNote: (note) => `Nota selectată: ${note}`,
        letterName: 'Nume de Literă',
        fixedDoLabel: 'Do Fix (Literă + Silabă)',
        movableDoLabel: (root) => `Do Mobil (Tonică: ${root})`,
        howToUse: 'Cum se folosește:',
        howToUseClick: 'Apasă pe orice notă de pe portativ pentru a o selecta',
        howToUseLetterNames: 'Nume de Literă:',
        howToUseLetterNamesDesc: 'Afișează numele tradiționale ale notelor (C, D, E etc.)',
        howToUseFixedDo: 'Do Fix:',
        howToUseFixedDoDesc: 'Silabe de solfegiu în care C este mereu „Do”',
        howToUseMovableDo: 'Do Mobil:',
        howToUseMovableDoDesc: 'Silabe de solfegiu relative la tonica selectată',
        noSharpsOrFlats: 'Fără diezi sau bemoli',
        sharpLabel: 'diez',
        flatLabel: 'bemol',
    },
};
