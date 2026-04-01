import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Plus } from 'lucide-react';

export function ManagePracticeExamsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl">Manage Practice Exams</h1>
        <Button><Plus className="w-4 h-4 mr-2" />Create Exam</Button>
      </div>
      <Card><p className="text-slate-600">Practice exams management interface</p></Card>
    </div>
  );
}
