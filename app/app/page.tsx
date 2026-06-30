import Link from 'next/link';
import { ArrowRight, Guitar, Compass, Music, Drum, Ear, PlayCircle, BookOpen, type LucideIcon } from 'lucide-react';

const TOOLS: { href: string; title: string; description: string; icon: LucideIcon }[] = [
    {
        href: '/app/fretboard',
        title: 'Fretboard Navigator',
        description: 'Explore modes, scales, arpeggios, and chords on bass or guitar.',
        icon: Guitar,
    },
    {
        href: '/app/circle-of-fifths',
        title: 'Circle of Fifths',
        description: 'Visualize key relationships and click around the circle to hear them.',
        icon: Compass,
    },
    {
        href: '/app/staff',
        title: 'Interactive Staff',
        description: 'Read and play notes on a standard staff in any key.',
        icon: Music,
    },
    {
        href: '/app/rhythm',
        title: 'Rhythm Trainer',
        description: 'Practice reading and counting rhythmic notation.',
        icon: Drum,
    },
    {
        href: '/app/ear-training',
        title: 'Ear Training',
        description: 'Drill intervals, chords, scales, and progressions by ear.',
        icon: Ear,
    },
    {
        href: '/app/play-along',
        title: 'Play Along',
        description: 'Load a MIDI or Guitar Pro file and play along with real-time feedback.',
        icon: PlayCircle,
    },
    {
        href: '/app/curriculum',
        title: 'Curriculum',
        description: 'Work through structured lessons and quizzes, from fundamentals to advanced harmony.',
        icon: BookOpen,
    },
];

export default function AppHubPage() {
    return (
        <div>
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold theme-text mb-2">Practice Tools</h1>
                <p className="theme-secondary-text">Pick a tool to start practicing. Your audio and MIDI settings carry over between them.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TOOLS.map(({ href, title, description, icon: Icon }) => (
                    <Link key={href} href={href} className="group theme-card tool-card rounded-xl p-5 shadow-lg">
                        <div className="flex items-center justify-center w-11 h-11 rounded-lg theme-accent-soft-bg mb-3">
                            <Icon size={22} className="theme-secondary-text" />
                        </div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <h2 className="text-lg font-semibold theme-text">{title}</h2>
                            <ArrowRight
                                size={16}
                                className="theme-secondary-text opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                            />
                        </div>
                        <p className="text-sm theme-secondary-text">{description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
