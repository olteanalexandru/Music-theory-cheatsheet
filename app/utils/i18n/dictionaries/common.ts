export interface CommonDict {
    brand: string;
    nav: {
        features: string;
        community: string;
        practice: string;
        plan: string;
        feed: string;
        challenges: string;
        leaderboard: string;
        support: string;
        profile: string;
        admin: string;
        newsletter: string;
    };
    header: {
        getStarted: string;
        notifications: string;
        noNotifications: string;
        myProfile: string;
        signOut: string;
        logIn: string;
        signIn: string;
    };
    notifications: {
        follow: (actor: string) => string;
        challengeInvite: (actor: string) => string;
        challengeResult: (actor: string) => string;
        comment: (actor: string) => string;
        reaction: (actor: string) => string;
        ticketReply: (subject: string) => string;
        ticketStatus: (subject: string, status: string) => string;
        fallback: (actor: string) => string;
        justNow: string;
        minutesAgo: (n: number) => string;
        hoursAgo: (n: number) => string;
        daysAgo: (n: number) => string;
    };
    footer: {
        newsletterTitle: string;
        emailPlaceholder: string;
        subscribe: string;
        newsletterUnconfigured: string;
        subscribeSuccess: string;
        privacyAgreement: string;
        terms: string;
        privacy: string;
        share: string;
        themeLabel: string;
        themes: { dark: string; light: string; psychedelic: string };
    };
    auth: {
        modeLabel: { signIn: string; signUp: string; magicLink: string };
        subtitle: string;
        notConfigured: string;
        continueWithGoogle: string;
        or: string;
        emailPlaceholder: string;
        passwordPlaceholder: string;
        pleaseWait: string;
        signUpSuccess: string;
        magicLinkSuccess: string;
        switchToSignIn: string;
        switchToSignUp: string;
        switchToMagicLink: string;
        close: string;
    };
    toolNav: {
        overview: string;
        fretboard: string;
        circleOfFifths: string;
        staff: string;
        clefTrainer: string;
        rhythm: string;
        earTraining: string;
        playAlong: string;
        curriculum: string;
    };
    audioSettings: {
        title: string;
        synth: string;
        volume: string;
        midi: string;
        connectMidi: string;
        requestingAccess: string;
        midiUnsupported: string;
        midiDenied: string;
        device: string;
        allDevices: string;
        noMidiDevices: string;
        microphone: string;
        connectMicrophone: string;
        microphoneUnsupported: string;
        microphoneDenied: string;
        listening: string;
        disconnect: string;
        micTip: string;
    };
    language: {
        label: string;
        en: string;
        ro: string;
    };
}

