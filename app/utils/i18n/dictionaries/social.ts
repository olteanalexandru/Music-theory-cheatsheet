export interface SocialDict {
    profile: {
        cloudSyncRequired: string;
        notFound: string;
        signInToView: string;
        privateProfile: string;
        editProfileTitle: string;
        createProfileTitle: string;
        usernameLabel: string;
        usernamePlaceholder: string;
        displayNameLabel: string;
        bioLabel: string;
        publicProfileLabel: string;
        usernameInvalid: string;
        usernameTaken: string;
        saving: string;
        saveProfile: string;
        cancel: string;
        editProfile: string;
        unfollow: string;
        follow: string;
        followers: string;
        following: string;
        bestStreak: string;
        level: (level: number) => string;
        xpToNextLevel: (xp: number, total: number) => string;
    };
    leaderboard: {
        title: string;
        global: string;
        friends: string;
        cloudSyncRequired: string;
        signInForFriends: string;
        noFriendsPublic: string;
        noPublicProfiles: string;
        you: string;
        levelLine: (level: number, title: string, xp: number) => string;
    };
    challenges: {
        title: string;
        newChallenge: string;
        challengeWho: string;
        notFollowingAnyone: string;
        selectFriend: string;
        category: string;
        difficulty: string;
        length: string;
        sending: string;
        sendChallenge: string;
        cloudSyncRequired: string;
        signInToChallenge: string;
        noChallengesYet: string;
        youChallenged: string;
        challengeFrom: string;
        unknownOpponent: string;
        questionsCount: (n: number) => string;
        scoreLine: (mine: number, opponent: number) => string;
        youWon: string;
        youLost: string;
        tie: string;
        accept: string;
        decline: string;
        waiting: string;
        play: string;
        waitingForOpponent: string;
        declined: string;
    };
    feed: {
        title: string;
        global: string;
        following: string;
        cloudSyncRequired: string;
        signInForFollowing: string;
        noActivityFollowing: string;
        noActivityYet: string;
        comments: string;
        noCommentsYet: string;
        commentPlaceholder: string;
        post: string;
        you: string;
        unlockedAchievement: (title: string) => string;
        reachedLevel: (level: number | string) => string;
        completedLesson: string;
        finishedChallenge: (category: string, correct: number | string, total: number | string) => string;
        didSomething: string;
        justNow: string;
        minutesAgo: (n: number) => string;
        hoursAgo: (n: number) => string;
        daysAgo: (n: number) => string;
    };
    plan: {
        title: string;
        subtitle: string;
        level: (level: number) => string;
        lessonsComplete: (completed: number, total: number) => string;
        yourStats: string;
        questionsAnswered: string;
        correctAnswers: string;
        overallAccuracy: string;
        bestStreak: string;
        upNext: string;
        continueLesson: string;
        comingUpAfterThis: string;
        allLessonsComplete: string;
        todaysPractice: string;
        todaysPracticeSubtitle: string;
        practiceNow: string;
        almostThere: string;
        almostThereSubtitle: string;
        progressFraction: (current: number, target: number) => string;
        roadmap: string;
        unitComplete: string;
        upNextBadge: string;
    };
    support: {
        cloudSyncRequired: string;
        signInToContact: string;
        backToTickets: string;
        you: string;
        replyPlaceholder: string;
        send: string;
        title: string;
        newTicket: string;
        subject: string;
        category: string;
        howCanWeHelp: string;
        sending: string;
        submitTicket: string;
        noTicketsYet: string;
        couldNotCreate: string;
    };
    gamification: {
        levelUp: (level: number) => string;
        level: (level: number) => string;
        xpToNextLevel: (xp: number, total: number) => string;
        achievementsCount: (unlocked: number, total: number) => string;
        shareTitle: string;
        shareText: (level: number, unlocked: number, total: number) => string;
        shareLabel: string;
    };
    progress: {
        overallProgress: string;
        overallProgressNoAttempts: string;
        bestStreakSuffix: (n: number) => string;
        hideDetails: string;
        showDetails: string;
        noAttemptsYet: string;
        streak: string;
        bestSuffix: (n: number) => string;
        lastPracticed: string;
        never: string;
        justNow: string;
        minutesAgo: (n: number) => string;
        hoursAgo: (n: number) => string;
        daysAgo: (n: number) => string;
        resetProgress: string;
    };
    review: {
        weakAreas: string;
        reviewWeakAreas: string;
        dueNow: string;
        dueTomorrow: string;
        dueInDays: (n: number) => string;
    };
    levelBadge: {
        title: (level: number) => string;
    };
    curriculum: {
        title: string;
        lessonsComplete: (completed: number, total: number) => string;
        conceptCheck: string;
        practiceLabel: (label: string) => string;
        nextLesson: string;
    };
    lessonQuiz: {
        submitQuiz: string;
        passed: (pct: number) => string;
        scoredNeed: (scored: number, needed: number) => string;
        retry: string;
    };
}

