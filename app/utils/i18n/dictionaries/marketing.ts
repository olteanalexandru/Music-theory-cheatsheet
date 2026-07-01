export interface MarketingDict {
    home: {
        heroEyebrow: string;
        heroTitleLine1: string;
        heroTitleLine2Prefix: string;
        heroTitleHighlight: string;
        heroSubtitle: string;
        openApp: string;
        seeEveryFeature: string;
        heroImageAlt: string;
        stats: {
            tools: string;
            formats: string;
            signups: string;
        };
        featureRows: {
            fretboard: { eyebrow: string; title: string; description: string; imageAlt: string };
            earTraining: { eyebrow: string; title: string; description: string; imageAlt: string };
            progress: { eyebrow: string; title: string; description: string; imageAlt: string };
        };
        communityEyebrow: string;
        communityTitle: string;
        communityDescription: string;
        moreOnCommunity: string;
        leaderboardImageAlt: string;
        ctaTitle: string;
    };
    features: {
        eyebrow: string;
        title: string;
        subtitle: string;
        openApp: string;
        rows: {
            fretboard: { eyebrow: string; title: string; description: string; imageAlt: string };
            circleOfFifths: { eyebrow: string; title: string; description: string; imageAlt: string };
            staff: { eyebrow: string; title: string; description: string; imageAlt: string };
            rhythm: { eyebrow: string; title: string; description: string; imageAlt: string };
            earTraining: { eyebrow: string; title: string; description: string; imageAlt: string };
            curriculum: { eyebrow: string; title: string; description: string; imageAlt: string };
            playAlong: { eyebrow: string; title: string; description: string; imageAlt: string };
            progress: { eyebrow: string; title: string; description: string; imageAlt: string };
        };
        ctaTitle: string;
        openAppLarge: string;
    };
    community: {
        eyebrow: string;
        title: string;
        subtitle: string;
        openApp: string;
        seeEveryFeature: string;
        leaderboardEyebrow: string;
        leaderboardTitle: string;
        leaderboardDescription: string;
        leaderboardImageAlt: string;
        pillars: {
            profiles: { title: string; description: string };
            follow: { title: string; description: string };
            share: { title: string; description: string };
        };
        ctaTitle: string;
        viewLeaderboard: string;
        openApp2: string;
    };
}