export const en: CommonDict = {
    brand: 'Music Theory',
    nav: {
        features: 'Features',
        community: 'Community',
        practice: 'Practice',
        plan: 'Plan',
        feed: 'Feed',
        challenges: 'Challenges',
        leaderboard: 'Leaderboard',
        support: 'Support',
        profile: 'Profile',
        admin: 'Admin',
        newsletter: 'Newsletter',
    },
    header: {
        getStarted: 'Get Started',
        notifications: 'Notifications',
        noNotifications: 'No notifications yet.',
        myProfile: 'My Profile',
        signOut: 'Sign out',
        logIn: 'Log in',
        signIn: 'Sign in',
    },
    notifications: {
        follow: (actor) => `${actor} started following you`,
        challengeInvite: (actor) => `${actor} challenged you`,
        challengeResult: (actor) => `Your challenge with ${actor} is finished`,
        comment: (actor) => `${actor} commented on your activity`,
        reaction: (actor) => `${actor} reacted to your activity`,
        ticketReply: (subject) => `Support replied to "${subject}"`,
        ticketStatus: (subject, status) => `Your ticket "${subject}" is now ${status}`,
        fallback: (actor) => `${actor} did something`,
        justNow: 'just now',
        minutesAgo: (n) => `${n}m ago`,
        hoursAgo: (n) => `${n}h ago`,
        daysAgo: (n) => `${n}d ago`,
    },
    footer: {
        newsletterTitle: 'Get practice tips by email',
        emailPlaceholder: 'you@example.com',
        subscribe: 'Subscribe',
        newsletterUnconfigured: "Newsletter signup isn't configured for this deployment.",
        subscribeSuccess: "You're subscribed!",
        privacyAgreement: 'By subscribing you agree to our',
        terms: 'Terms & Conditions',
        privacy: 'Privacy Policy',
        share: 'Share',
        themeLabel: 'Theme',
        themes: { dark: 'Dark', light: 'Light', psychedelic: 'Psychedelic' },
    },
    auth: {
        modeLabel: { signIn: 'Sign in', signUp: 'Create account', magicLink: 'Email me a link' },
        subtitle: 'Sign in to save your practice progress and Play Along files across devices.',
        notConfigured: "Cloud sync isn't configured for this deployment yet — sign-in is unavailable.",
        continueWithGoogle: 'Continue with Google',
        or: 'or',
        emailPlaceholder: 'Email',
        passwordPlaceholder: 'Password',
        pleaseWait: 'Please wait…',
        signUpSuccess: 'Account created — check your email to confirm it, then sign in.',
        magicLinkSuccess: 'Check your email for a sign-in link.',
        switchToSignIn: 'Sign in',
        switchToSignUp: 'Create account',
        switchToMagicLink: 'Email me a link instead',
        close: 'Close',
    },
    toolNav: {
        overview: 'Overview',
        fretboard: 'Fretboard',
        circleOfFifths: 'Circle of Fifths',
        staff: 'Staff',
        clefTrainer: 'Clef Trainer',
        rhythm: 'Rhythm',
        earTraining: 'Ear Training',
        playAlong: 'Play Along',
        curriculum: 'Curriculum',
    },
    audioSettings: {
        title: 'Display & Audio Settings',
        synth: 'Synth',
        volume: 'Volume',
        midi: 'MIDI',
        connectMidi: 'Connect MIDI Device',
        requestingAccess: 'Requesting access…',
        midiUnsupported: "Web MIDI isn't supported in this browser. Try Chrome or Edge.",
        midiDenied: 'MIDI access was denied.',
        device: 'Device:',
        allDevices: 'All devices',
        noMidiDevices: 'No MIDI devices detected.',
        microphone: 'Microphone',
        connectMicrophone: 'Connect Microphone',
        microphoneUnsupported: "Microphone input isn't supported in this browser.",
        microphoneDenied: 'Microphone access was denied.',
        listening: 'Listening for taps and notes.',
        disconnect: 'Disconnect',
        micTip: "Tip: use headphones — the mic can mistake the app's own sound for your input.",
    },
    language: {
        label: 'Language',
        en: 'English',
        ro: 'Română',
    },
};

