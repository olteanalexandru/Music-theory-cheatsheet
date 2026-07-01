import type { RhythmLesson } from '@/app/utils/rhythmLessons';
import type { RhythmEvent } from '@/app/utils/rhythmData';

const note = (duration: RhythmEvent['duration'], beats: number): RhythmEvent => ({ type: 'note', duration, beats });
const rest = (duration: RhythmEvent['duration'], beats: number): RhythmEvent => ({ type: 'rest', duration, beats });

export const RHYTHM_LESSONS_RO: RhythmLesson[] = [
    {
        id: 'beats-and-values',
        title: '1. Timpi și Valori de Note',
        summary: 'Ce este un „timp" și cum îl împart valorile de note.',
        body: [
            'Un timp este pulsul regulat pe care ai bate piciorul. Valorile de note îți spun câți timpi durează un sunet: o pătrime primește 1 timp, o jumătate primește 2, iar o întreagă primește 4.',
            'Bate piciorul regulat în timp ce fiecare exemplu se redă — notele mai lungi pur și simplu sună prin mai mulți timpi înainte să înceapă nota următoare.',
        ],
        examples: [
            { label: 'Notă întreagă (4 timpi)', counting: '1   2   3   4', timeSig: '4/4', events: [note('whole', 4)] },
            { label: 'Note de jumătate (câte 2 timpi)', counting: '1   2   3   4', timeSig: '4/4', events: [note('half', 2), note('half', 2)] },
            { label: 'Pătrimi (câte 1 timp)', counting: '1   2   3   4', timeSig: '4/4', events: [note('quarter', 1), note('quarter', 1), note('quarter', 1), note('quarter', 1)] },
        ],
    },
    {
        id: 'subdivision',
        title: '2. Subdiviziune: Optimi',
        summary: 'Împărțirea unui timp în jumătate și numărarea „1 +".',
        body: [
            'O optime este jumătate dintr-un timp — două optimi încap în spațiul unei pătrime. Muzicienii numără optimea de pe „contratimpi" ca „și" (scris „+"), astfel că o măsură completă de optimi în 4/4 se numără „1 + 2 + 3 + 4 +".',
            'Încearcă să numeri cu voce tare împreună cu exemplul: spune „1" exact când auzi prima notă, „+" exact la jumătatea distanței până la timpul următor.',
        ],
        examples: [
            { label: 'Pătrime, apoi două optimi, repetat', counting: '1   2 +  3   4 +', timeSig: '4/4', events: [note('quarter', 1), note('eighth', 0.5), note('eighth', 0.5), note('quarter', 1), note('eighth', 0.5), note('eighth', 0.5)] },
            { label: 'Numai optimi', counting: '1 + 2 + 3 + 4 +', timeSig: '4/4', events: Array.from({ length: 8 }, () => note('eighth', 0.5)) },
        ],
    },
    {
        id: 'rests',
        title: '3. Pauze: Tăcerea Care Numără Tot',
        summary: 'O pauză ocupă exact atâta timp cât o notă — doar că rămâne în tăcere.',
        body: [
            'Pauzele sunt ușor de grăbit deoarece nu se aude nimic, dar ele ocupă timp real în măsură. Continuă să numeri prin ele cu același tempo regulat și intră exact la timp pentru nota următoare.',
            'În exemplul de mai jos, numără „1, 2" prin pauza de jumătate, apoi intră exact pe timpul 3.',
        ],
        examples: [
            { label: 'Pauză de jumătate, apoi două pătrimi', counting: '1   2   3   4', timeSig: '4/4', events: [rest('half', 2), note('quarter', 1), note('quarter', 1)] },
            { label: 'Pătrime, pauză de pătrime, alternând', counting: '1   2   3   4', timeSig: '4/4', events: [note('quarter', 1), rest('quarter', 1), note('quarter', 1), rest('quarter', 1)] },
        ],
    },
    {
        id: 'dotted-notes',
        title: '4. Note cu Punct',
        summary: 'Un punct adaugă jumătate din valoarea proprie a notei.',
        body: [
            'Un punct după o notă o face să dureze de o dată și jumătate mai mult: o pătrime cu punct (1 + ½ = 1½ timpi) este deseori urmată de o singură optime pentru a umple jumătatea de timp rămasă — o combinație foarte frecventă.',
            'Ascultă senzația ușor „lung-scurt" a perechii pătrime cu punct + optime — este ritmul de sub nenumărate linii de bas și melodii.',
        ],
        examples: [
            { label: 'Pătrime cu punct + optime, de două ori', counting: '1   . +  2   . +', timeSig: '4/4', events: [note('dotted-quarter', 1.5), note('eighth', 0.5), note('dotted-quarter', 1.5), note('eighth', 0.5)] },
            { label: 'Jumătate cu punct + pătrime', counting: '1   2   3   4', timeSig: '4/4', events: [note('dotted-half', 3), note('quarter', 1)] },
        ],
    },
    {
        id: 'sixteenths',
        title: '5. Șaisprezecimi',
        summary: 'Împărțirea unui timp în patru și numărarea „1 e + a".',
        body: [
            'O șaisprezecime este un sfert dintr-un timp — patru încap acolo unde era o pătrime. Silabele standard de numărare sunt „1 e + a, 2 e + a…" Spune-le uniform: fiecare silabă are exact aceeași lungime.',
            'Aceasta este cea mai rapidă subdiviziune din această serie de lecții — mergi lent la început și lasă silabele de numărare să-ți ghideze mâna sau piciorul.',
        ],
        examples: [
            { label: 'Un timp de șaisprezecimi, apoi pătrimi', counting: '1 e + a 2   3   4', timeSig: '4/4', events: [note('sixteenth', 0.25), note('sixteenth', 0.25), note('sixteenth', 0.25), note('sixteenth', 0.25), note('quarter', 1), note('quarter', 1), note('quarter', 1)] },
            { label: 'Șaisprezecimi pe fiecare timp', counting: '1 e + a 2 e + a', timeSig: '2/4', events: Array.from({ length: 8 }, () => note('sixteenth', 0.25)) },
        ],
    },
    {
        id: 'time-signatures',
        title: '6. Măsuri (Indicații de Timp)',
        summary: 'Numărul de sus numără timpii pe măsură; cel de jos alege valoarea de notă care primește un timp.',
        body: [
            'În 4/4, sunt 4 timpi pe măsură și pătrimea primește 1 timp — este cel mai obișnuit metru în muzica populară. 3/4 are doar 3 timpi pe măsură, dând muzicii un simț de vals. 6/8 grupează tot în seturi de câte 3, dar cu un puls de optimi mai rapid și mai curgător.',
            'Compară cum aceeași idee — un prim timp puternic — se simte diferit în aceste metre.',
        ],
        examples: [
            { label: '4/4 — patru timpi egali', counting: '1   2   3   4', timeSig: '4/4', events: Array.from({ length: 4 }, () => note('quarter', 1)) },
            { label: '3/4 — trei timpi (simț de vals)', counting: '1   2   3', timeSig: '3/4', events: Array.from({ length: 3 }, () => note('quarter', 1)) },
            { label: '6/8 — două grupe de câte trei optimi', counting: '1 + a 2 + a', timeSig: '6/8', events: Array.from({ length: 6 }, () => note('eighth', 0.5)) },
        ],
    },
    {
        id: 'triplets',
        title: '7. Triole',
        summary: 'Potrivirea a 3 note uniform espaciate în spațiul rezervat în mod normal pentru 2.',
        body: [
            'O triolă de optimi introduce trei note egale într-un timp, în loc de cele două optimi obișnuite. Numără-o „1 tri-o-lă, 2 tri-o-lă" — fiecare silabă cade uniform de-a lungul timpului.',
            'Triolele se simt vizibil diferit față de subdiviziunea dreaptă — ascultă senzația rulantă, de trei contra timp.',
        ],
        examples: [
            { label: 'Triole de optimi, toți cei patru timpi', counting: '1 tri lă 2 tri lă 3 tri lă 4 tri lă', timeSig: '4/4', events: Array.from({ length: 12 }, () => note('triplet-eighth', 1 / 3)) },
            { label: 'Timp de triolă, apoi pătrimi drepte', counting: '1 tri lă 2   3   4', timeSig: '4/4', events: [note('triplet-eighth', 1 / 3), note('triplet-eighth', 1 / 3), note('triplet-eighth', 1 / 3), note('quarter', 1), note('quarter', 1), note('quarter', 1)] },
        ],
    },
    {
        id: 'putting-it-together',
        title: '8. Totul Împreună',
        summary: 'Un tipar mixt care combină tot ce am văzut mai sus — încălzirea ta înainte de Bate Ritmul.',
        body: [
            'Ritmurile reale combină liber durate și pauze. Ascultă tiparul complet de mai jos de câteva ori, numărând împreună, apoi mergi la tab-ul Bate Ritmul pentru a reda singur tipare ca acesta la timp.',
        ],
        examples: [
            {
                label: 'Tipar mixt',
                counting: '1   2 +  3 e+a 4',
                timeSig: '4/4',
                events: [
                    note('quarter', 1),
                    rest('eighth', 0.5),
                    note('eighth', 0.5),
                    note('sixteenth', 0.25), note('sixteenth', 0.25), note('sixteenth', 0.25), note('sixteenth', 0.25),
                    note('quarter', 1),
                ],
            },
        ],
    },
];
