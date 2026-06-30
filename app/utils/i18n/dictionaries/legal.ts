export interface LegalDict {
    privacy: {
        eyebrow: string;
        title: string;
        lastUpdated: (date: string) => string;
        sections: {
            guestMode: { title: string; body: string };
            accountData: {
                title: string;
                intro: string;
                items: { label: string; text: string }[];
            };
            newsletter: { title: string; body: string };
            noTracking: { title: string; body: string };
            thirdParties: {
                title: string;
                intro: string;
                items: { label: string; text: string }[];
                outro: string;
            };
            retention: { title: string; body: string };
            rights: { title: string; before: string; linkText: string; after: string };
            children: { title: string; body: string };
            changes: { title: string; body: string };
            contact: { title: string; before: string; linkText: string };
        };
        seeAlso: { before: string; linkText: string };
    };
    terms: {
        eyebrow: string;
        title: string;
        lastUpdated: (date: string) => string;
        sections: {
            acceptance: { title: string; body: string };
            service: { title: string; body: string[] };
            accounts: { title: string; body: string };
            content: { title: string; body: string[] };
            newsletter: { title: string; body: string };
            disclaimer: { title: string; body: string };
            liability: { title: string; body: string };
            changes: { title: string; body: string };
            contact: { title: string; before: string; linkText: string };
        };
        seeAlso: { before: string; linkText: string };
    };
    unsubscribe: {
        noCloudSync: string;
        missingToken: string;
        couldNotUnsubscribe: string;
        unsubscribed: string;
        noMoreEmails: string;
    };
    adminTickets: {
        backToInbox: string;
        unknownUser: string;
        writeReply: string;
        send: string;
        you: string;
        noTickets: string;
        supportInbox: string;
        requiresCloudSync: string;
        signInRequired: string;
        noAccess: string;
    };
    adminNewsletter: {
        newsletter: string;
        subscriberCount: (n: number) => string;
        subjectPlaceholder: string;
        toolbar: {
            bold: string;
            italic: string;
            underline: string;
            heading: string;
            bulletList: string;
            numberedList: string;
            quote: string;
            link: string;
            undo: string;
            redo: string;
        };
        linkPromptLabel: string;
        sentTo: (n: number) => string;
        sendToSubscribers: (n: number) => string;
        confirmSend: (subject: string, n: number) => string;
        cancel: string;
        confirmSendButton: string;
        sendHistory: string;
        noNewslettersSent: string;
        recipientCount: (n: number) => string;
        requiresCloudSync: string;
        signInRequired: string;
        noAccess: string;
    };
}