export const ro: CommonDict = {
    brand: 'Teoria Muzicii',
    nav: {
        features: 'Funcționalități',
        community: 'Comunitate',
        practice: 'Exersare',
        plan: 'Plan',
        feed: 'Flux',
        challenges: 'Provocări',
        leaderboard: 'Clasament',
        support: 'Asistență',
        profile: 'Profil',
        admin: 'Admin',
        newsletter: 'Newsletter',
    },
    header: {
        getStarted: 'Începe acum',
        notifications: 'Notificări',
        noNotifications: 'Nu există notificări încă.',
        myProfile: 'Profilul meu',
        signOut: 'Deconectare',
        logIn: 'Autentificare',
        signIn: 'Conectare',
    },
    notifications: {
        follow: (actor) => `${actor} a început să te urmărească`,
        challengeInvite: (actor) => `${actor} te-a provocat`,
        challengeResult: (actor) => `Provocarea ta cu ${actor} s-a încheiat`,
        comment: (actor) => `${actor} a comentat la activitatea ta`,
        reaction: (actor) => `${actor} a reacționat la activitatea ta`,
        ticketReply: (subject) => `Asistența a răspuns la „${subject}"`,
        ticketStatus: (subject, status) => `Tichetul tău „${subject}" este acum ${status}`,
        fallback: (actor) => `${actor} a făcut ceva`,
        justNow: 'chiar acum',
        minutesAgo: (n) => `acum ${n}m`,
        hoursAgo: (n) => `acum ${n}h`,
        daysAgo: (n) => `acum ${n}z`,
    },
    footer: {
        newsletterTitle: 'Sfaturi muzicale direct în căsuța ta de email',
        emailPlaceholder: 'tu@exemplu.com',
        subscribe: 'Abonează-te',
        newsletterUnconfigured: 'Abonarea la newsletter nu este configurată pentru această implementare.',
        subscribeSuccess: 'Te-ai abonat!',
        privacyAgreement: 'Prin abonare, ești de acord cu',
        terms: 'Termeni și Condiții',
        privacy: 'Politica de Confidențialitate',
        share: 'Distribuie',
        themeLabel: 'Temă',
        themes: { dark: 'Întunecat', light: 'Luminos', psychedelic: 'Psihedelic' },
    },
    auth: {
        modeLabel: { signIn: 'Conectare', signUp: 'Creează cont', magicLink: 'Trimite-mi un link' },
        subtitle: 'Conectează-te pentru a-ți salva progresul și fișierele Play Along pe toate dispozitivele.',
        notConfigured: 'Sincronizarea în cloud nu este configurată pentru această implementare — autentificarea nu este disponibilă.',
        continueWithGoogle: 'Continuă cu Google',
        or: 'sau',
        emailPlaceholder: 'Email',
        passwordPlaceholder: 'Parolă',
        pleaseWait: 'Te rugăm așteaptă…',
        signUpSuccess: 'Cont creat — verifică-ți emailul pentru confirmare, apoi conectează-te.',
        magicLinkSuccess: 'Verifică-ți emailul pentru linkul de conectare.',
        switchToSignIn: 'Conectare',
        switchToSignUp: 'Creează cont',
        switchToMagicLink: 'Trimite-mi un link în schimb',
        close: 'Închide',
    },
    toolNav: {
        overview: 'Prezentare',
        fretboard: 'Navigator Taste',
        circleOfFifths: 'Cercul Cvintelor',
        staff: 'Portativ',
        clefTrainer: 'Antrenor de Chei',
        rhythm: 'Ritm',
        earTraining: 'Antrenament Auditiv',
        playAlong: 'Cântă Alături',
        curriculum: 'Curriculum',
    },
    audioSettings: {
        title: 'Setări de Afișaj și Audio',
        synth: 'Sintetizator',
        volume: 'Volum',
        midi: 'MIDI',
        connectMidi: 'Conectează Dispozitiv MIDI',
        requestingAccess: 'Se solicită accesul…',
        midiUnsupported: 'Web MIDI nu este acceptat în acest browser. Încearcă Chrome sau Edge.',
        midiDenied: 'Accesul MIDI a fost refuzat.',
        device: 'Dispozitiv:',
        allDevices: 'Toate dispozitivele',
        noMidiDevices: 'Niciun dispozitiv MIDI detectat.',
        microphone: 'Microfon',
        connectMicrophone: 'Conectează Microfonul',
        microphoneUnsupported: 'Intrarea de la microfon nu este acceptată în acest browser.',
        microphoneDenied: 'Accesul la microfon a fost refuzat.',
        listening: 'Se detectează notele și pulsul ritmic.',
        disconnect: 'Deconectează',
        micTip: 'Sfat: folosește căști — microfonul poate confunda sunetul aplicației cu intrarea ta.',
    },
    language: {
        label: 'Limbă',
        en: 'English',
        ro: 'Română',
    },
};