export const en: SocialDict = {
    profile: {
        cloudSyncRequired: "Profiles require cloud sync, which isn't configured for this deployment.",
        notFound: 'No profile found for that username.',
        signInToView: 'Sign in to view your profile.',
        privateProfile: 'This profile is private.',
        editProfileTitle: 'Edit profile',
        createProfileTitle: 'Create your profile',
        usernameLabel: 'Username',
        usernamePlaceholder: 'lowercase_username',
        displayNameLabel: 'Display name',
        bioLabel: 'Bio',
        publicProfileLabel: 'Public profile (visible on the leaderboard and to other users)',
        usernameInvalid: 'Username must be 3-20 characters: lowercase letters, numbers, underscores.',
        usernameTaken: 'That username is already taken.',
        saving: 'Saving…',
        saveProfile: 'Save profile',
        cancel: 'Cancel',
        editProfile: 'Edit profile',
        unfollow: 'Unfollow',
        follow: 'Follow',
        followers: 'Followers',
        following: 'Following',
        bestStreak: 'Best Streak',
        level: (level) => `Level ${level}`,
        xpToNextLevel: (xp, total) => `${xp} / ${total} XP to next level`,
    },
    leaderboard: {
        title: 'Leaderboard',
        global: 'Global',
        friends: 'Friends',
        cloudSyncRequired: "The leaderboard requires cloud sync, which isn't configured for this deployment.",
        signInForFriends: "Sign in to see your friends' leaderboard.",
        noFriendsPublic: "You aren't following anyone with a public profile yet.",
        noPublicProfiles: 'No public profiles yet.',
        you: 'you',
        levelLine: (level, title, xp) => `Level ${level} · ${title} · ${xp} XP`,
    },
    challenges: {
        title: 'Challenges',
        newChallenge: 'New Challenge',
        challengeWho: 'Challenge who?',
        notFollowingAnyone: "You aren't following anyone yet. Follow someone from their profile first.",
        selectFriend: 'Select a friend…',
        category: 'Category',
        difficulty: 'Difficulty',
        length: 'Length',
        sending: 'Sending…',
        sendChallenge: 'Send Challenge',
        cloudSyncRequired: "Challenges require cloud sync, which isn't configured for this deployment.",
        signInToChallenge: 'Sign in to challenge your friends.',
        noChallengesYet: 'No challenges yet — challenge a friend above.',
        youChallenged: 'You challenged ',
        challengeFrom: 'Challenge from ',
        unknownOpponent: 'Unknown',
        questionsCount: (n) => `${n} questions`,
        scoreLine: (mine, opponent) => `${mine} vs ${opponent}`,
        youWon: ' — You won!',
        youLost: ' — You lost.',
        tie: ' — Tie.',
        accept: 'Accept',
        decline: 'Decline',
        waiting: 'Waiting…',
        play: 'Play',
        waitingForOpponent: 'Waiting for opponent…',
        declined: 'Declined',
    },
    feed: {
        title: 'Activity Feed',
        global: 'Global',
        following: 'Following',
        cloudSyncRequired: "The activity feed requires cloud sync, which isn't configured for this deployment.",
        signInForFollowing: 'Sign in to see activity from people you follow.',
        noActivityFollowing: 'No activity yet from people you follow.',
        noActivityYet: 'No activity yet.',
        comments: 'Comments',
        noCommentsYet: 'No comments yet.',
        commentPlaceholder: 'Add a comment…',
        post: 'Post',
        you: 'You',
        unlockedAchievement: (title) => `unlocked the "${title}" achievement`,
        reachedLevel: (level) => `reached level ${level}`,
        completedLesson: 'completed a curriculum lesson',
        finishedChallenge: (category, correct, total) => `finished a ${category} challenge (${correct} / ${total})`,
        didSomething: 'did something noteworthy',
        justNow: 'just now',
        minutesAgo: (n) => `${n}m ago`,
        hoursAgo: (n) => `${n}h ago`,
        daysAgo: (n) => `${n}d ago`,
    },
    plan: {
        title: 'Your Learning Plan',
        subtitle: 'A roadmap through the curriculum, plus a daily practice session tuned to your weak spots.',
        level: (level) => `Level ${level}`,
        lessonsComplete: (completed, total) => `${completed} / ${total} lessons complete`,
        yourStats: 'Your Stats',
        questionsAnswered: 'Questions Answered',
        correctAnswers: 'Correct Answers',
        overallAccuracy: 'Overall Accuracy',
        bestStreak: 'Best Streak',
        upNext: 'Up Next',
        continueLesson: 'Continue Lesson',
        comingUpAfterThis: 'Coming Up After This',
        allLessonsComplete:
            "You've completed every lesson in the curriculum. Revisit any unit below, or head to the practice page for Expert-tier drills.",
        todaysPractice: "Today's Practice",
        todaysPracticeSubtitle: 'A short mixed session targeting the areas that need the most attention right now.',
        practiceNow: 'Practice Now',
        almostThere: 'Almost There',
        almostThereSubtitle: 'The achievements closest to unlocking based on your current progress.',
        progressFraction: (current, target) => `${current} / ${target}`,
        roadmap: 'Roadmap',
        unitComplete: 'Unit complete',
        upNextBadge: 'Up Next',
    },
    support: {
        cloudSyncRequired: "Support tickets require cloud sync, which isn't configured for this deployment.",
        signInToContact: 'Sign in to contact support.',
        backToTickets: 'Back to tickets',
        you: 'You',
        replyPlaceholder: 'Write a reply…',
        send: 'Send',
        title: 'Support',
        newTicket: 'New Ticket',
        subject: 'Subject',
        category: 'Category',
        howCanWeHelp: 'How can we help?',
        sending: 'Sending…',
        submitTicket: 'Submit Ticket',
        noTicketsYet: 'No tickets yet — open one above if you need help.',
        couldNotCreate: 'Could not create ticket',
    },
    gamification: {
        levelUp: (level) => `Level Up! You're now Level ${level}`,
        level: (level) => `Level ${level}`,
        xpToNextLevel: (xp, total) => `${xp} / ${total} XP to next level`,
        achievementsCount: (unlocked, total) => `${unlocked} / ${total} Achievements`,
        shareTitle: 'Music Theory Cheatsheet',
        shareText: (level, unlocked, total) =>
            `I'm Level ${level} with ${unlocked}/${total} achievements unlocked on Music Theory Cheatsheet! 🎵`,
        shareLabel: 'Share progress',
    },
    progress: {
        overallProgress: 'Overall Progress',
        overallProgressNoAttempts: '—',
        bestStreakSuffix: (n) => ` · Best streak: ${n}`,
        hideDetails: '▲ Hide',
        showDetails: '▼ Details',
        noAttemptsYet: 'No attempts yet',
        streak: 'Streak',
        bestSuffix: (n) => ` (best ${n})`,
        lastPracticed: 'Last practiced',
        never: 'Never',
        justNow: 'Just now',
        minutesAgo: (n) => `${n}m ago`,
        hoursAgo: (n) => `${n}h ago`,
        daysAgo: (n) => `${n}d ago`,
        resetProgress: 'Reset Progress',
    },
    review: {
        weakAreas: 'Weak Areas',
        reviewWeakAreas: 'Review Weak Areas',
        dueNow: 'Due now',
        dueTomorrow: 'Due tomorrow',
        dueInDays: (n) => `Due in ${n}d`,
    },
    levelBadge: {
        title: (level) => `Level ${level}`,
    },
    curriculum: {
        title: 'Curriculum',
        lessonsComplete: (completed, total) => `${completed} / ${total} lessons complete`,
        conceptCheck: 'Concept Check',
        practiceLabel: (label) => `Practice: ${label}`,
        nextLesson: 'Next Lesson',
    },
    lessonQuiz: {
        submitQuiz: 'Submit Quiz',
        passed: (pct) => `Passed — ${pct}%`,
        scoredNeed: (scored, needed) => `Scored ${scored}% — need ${needed}% to pass`,
        retry: 'Retry',
    },
};