export const en: LegalDict = {
    privacy: {
        eyebrow: 'Legal',
        title: 'Privacy Policy',
        lastUpdated: (date) => `Last updated: ${date}`,
        sections: {
            guestMode: {
                title: '1. Guest mode: nothing leaves your device',
                body: "Most of the app works without an account. In guest mode, your practice progress, achievements, curriculum progress, and preferences are stored only in your browser's local storage. We never see this data — it isn't sent to us at all.",
            },
            accountData: {
                title: '2. What we collect if you create an account',
                intro: 'Creating an account is optional. If you do, we store:',
                items: [
                    { label: 'Account credentials', text: '— your email and password, managed by our authentication provider (Supabase).' },
                    { label: 'Profile info', text: '— username, display name, bio, and your public/private setting.' },
                    { label: 'Practice data', text: '— progress, curriculum completion, spaced-repetition review state, and gamification data (XP, level, achievements), so it can sync across your devices.' },
                    { label: 'Social activity', text: '— follows, activity feed posts, comments, reactions, and challenge records, if you use those features.' },
                    { label: 'Uploaded files', text: '— any MIDI/Guitar Pro files you upload to Play Along.' },
                    { label: 'Support tickets', text: '— the subject, category, and messages of any ticket you open.' },
                ],
            },
            newsletter: {
                title: '3. Newsletter',
                body: "If you subscribe to the newsletter, we store only your email address. It's used solely to send the newsletter. Clicking the unsubscribe link in any newsletter email deletes your email from our list immediately — there's no separate request needed.",
            },
            noTracking: {
                title: '4. No tracking, no advertising',
                body: "We don't use analytics cookies, advertising trackers, or any third-party tracking scripts. We don't sell or share your data with advertisers.",
            },
            thirdParties: {
                title: '5. Who else sees your data',
                intro: 'We use a small number of service providers to run the app, who process data on our behalf:',
                items: [
                    { label: 'Supabase', text: '— hosts our database, authentication, and file storage.' },
                    { label: 'Resend', text: '— delivers newsletter emails. Only the email address and newsletter content are shared with it for that purpose.' },
                ],
                outro: "Public profile info, public activity, and the leaderboard are visible to other users of the app if you set your profile to public — that's a feature you control, not data shared with a third party.",
            },
            retention: {
                title: '6. How long we keep your data',
                body: 'Account data is kept for as long as your account exists. Newsletter subscriptions are hard-deleted (not just marked inactive) the moment you unsubscribe.',
            },
            rights: {
                title: '7. Your rights',
                before: "You can edit or delete most of your own content directly in the app — your profile, your public/private setting, your posts, comments, and uploaded files. For anything else, including a full export or deletion of your account data, or any other GDPR data request, ",
                linkText: 'open a support ticket',
                after: " and we'll handle it.",
            },
            children: {
                title: '8. Children',
                body: "The app isn't directed at children under 13, and we don't knowingly collect data from them.",
            },
            changes: {
                title: '9. Changes to this policy',
                body: 'We may update this policy from time to time. Material changes will be reflected by updating the "Last updated" date above.',
            },
            contact: {
                title: '10. Contact',
                before: 'Questions about this policy or your data? ',
                linkText: 'Open a support ticket',
            },
        },
        seeAlso: { before: 'See also our ', linkText: 'Terms & Conditions' },
    },
    terms: {
        eyebrow: 'Legal',
        title: 'Terms & Conditions',
        lastUpdated: (date) => `Last updated: ${date}`,
        sections: {
            acceptance: {
                title: '1. Acceptance of terms',
                body: 'By using Music Theory Cheatsheet ("the app"), you agree to these terms. If you don\'t agree, please don\'t use the app.',
            },
            service: {
                title: '2. The service',
                body: [
                    'The app provides interactive music theory practice tools — fretboard, staff notation, ear training, rhythm, play-along, and a guided curriculum — along with optional social features (public profiles, follows, an activity feed, friend challenges, and a leaderboard).',
                    'You can use most of the app in guest mode, with no account: your progress is stored only on your own device. Creating an account is optional and adds cloud sync (so your progress follows you across devices) plus the social features.',
                    "The app is currently free to use. We may introduce paid or subscription tiers in the future; if we do, we'll announce it clearly before any existing functionality is put behind a paywall.",
                ],
            },
            accounts: {
                title: '3. Accounts',
                body: "If you create an account, you're responsible for keeping your credentials secure and for any activity under your account. Provide an email address you actually control — we use it for sign-in and, if something goes wrong with your account, to reach you.",
            },
            content: {
                title: '4. Your content',
                body: [
                    'Profile details (username, bio), activity feed posts, comments, reactions, and challenge results are visible to other users when your profile is set to public. You can switch your profile to private at any time from your profile page.',
                    "Don't post anything illegal, harassing, or that infringes someone else's rights. We may remove content or suspend accounts that violate this.",
                ],
            },
            newsletter: {
                title: '5. Newsletter',
                body: 'Subscribing to the newsletter is opt-in and requires only an email address. Every newsletter email includes a one-click unsubscribe link; using it removes your email from our list immediately.',
            },
            disclaimer: {
                title: '6. Disclaimer',
                body: 'The app is provided "as is," without warranties of any kind. We try hard to keep the music theory content accurate, but we don\'t guarantee it\'s error-free or fit for any particular purpose.',
            },
            liability: {
                title: '7. Limitation of liability',
                body: "To the fullest extent permitted by law, we aren't liable for any indirect, incidental, or consequential damages arising from your use of the app.",
            },
            changes: {
                title: '8. Changes to these terms',
                body: 'We may update these terms from time to time. Material changes will be reflected by updating the "Last updated" date above.',
            },
            contact: {
                title: '9. Contact',
                before: 'Questions about these terms? ',
                linkText: 'Open a support ticket',
            },
        },
        seeAlso: { before: 'See also our ', linkText: 'Privacy Policy' },
    },
    unsubscribe: {
        noCloudSync: "This deployment doesn't have cloud sync configured, so unsubscribing isn't available.",
        missingToken: 'Missing unsubscribe token.',
        couldNotUnsubscribe: "Couldn't unsubscribe",
        unsubscribed: "You're unsubscribed",
        noMoreEmails: "You won't receive any more newsletter emails from us.",
    },
    adminTickets: {
        backToInbox: 'Back to inbox',
        unknownUser: 'Unknown user',
        writeReply: 'Write a reply…',
        send: 'Send',
        you: 'You',
        noTickets: 'No tickets yet.',
        supportInbox: 'Support Inbox',
        requiresCloudSync: "The admin inbox requires cloud sync, which isn't configured for this deployment.",
        signInRequired: 'Sign in to access the admin inbox.',
        noAccess: "You don't have access to this page.",
    },
    adminNewsletter: {
        newsletter: 'Newsletter',
        subscriberCount: (n) => `${n} subscriber${n === 1 ? '' : 's'}.`,
        subjectPlaceholder: 'Subject',
        toolbar: {
            bold: 'Bold',
            italic: 'Italic',
            underline: 'Underline',
            heading: 'Heading',
            bulletList: 'Bullet list',
            numberedList: 'Numbered list',
            quote: 'Quote',
            link: 'Link',
            undo: 'Undo',
            redo: 'Redo',
        },
        linkPromptLabel: 'Link URL',
        sentTo: (n) => `Sent to ${n} subscriber${n === 1 ? '' : 's'}.`,
        sendToSubscribers: (n) => `Send to ${n} subscriber${n === 1 ? '' : 's'}`,
        confirmSend: (subject, n) => `Send "${subject}" to all ${n} subscriber${n === 1 ? '' : 's'}? This can't be undone.`,
        cancel: 'Cancel',
        confirmSendButton: 'Confirm send',
        sendHistory: 'Send history',
        noNewslettersSent: 'No newsletters sent yet.',
        recipientCount: (n) => `${n} recipient${n === 1 ? '' : 's'}`,
        requiresCloudSync: "The newsletter composer requires cloud sync, which isn't configured for this deployment.",
        signInRequired: 'Sign in to access the newsletter composer.',
        noAccess: "You don't have access to this page.",
    },
};

