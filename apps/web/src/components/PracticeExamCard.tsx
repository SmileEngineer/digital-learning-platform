import Link from 'next/link';
import { Badge } from './Badge';
import { Button } from './Button';
import { Clock, FileText, Award } from 'lucide-react';

interface PracticeExamCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  questions?: number;
  timeLimit?: string;
  attempts?: number;
  passingScore?: number;
}

export function PracticeExamCard({
  id,
  title,
  description,
  price,
  questions = 0,
  timeLimit = 'TBD',
  attempts = 1,
  passingScore = 0,
}: PracticeExamCardProps) {
  return (
    <Link href={`/practice-exams/${id}`} className="group">
      <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg line-clamp-1">{title}</h3>
              <Badge variant="info" size="sm">{questions} questions</Badge>
            </div>
          </div>
        </div>
        
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{description}</p>
        
        <div className="space-y-2 mb-4 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Time Limit</span>
            </div>
            <span>{timeLimit}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Attempts</span>
            </div>
            <span>{attempts} {attempts === 1 ? 'attempt' : 'attempts'}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Passing Score</span>
            </div>
            <span>{passingScore}%</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
          <span className="text-2xl text-indigo-600">${price}</span>
          <Button size="sm">View Exam</Button>
        </div>
      </div>
    </Link>
  );
}