export const en: MarketingDict = {
    home: {
        heroEyebrow: 'Fretboard · Ear training · Notation · Curriculum',
        heroTitleLine1: 'Music theory',
        heroTitleLine2Prefix: 'you can',
        heroTitleHighlight: 'actually play.',
        heroSubtitle:
            'An interactive fretboard, ear trainer, and play-along tool for guitar and bass — built so the theory sticks because your hands learned it, not because you memorized a chart.',
        openApp: 'Open the app',
        seeEveryFeature: 'See every feature',
        heroImageAlt: 'The Music Theory practice app: fretboard navigator, gamification panel, and navigation',
        stats: {
            tools: 'Practice tools, one app',
            formats: 'File formats Play Along reads — MIDI & Guitar Pro',
            signups: 'Signups needed to start practicing',
        },
        featureRows: {
            fretboard: {
                eyebrow: 'Fretboard Navigator',
                title: 'See the scale before you play a note.',
                description:
                    'Pick a root, a mode, a tuning. The fretboard lights up across as many strings and frets as your instrument has — guitar, bass, anything in between.',
                imageAlt: 'Fretboard Navigator showing a C Ionian scale pattern across a 4-string bass',
            },
            earTraining: {
                eyebrow: 'Ear Training',
                title: "Train the part theory can't teach.",
                description:
                    'Intervals, chords, scales, rhythm, key signatures, even fretboard recognition — drilled against a real synth engine, not a folder of static audio clips.',
                imageAlt: 'Ear training drill categories, difficulty controls, and a practice session',
            },
            progress: {
                eyebrow: 'Progress & Achievements',
                title: 'Practice that keeps score.',
                description:
                    'XP, levels, and achievements track every session automatically. Share a progress card with one tap, or just watch the level counter move.',
                imageAlt: 'Level, XP bar, and achievements panel',
            },
        },
        communityEyebrow: 'Community',
        communityTitle: "Practice sticks when it's social.",
        communityDescription:
            'Build a public profile, follow other musicians, and compare levels and streaks on the leaderboard. Practicing alone is optional, not required.',
        moreOnCommunity: 'More on community',
        leaderboardImageAlt: 'Leaderboard page with Global and Friends toggle',
        ctaTitle: 'Pick a root note. Start playing.',
    },
    features: {
        eyebrow: 'Features',
        title: 'One app. Every angle on music theory.',
        subtitle:
            'Fretboard, ear, staff, rhythm, and a curriculum that ties them together — built so you practice instead of just reading.',
        openApp: 'Open the app',
        rows: {
            fretboard: {
                eyebrow: 'Fretboard Navigator',
                title: 'Every scale, every shape, every tuning.',
                description:
                    'Pick a root and a mode and the whole fretboard lights up — scales, arpeggios, and chords, in landmark numbers or note names. Works across 4, 5, and 6-string basses and any guitar tuning you throw at it.',
                imageAlt: 'Fretboard Navigator showing a C Ionian scale pattern across a 4-string bass',
            },
            circleOfFifths: {
                eyebrow: 'Circle of Fifths',
                title: 'Key relationships you can click, not just memorize.',
                description:
                    'See how every key connects to its neighbors. Click around the wheel to hear scale degrees and chords through the built-in synth — toggle chord mode to study harmonic relationships at a glance.',
                imageAlt: 'Circle of Fifths diagram with chord mode enabled',
            },
            staff: {
                eyebrow: 'Interactive Staff',
                title: 'Standard notation that talks back.',
                description:
                    'Switch between treble and bass clef, click any note on the staff to hear it, and overlay note names or solfège so reading music stops feeling like decoding.',
                imageAlt: 'Interactive staff notation component with clef toggle',
            },
            rhythm: {
                eyebrow: 'Rhythm',
                title: 'Counting, made audible.',
                description:
                    'Note and rest durations, time signatures, and a built-in metronome — set a tempo and feel where the beat actually falls instead of just naming it on a worksheet.',
                imageAlt: 'Rhythm trainer showing note durations, time signatures, and metronome controls',
            },
            earTraining: {
                eyebrow: 'Ear Training',
                title: "Train the part theory can't teach.",
                description:
                    'Intervals, chords, scales, rhythm, key signatures, guitar fretboard recognition, even chord progressions — eight drill categories and three difficulty levels. Answer by clicking, on a MIDI keyboard, or wired in over Web MIDI.',
                imageAlt: 'Ear training drill categories, difficulty controls, and a practice session',
            },
            curriculum: {
                eyebrow: 'Curriculum',
                title: 'A syllabus, not just a sandbox.',
                description:
                    'Structured units walk from pitch and intervals through key signatures, chords, and rhythm, each ending in a quiz. Weak-area review surfaces the categories your ear-training stats say need more work.',
                imageAlt: 'Curriculum units list with a lesson open and quiz progress',
            },
            playAlong: {
                eyebrow: 'Play Along',
                title: 'Drop in a song, get real-time feedback.',
                description:
                    'Upload a MIDI or Guitar Pro file and practice against staff-and-tab notation or a scrolling note highway. Wait Mode pauses for you to play the right note, loop any section, and transpose or re-tune on the fly.',
                imageAlt: 'Play Along file upload panel',
            },
            progress: {
                eyebrow: 'Progress & Achievements',
                title: 'Every session adds up.',
                description:
                    'XP and levels track total practice, streaks track consistency, and achievements unlock on real milestones — lessons completed, accuracy hit, not vanity badges. Share a progress card with one tap.',
                imageAlt: 'Level, XP bar, and achievements panel',
            },
        },
        ctaTitle: 'Pick a root note. Start playing.',
        openAppLarge: 'Open the app',
    },
    community: {
        eyebrow: 'Community',
        title: 'Practicing alone is optional, not required.',
        subtitle:
            'Build a public profile, follow other musicians, and see where you land on the leaderboard. It all runs on the same XP and achievements your practice already earns — no separate point system to game.',
        openApp: 'Open the app',
        seeEveryFeature: 'See every feature',
        leaderboardEyebrow: 'Leaderboard',
        leaderboardTitle: 'Global, or just the people you follow.',
        leaderboardDescription:
            'Toggle between everyone with a public profile and the musicians you follow. Ranked by level and XP, pulled straight from real practice — no leaderboard padding.',
        leaderboardImageAlt: 'Leaderboard page with Global and Friends toggle',
        pillars: {
            profiles: {
                title: 'Public profiles',
                description:
                    "A username, a bio, your level and achievements. Keep it public for the leaderboard, or private if you'd rather practice without an audience.",
            },
            follow: {
                title: 'Follow other musicians',
                description:
                    'Follow players whose progress you want to track. Their rank, streaks, and level show up wherever yours does — starting with your friends leaderboard.',
            },
            share: {
                title: 'Share progress cards',
                description:
                    "One tap turns your level, XP, and recent achievements into an image — share it, don't just talk about it.",
            },
        },
        ctaTitle: 'Find out where you rank.',
        viewLeaderboard: 'View the leaderboard',
        openApp2: 'Open the app',
    },
};

