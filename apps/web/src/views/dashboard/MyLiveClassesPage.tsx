import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Video, Calendar, Clock } from 'lucide-react';

const liveClasses = [
  { id: 1, title: 'Advanced React Patterns', date: 'April 15, 2026', time: '2:00 PM EST', status: 'upcoming' },
  { id: 2, title: 'Machine Learning Masterclass', date: 'April 18, 2026', time: '10:00 AM EST', status: 'upcoming' },
  { id: 3, title: 'UI/UX Design Principles', date: 'March 28, 2026', time: '1:00 PM EST', status: 'completed' },
];

export function MyLiveClassesPage() {
  return (
    <div>
      <h1 className="text-3xl mb-8">My Live Classes</h1>
      
      <div className="grid grid-cols-1 gap-4">
        {liveClasses.map((liveClass) => (
          <Card key={liveClass.id} hover>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded flex items-center justify-center">
                <Video className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1">{liveClass.title}</h3>
                <div className="text-sm text-slate-600">
                  {liveClass.date} at {liveClass.time}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={liveClass.status === 'upcoming' ? 'warning' : 'success'}>
                  {liveClass.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                </Badge>
                <Button size="sm">
                  {liveClass.status === 'upcoming' ? 'Join Class' : 'Watch Recording'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
