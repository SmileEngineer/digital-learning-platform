import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { ClipboardList, Award } from 'lucide-react';

const exams = [
  { id: 1, title: 'AWS Solutions Architect', attempts: '2/3', score: 78, status: 'passed' },
  { id: 2, title: 'React Developer Certification', attempts: '1/2', score: 0, status: 'available' },
  { id: 3, title: 'Python Professional', attempts: '3/3', score: 85, status: 'passed' },
];

export function MyPracticeExamsPage() {
  return (
    <div>
      <h1 className="text-3xl mb-8">My Practice Exams</h1>
      
      <div className="grid grid-cols-1 gap-4">
        {exams.map((exam) => (
          <Card key={exam.id} hover>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1">{exam.title}</h3>
                <div className="text-sm text-slate-600">
                  Attempts: {exam.attempts}
                  {exam.score > 0 && ` • Score: ${exam.score}%`}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={exam.status === 'passed' ? 'success' : 'info'}>
                  {exam.status === 'passed' ? 'Passed' : 'Available'}
                </Badge>
                <Button size="sm">
                  {exam.status === 'passed' ? 'Retake' : 'Start Exam'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
