import Curriculum from '@/app/components/Curriculum';

export default function CurriculumPage() {
    return (
        <div>
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold theme-text mb-2">Curriculum</h1>
                <p className="theme-secondary-text">Structured lessons and quizzes, from fundamentals to advanced harmony</p>
            </div>

            <Curriculum />
        </div>
    );
}