export const ro: MarketingDict = {
    home: {
        heroEyebrow: 'Tastatură chitară · Antrenament auditiv · Notație · Curriculum',
        heroTitleLine1: 'Teorie muzicală',
        heroTitleLine2Prefix: 'pe care chiar',
        heroTitleHighlight: 'o poți cânta.',
        heroSubtitle:
            'O tastatură interactivă, un antrenor auditiv și un instrument de cântat alături, pentru chitară și bas — construite ca teoria să rămână, pentru că au învățat-o mâinile tale, nu pentru că ai memorat o schemă.',
        openApp: 'Deschide aplicația',
        seeEveryFeature: 'Vezi toate funcționalitățile',
        heroImageAlt: 'Aplicația de exersat Teoria Muzicii: navigator tastatură, panou de gamificare și navigare',
        stats: {
            tools: 'Instrumente de exersat, o singură aplicație',
            formats: 'Formate de fișier citite de Cântă Alături — MIDI și Guitar Pro',
            signups: 'Înregistrări necesare ca să începi să exersezi',
        },
        featureRows: {
            fretboard: {
                eyebrow: 'Navigator Tastatură',
                title: 'Vezi gama înainte să cânți o notă.',
                description:
                    'Alege o tonică, un mod, un acordaj. Tastatura se aprinde pe câte corzi și frete are instrumentul tău — chitară, bas, orice între ele.',
                imageAlt: 'Navigatorul de tastatură arătând un model de gamă Do Ionian pe un bas cu 4 corzi',
            },
            earTraining: {
                eyebrow: 'Antrenament Auditiv',
                title: 'Exersează partea pe care teoria n-o poate preda.',
                description:
                    'Intervale, acorduri, game, ritm, armuri, chiar și recunoașterea tastaturii — exersate cu un sintetizator real, nu cu un folder de clipuri audio statice.',
                imageAlt: 'Categorii de exerciții auditive, controale de dificultate și o sesiune de exersare',
            },
            progress: {
                eyebrow: 'Progres și Realizări',
                title: 'Exersare care ține scorul.',
                description:
                    'XP, niveluri și realizări urmăresc automat fiecare sesiune. Distribuie un card de progres dintr-o atingere sau privește pur și simplu cum urcă nivelul.',
                imageAlt: 'Nivel, bară de XP și panou de realizări',
            },
        },
        communityEyebrow: 'Comunitate',
        communityTitle: 'Exersarea prinde rădăcini când e socială.',
        communityDescription:
            'Construiește-ți un profil public, urmărește alți muzicieni și compară niveluri și serii pe clasament. Exersarea solitară e opțională, nu obligatorie.',
        moreOnCommunity: 'Mai multe despre comunitate',
        leaderboardImageAlt: 'Pagina de clasament cu comutator Global și Prieteni',
        ctaTitle: 'Alege o tonică. Începe să cânți.',
    },
    features: {
        eyebrow: 'Funcționalități',
        title: 'O aplicație. Toate unghiurile teoriei muzicale.',
        subtitle:
            'Tastatură, ureche, portativ, ritm și un curriculum care le leagă pe toate — construite ca să exersezi, nu doar să citești.',
        openApp: 'Deschide aplicația',
        rows: {
            fretboard: {
                eyebrow: 'Navigator Tastatură',
                title: 'Fiecare gamă, fiecare formă, fiecare acordaj.',
                description:
                    'Alege o tonică și un mod și toată tastatura se aprinde — game, arpegii și acorduri, în numere de reper sau nume de note. Funcționează pe basuri cu 4, 5 și 6 corzi și pe orice acordaj de chitară îi arunci.',
                imageAlt: 'Navigatorul de tastatură arătând un model de gamă Do Ionian pe un bas cu 4 corzi',
            },
            circleOfFifths: {
                eyebrow: 'Cercul Cvintelor',
                title: 'Relații între tonalități pe care le poți apăsa, nu doar memora.',
                description:
                    'Vezi cum se leagă fiecare tonalitate de vecinele ei. Apasă pe roată ca să auzi treptele gamei și acordurile prin sintetizatorul integrat — comută modul acorduri ca să studiezi relațiile armonice dintr-o privire.',
                imageAlt: 'Diagrama Cercului Cvintelor cu modul acorduri activat',
            },
            staff: {
                eyebrow: 'Portativ Interactiv',
                title: 'Notație standard care îți răspunde.',
                description:
                    'Comută între cheia sol și cheia fa, apasă orice notă de pe portativ ca s-o auzi și suprapune nume de note sau solfegiu, ca citirea muzicii să nu mai pară decodare.',
                imageAlt: 'Componenta de portativ interactiv cu comutator de cheie',
            },
            rhythm: {
                eyebrow: 'Ritm',
                title: 'Numărătoarea, făcută audibilă.',
                description:
                    'Durate de note și pauze, măsuri și un metronom integrat — setează un tempo și simte unde cade cu adevărat timpul, nu doar să-l numești pe o fișă de lucru.',
                imageAlt: 'Antrenor de ritm arătând durate de note, măsuri și controale de metronom',
            },
            earTraining: {
                eyebrow: 'Antrenament Auditiv',
                title: 'Exersează partea pe care teoria n-o poate preda.',
                description:
                    'Intervale, acorduri, game, ritm, armuri, recunoașterea tastaturii de chitară, chiar și progresii de acorduri — opt categorii de exerciții și trei niveluri de dificultate. Răspunde apăsând, pe o tastatură MIDI sau conectat prin Web MIDI.',
                imageAlt: 'Categorii de exerciții auditive, controale de dificultate și o sesiune de exersare',
            },
            curriculum: {
                eyebrow: 'Curriculum',
                title: 'O programă, nu doar un loc de joacă.',
                description:
                    'Unități structurate te poartă de la înălțime și intervale, prin armuri, acorduri și ritm, fiecare încheindu-se cu un test. Recapitularea punctelor slabe scoate la iveală categoriile pe care statisticile tale auditive spun că mai ai de lucru.',
                imageAlt: 'Listă de unități de curriculum cu o lecție deschisă și progres la test',
            },
            playAlong: {
                eyebrow: 'Cântă Alături',
                title: 'Încarcă o melodie, primește reacție în timp real.',
                description:
                    'Încarcă un fișier MIDI sau Guitar Pro și exersează pe notație de portativ și tabulatură sau pe o autostradă de note derulantă. Modul Așteptare se oprește până cânți nota corectă, repetă orice secțiune și transpune sau reacordează din mers.',
                imageAlt: 'Panoul de încărcare fișiere pentru Cântă Alături',
            },
            progress: {
                eyebrow: 'Progres și Realizări',
                title: 'Fiecare sesiune contează.',
                description:
                    'XP-ul și nivelurile urmăresc exersarea totală, seriile urmăresc constanța, iar realizările se deblochează la repere reale — lecții terminate, precizie atinsă, nu insigne de vitrină. Distribuie un card de progres dintr-o atingere.',
                imageAlt: 'Nivel, bară de XP și panou de realizări',
            },
        },
        ctaTitle: 'Alege o tonică. Începe să cânți.',
        openAppLarge: 'Deschide aplicația',
    },
    community: {
        eyebrow: 'Comunitate',
        title: 'Exersarea solitară e opțională, nu obligatorie.',
        subtitle:
            'Construiește-ți un profil public, urmărește alți muzicieni și vezi unde te situezi pe clasament. Totul rulează pe același XP și aceleași realizări pe care exersarea ta deja le câștigă — fără un sistem de puncte separat de păcălit.',
        openApp: 'Deschide aplicația',
        seeEveryFeature: 'Vezi toate funcționalitățile',
        leaderboardEyebrow: 'Clasament',
        leaderboardTitle: 'Global, sau doar oamenii pe care îi urmărești.',
        leaderboardDescription:
            'Comută între toți cei cu profil public și muzicienii pe care îi urmărești. Clasați după nivel și XP, preluate direct din exersarea reală — fără umflarea clasamentului.',
        leaderboardImageAlt: 'Pagina de clasament cu comutator Global și Prieteni',
        pillars: {
            profiles: {
                title: 'Profiluri publice',
                description:
                    'Un nume de utilizator, o biografie, nivelul și realizările tale. Păstrează-l public pentru clasament, sau privat dacă preferi să exersezi fără spectatori.',
            },
            follow: {
                title: 'Urmărește alți muzicieni',
                description:
                    'Urmărește muzicienii al căror progres vrei să-l urmărești. Nivelul, seriile și rangul lor apar alături de ale tale — inclusiv în clasamentul prietenilor.',
            },
            share: {
                title: 'Distribuie carduri de progres',
                description:
                    'O atingere transformă nivelul, XP-ul și realizările tale recente într-o imagine — distribuie-o, nu doar vorbi despre ea.',
            },
        },
        ctaTitle: 'Află unde te situezi.',
        viewLeaderboard: 'Vezi clasamentul',
        openApp2: 'Deschide aplicația',
    },
};