export const ro: LegalDict = {
    privacy: {
        eyebrow: 'Legal',
        title: 'Politica de Confidențialitate',
        lastUpdated: (date) => `Ultima actualizare: ${date}`,
        sections: {
            guestMode: {
                title: '1. Modul invitat: nimic nu părăsește dispozitivul tău',
                body: 'Cea mai mare parte a aplicației funcționează fără cont. În modul invitat, progresul tău de exersare, realizările, progresul curriculumului și preferințele sunt stocate doar în stocarea locală a browserului tău. Nu vedem niciodată aceste date — nu ne sunt trimise deloc.',
            },
            accountData: {
                title: '2. Ce colectăm dacă îți creezi un cont',
                intro: 'Crearea unui cont este opțională. Dacă o faci, stocăm:',
                items: [
                    { label: 'Datele de autentificare', text: '— emailul și parola ta, gestionate de furnizorul nostru de autentificare (Supabase).' },
                    { label: 'Informații de profil', text: '— numele de utilizator, numele afișat, biografia și setarea ta public/privat.' },
                    { label: 'Date de exersare', text: '— progresul, finalizarea curriculumului, starea de recapitulare cu repetiție spațiată și datele de gamificare (XP, nivel, realizări), pentru a putea fi sincronizate pe toate dispozitivele tale.' },
                    { label: 'Activitate socială', text: '— urmăririle, postările din fluxul de activitate, comentariile, reacțiile și înregistrările provocărilor, dacă folosești aceste funcționalități.' },
                    { label: 'Fișiere încărcate', text: '— orice fișiere MIDI/Guitar Pro pe care le încarci în Play Along.' },
                    { label: 'Tichete de asistență', text: '— subiectul, categoria și mesajele oricărui tichet pe care îl deschizi.' },
                ],
            },
            newsletter: {
                title: '3. Newsletter',
                body: 'Dacă te abonezi la newsletter, stocăm doar adresa ta de email. Este folosită exclusiv pentru a trimite newsletterul. Apăsarea linkului de dezabonare din orice email de newsletter îți șterge imediat adresa de email din lista noastră — nu este necesară nicio cerere separată.',
            },
            noTracking: {
                title: '4. Fără urmărire, fără publicitate',
                body: 'Nu folosim cookie-uri de analiză, instrumente de urmărire publicitară sau scripturi de urmărire de la terți. Nu vindem și nu partajăm datele tale cu agenți de publicitate.',
            },
            thirdParties: {
                title: '5. Cine altcineva îți vede datele',
                intro: 'Folosim un număr mic de furnizori de servicii pentru a opera aplicația, care procesează date în numele nostru:',
                items: [
                    { label: 'Supabase', text: '— găzduiește baza noastră de date, autentificarea și stocarea fișierelor.' },
                    { label: 'Resend', text: '— livrează emailurile de newsletter. Doar adresa de email și conținutul newsletterului sunt partajate cu acesta în acest scop.' },
                ],
                outro: 'Informațiile de profil public, activitatea publică și clasamentul sunt vizibile celorlalți utilizatori ai aplicației dacă îți setezi profilul ca public — aceasta este o funcționalitate pe care o controlezi tu, nu date partajate cu un terț.',
            },
            retention: {
                title: '6. Cât timp păstrăm datele tale',
                body: 'Datele contului sunt păstrate atât timp cât contul tău există. Abonamentele la newsletter sunt șterse definitiv (nu doar marcate ca inactive) în momentul în care te dezabonezi.',
            },
            rights: {
                title: '7. Drepturile tale',
                before: 'Poți edita sau șterge cea mai mare parte din conținutul tău direct în aplicație — profilul tău, setarea public/privat, postările, comentariile și fișierele încărcate. Pentru orice altceva, inclusiv un export complet sau ștergerea datelor contului tău, sau orice altă cerere de date GDPR, ',
                linkText: 'deschide un tichet de asistență',
                after: ' și ne vom ocupa de ea.',
            },
            children: {
                title: '8. Copii',
                body: 'Aplicația nu este destinată copiilor sub 13 ani și nu colectăm cu bună știință date de la aceștia.',
            },
            changes: {
                title: '9. Modificări ale acestei politici',
                body: 'Este posibil să actualizăm această politică din când în când. Modificările importante vor fi reflectate prin actualizarea datei „Ultima actualizare" de mai sus.',
            },
            contact: {
                title: '10. Contact',
                before: 'Întrebări despre această politică sau despre datele tale? ',
                linkText: 'Deschide un tichet de asistență',
            },
        },
        seeAlso: { before: 'Consultă și ', linkText: 'Termenii și Condițiile' },
    },
    terms: {
        eyebrow: 'Legal',
        title: 'Termeni și Condiții',
        lastUpdated: (date) => `Ultima actualizare: ${date}`,
        sections: {
            acceptance: {
                title: '1. Acceptarea termenilor',
                body: 'Prin utilizarea Music Theory Cheatsheet („aplicația"), ești de acord cu acești termeni. Dacă nu ești de acord, te rugăm să nu folosești aplicația.',
            },
            service: {
                title: '2. Serviciul',
                body: [
                    'Aplicația oferă instrumente interactive de exersare a teoriei muzicale — tastatură de chitară, notație pe portativ, antrenament auditiv, ritm, cântă alături și un curriculum ghidat — împreună cu funcționalități sociale opționale (profiluri publice, urmăriri, flux de activitate, provocări între prieteni și un clasament).',
                    'Poți folosi cea mai mare parte a aplicației în modul invitat, fără cont: progresul tău este stocat doar pe dispozitivul tău. Crearea unui cont este opțională și adaugă sincronizare în cloud (astfel încât progresul tău te urmărește pe toate dispozitivele) plus funcționalitățile sociale.',
                    'Aplicația este momentan gratuită. Este posibil să introducem niveluri plătite sau pe abonament în viitor; dacă o facem, vom anunța clar acest lucru înainte ca orice funcționalitate existentă să fie plasată în spatele unui sistem de plată.',
                ],
            },
            accounts: {
                title: '3. Conturi',
                body: 'Dacă îți creezi un cont, ești responsabil pentru păstrarea în siguranță a datelor tale de autentificare și pentru orice activitate desfășurată din contul tău. Furnizează o adresă de email pe care chiar o controlezi — o folosim pentru autentificare și, dacă apare o problemă cu contul tău, pentru a te contacta.',
            },
            content: {
                title: '4. Conținutul tău',
                body: [
                    'Detaliile de profil (nume de utilizator, biografie), postările din fluxul de activitate, comentariile, reacțiile și rezultatele provocărilor sunt vizibile altor utilizatori atunci când profilul tău este setat ca public. Poți schimba profilul tău la privat oricând din pagina de profil.',
                    'Nu posta nimic ilegal, hărțuitor sau care încalcă drepturile altcuiva. Putem elimina conținut sau suspenda conturi care încalcă această regulă.',
                ],
            },
            newsletter: {
                title: '5. Newsletter',
                body: 'Abonarea la newsletter este opțională și necesită doar o adresă de email. Fiecare email de newsletter include un link de dezabonare cu un singur clic; folosirea acestuia îți elimină imediat adresa de email din lista noastră.',
            },
            disclaimer: {
                title: '6. Declinarea răspunderii',
                body: 'Aplicația este furnizată „ca atare", fără garanții de niciun fel. Ne străduim să păstrăm conținutul de teorie muzicală corect, dar nu garantăm că este lipsit de erori sau adecvat unui anumit scop.',
            },
            liability: {
                title: '7. Limitarea răspunderii',
                body: 'În măsura maximă permisă de lege, nu suntem răspunzători pentru niciun fel de daune indirecte, incidentale sau pe cale de consecință rezultate din utilizarea aplicației de către tine.',
            },
            changes: {
                title: '8. Modificări ale acestor termeni',
                body: 'Este posibil să actualizăm acești termeni din când în când. Modificările importante vor fi reflectate prin actualizarea datei „Ultima actualizare" de mai sus.',
            },
            contact: {
                title: '9. Contact',
                before: 'Întrebări despre acești termeni? ',
                linkText: 'Deschide un tichet de asistență',
            },
        },
        seeAlso: { before: 'Consultă și ', linkText: 'Politica de Confidențialitate' },
    },
    unsubscribe: {
        noCloudSync: 'Această implementare nu are sincronizarea în cloud configurată, deci dezabonarea nu este disponibilă.',
        missingToken: 'Lipsește token-ul de dezabonare.',
        couldNotUnsubscribe: 'Dezabonarea a eșuat',
        unsubscribed: 'Te-ai dezabonat',
        noMoreEmails: 'Nu vei mai primi emailuri de newsletter de la noi.',
    },
    adminTickets: {
        backToInbox: 'Înapoi la inbox',
        unknownUser: 'Utilizator necunoscut',
        writeReply: 'Scrie un răspuns…',
        send: 'Trimite',
        you: 'Tu',
        noTickets: 'Niciun tichet încă.',
        supportInbox: 'Inbox Asistență',
        requiresCloudSync: 'Inboxul de admin necesită sincronizare în cloud, care nu este configurată pentru această implementare.',
        signInRequired: 'Conectează-te pentru a accesa inboxul de admin.',
        noAccess: 'Nu ai acces la această pagină.',
    },
    adminNewsletter: {
        newsletter: 'Newsletter',
        subscriberCount: (n) => `${n} ${n === 1 ? 'abonat' : 'abonați'}.`,
        subjectPlaceholder: 'Subiect',
        toolbar: {
            bold: 'Aldin',
            italic: 'Cursiv',
            underline: 'Subliniat',
            heading: 'Titlu',
            bulletList: 'Listă cu puncte',
            numberedList: 'Listă numerotată',
            quote: 'Citat',
            link: 'Link',
            undo: 'Anulează',
            redo: 'Refă',
        },
        linkPromptLabel: 'URL link',
        sentTo: (n) => `Trimis către ${n} ${n === 1 ? 'abonat' : 'abonați'}.`,
        sendToSubscribers: (n) => `Trimite către ${n} ${n === 1 ? 'abonat' : 'abonați'}`,
        confirmSend: (subject, n) => `Trimiți „${subject}" către toți cei ${n} ${n === 1 ? 'abonat' : 'abonați'}? Această acțiune nu poate fi anulată.`,
        cancel: 'Anulează',
        confirmSendButton: 'Confirmă trimiterea',
        sendHistory: 'Istoric trimiteri',
        noNewslettersSent: 'Niciun newsletter trimis încă.',
        recipientCount: (n) => `${n} ${n === 1 ? 'destinatar' : 'destinatari'}`,
        requiresCloudSync: 'Compunerea newsletterului necesită sincronizare în cloud, care nu este configurată pentru această implementare.',
        signInRequired: 'Conectează-te pentru a accesa compunerea newsletterului.',
        noAccess: 'Nu ai acces la această pagină.',
    },
};
