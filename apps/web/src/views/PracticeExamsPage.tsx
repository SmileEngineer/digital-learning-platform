import { PracticeExamCard } from '../components/PracticeExamCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '../components/Button';

const exams = [
  {
    id: '1',
    title: 'AWS Certified Solutions Architect Practice Exam',
    description: 'Comprehensive practice test covering all exam topics with detailed explanations.',
    price: 39.99,
    questions: 65,
    timeLimit: '130 minutes',
    attempts: 3,
    passingScore: 72,
  },
  {
    id: '2',
    title: 'React Developer Certification Mock Test',
    description: 'Test your React knowledge with real-world scenarios and best practices.',
    price: 29.99,
    questions: 50,
    timeLimit: '90 minutes',
    attempts: 2,
    passingScore: 70,
  },
  {
    id: '3',
    title: 'Python Professional Certification Exam',
    description: 'Advanced Python concepts, algorithms, and data structures assessment.',
    price: 34.99,
    questions: 75,
    timeLimit: '120 minutes',
    attempts: 3,
    passingScore: 75,
  },
  {
    id: '4',
    title: 'Digital Marketing Expert Practice Test',
    description: 'Comprehensive exam covering SEO, SEM, social media, and analytics.',
    price: 24.99,
    questions: 60,
    timeLimit: '100 minutes',
    attempts: 2,
    passingScore: 70,
  },
];

export function PracticeExamsPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl mb-3">Practice Exams</h1>
          <p className="text-slate-600 text-lg">Test your knowledge and prepare for certifications</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search exams..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <Button variant="outline">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-slate-600">{exams.length} exams available</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((exam) => (
            <PracticeExamCard key={exam.id} {...exam} />
          ))}
        </div>
      </div>
    </div>
  );
}