export const ro: SocialDict = {
    profile: {
        cloudSyncRequired: 'Profilurile necesită sincronizare în cloud, care nu este configurată pentru această implementare.',
        notFound: 'Niciun profil găsit pentru acel nume de utilizator.',
        signInToView: 'Conectează-te pentru a-ți vedea profilul.',
        privateProfile: 'Acest profil este privat.',
        editProfileTitle: 'Editează profilul',
        createProfileTitle: 'Creează-ți profilul',
        usernameLabel: 'Nume de utilizator',
        usernamePlaceholder: 'nume_utilizator_minuscule',
        displayNameLabel: 'Nume afișat',
        bioLabel: 'Descriere',
        publicProfileLabel: 'Profil public (vizibil în clasament și pentru alți utilizatori)',
        usernameInvalid: 'Numele de utilizator trebuie să aibă 3-20 caractere: litere mici, cifre, underscore.',
        usernameTaken: 'Acel nume de utilizator este deja folosit.',
        saving: 'Se salvează…',
        saveProfile: 'Salvează profilul',
        cancel: 'Anulează',
        editProfile: 'Editează profilul',
        unfollow: 'Nu mai urmări',
        follow: 'Urmărește',
        followers: 'Urmăritori',
        following: 'Urmăriri',
        bestStreak: 'Cel mai bun șir',
        level: (level) => `Nivel ${level}`,
        xpToNextLevel: (xp, total) => `${xp} / ${total} XP până la următorul nivel`,
    },
    leaderboard: {
        title: 'Clasament',
        global: 'Global',
        friends: 'Prieteni',
        cloudSyncRequired: 'Clasamentul necesită sincronizare în cloud, care nu este configurată pentru această implementare.',
        signInForFriends: 'Conectează-te pentru a vedea clasamentul prietenilor tăi.',
        noFriendsPublic: 'Încă nu urmărești pe nimeni cu profil public.',
        noPublicProfiles: 'Niciun profil public încă.',
        you: 'tu',
        levelLine: (level, title, xp) => `Nivel ${level} · ${title} · ${xp} XP`,
    },
    challenges: {
        title: 'Provocări',
        newChallenge: 'Provocare nouă',
        challengeWho: 'Pe cine provoci?',
        notFollowingAnyone: 'Încă nu urmărești pe nimeni. Urmărește pe cineva din profilul lor mai întâi.',
        selectFriend: 'Selectează un prieten…',
        category: 'Categorie',
        difficulty: 'Dificultate',
        length: 'Lungime',
        sending: 'Se trimite…',
        sendChallenge: 'Trimite provocarea',
        cloudSyncRequired: 'Provocările necesită sincronizare în cloud, care nu este configurată pentru această implementare.',
        signInToChallenge: 'Conectează-te pentru a-ți provoca prietenii.',
        noChallengesYet: 'Nicio provocare încă — provoacă un prieten mai sus.',
        youChallenged: 'L-ai provocat pe ',
        challengeFrom: 'Provocare de la ',
        unknownOpponent: 'Necunoscut',
        questionsCount: (n) => `${n} întrebări`,
        scoreLine: (mine, opponent) => `${mine} vs ${opponent}`,
        youWon: ' — Ai câștigat!',
        youLost: ' — Ai pierdut.',
        tie: ' — Egalitate.',
        accept: 'Acceptă',
        decline: 'Refuză',
        waiting: 'Se așteaptă…',
        play: 'Joacă',
        waitingForOpponent: 'Se așteaptă adversarul…',
        declined: 'Refuzată',
    },
    feed: {
        title: 'Flux de activitate',
        global: 'Global',
        following: 'Urmăriri',
        cloudSyncRequired: 'Fluxul de activitate necesită sincronizare în cloud, care nu este configurată pentru această implementare.',
        signInForFollowing: 'Conectează-te pentru a vedea activitatea persoanelor pe care le urmărești.',
        noActivityFollowing: 'Nicio activitate încă de la persoanele pe care le urmărești.',
        noActivityYet: 'Nicio activitate încă.',
        comments: 'Comentarii',
        noCommentsYet: 'Niciun comentariu încă.',
        commentPlaceholder: 'Adaugă un comentariu…',
        post: 'Trimite',
        you: 'Tu',
        unlockedAchievement: (title) => `a deblocat realizarea „${title}"`,
        reachedLevel: (level) => `a atins nivelul ${level}`,
        completedLesson: 'a finalizat o lecție din curriculum',
        finishedChallenge: (category, correct, total) => `a terminat o provocare ${category} (${correct} / ${total})`,
        didSomething: 'a făcut ceva demn de remarcat',
        justNow: 'chiar acum',
        minutesAgo: (n) => `acum ${n}m`,
        hoursAgo: (n) => `acum ${n}h`,
        daysAgo: (n) => `acum ${n}z`,
    },
    plan: {
        title: 'Planul tău de învățare',
        subtitle: 'O hartă prin curriculum, plus o sesiune zilnică de exersare adaptată punctelor tale slabe.',
        level: (level) => `Nivel ${level}`,
        lessonsComplete: (completed, total) => `${completed} / ${total} lecții finalizate`,
        yourStats: 'Statisticile tale',
        questionsAnswered: 'Întrebări răspunse',
        correctAnswers: 'Răspunsuri corecte',
        overallAccuracy: 'Precizie generală',
        bestStreak: 'Cel mai bun șir',
        upNext: 'Următoarea',
        continueLesson: 'Continuă lecția',
        comingUpAfterThis: 'Urmează după aceasta',
        allLessonsComplete:
            'Ai finalizat toate lecțiile din curriculum. Revizitează orice unitate de mai jos sau mergi la pagina de exersare pentru exerciții de nivel expert.',
        todaysPractice: 'Exersarea de azi',
        todaysPracticeSubtitle: 'O sesiune scurtă și mixtă care vizează zonele care au nevoie de cea mai multă atenție acum.',
        practiceNow: 'Exersează acum',
        almostThere: 'Aproape acolo',
        almostThereSubtitle: 'Realizările cele mai aproape de deblocare pe baza progresului tău actual.',
        progressFraction: (current, target) => `${current} / ${target}`,
        roadmap: 'Foaie de parcurs',
        unitComplete: 'Unitate finalizată',
        upNextBadge: 'Următoarea',
    },
    support: {
        cloudSyncRequired: 'Tichetele de asistență necesită sincronizare în cloud, care nu este configurată pentru această implementare.',
        signInToContact: 'Conectează-te pentru a contacta asistența.',
        backToTickets: 'Înapoi la tichete',
        you: 'Tu',
        replyPlaceholder: 'Scrie un răspuns…',
        send: 'Trimite',
        title: 'Asistență',
        newTicket: 'Tichet nou',
        subject: 'Subiect',
        category: 'Categorie',
        howCanWeHelp: 'Cum te putem ajuta?',
        sending: 'Se trimite…',
        submitTicket: 'Trimite tichetul',
        noTicketsYet: 'Niciun tichet încă — deschide unul mai sus dacă ai nevoie de ajutor.',
        couldNotCreate: 'Tichetul nu a putut fi creat',
    },
    gamification: {
        levelUp: (level) => `Nivel nou! Acum ești Nivel ${level}`,
        level: (level) => `Nivel ${level}`,
        xpToNextLevel: (xp, total) => `${xp} / ${total} XP până la următorul nivel`,
        achievementsCount: (unlocked, total) => `${unlocked} / ${total} Realizări`,
        shareTitle: 'Teoria Muzicii',
        shareText: (level, unlocked, total) =>
            `Sunt Nivel ${level} cu ${unlocked}/${total} realizări deblocate pe Teoria Muzicii! 🎵`,
        shareLabel: 'Distribuie progresul',
    },
    progress: {
        overallProgress: 'Progres general',
        overallProgressNoAttempts: '—',
        bestStreakSuffix: (n) => ` · Cel mai bun șir: ${n}`,
        hideDetails: '▲ Ascunde',
        showDetails: '▼ Detalii',
        noAttemptsYet: 'Nicio încercare încă',
        streak: 'Șir',
        bestSuffix: (n) => ` (cel mai bun ${n})`,
        lastPracticed: 'Ultima exersare',
        never: 'Niciodată',
        justNow: 'Chiar acum',
        minutesAgo: (n) => `acum ${n}m`,
        hoursAgo: (n) => `acum ${n}h`,
        daysAgo: (n) => `acum ${n}z`,
        resetProgress: 'Resetează progresul',
    },
    review: {
        weakAreas: 'Zone slabe',
        reviewWeakAreas: 'Revizuiește zonele slabe',
        dueNow: 'Scadent acum',
        dueTomorrow: 'Scadent mâine',
        dueInDays: (n) => `Scadent în ${n}z`,
    },
    levelBadge: {
        title: (level) => `Nivel ${level}`,
    },
    curriculum: {
        title: 'Curriculum',
        lessonsComplete: (completed, total) => `${completed} / ${total} lecții finalizate`,
        conceptCheck: 'Verificarea conceptului',
        practiceLabel: (label) => `Exersează: ${label}`,
        nextLesson: 'Lecția următoare',
    },
    lessonQuiz: {
        submitQuiz: 'Trimite testul',
        passed: (pct) => `Promovat — ${pct}%`,
        scoredNeed: (scored, needed) => `Scor ${scored}% — ai nevoie de ${needed}% pentru a promova`,
        retry: 'Reîncearcă',
    },
};
