import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Bell, CheckCircle, Info, AlertCircle } from 'lucide-react';

const notifications = [
  { id: 1, type: 'success', title: 'Course Completed', message: 'Congratulations! You completed Digital Marketing', time: '2 hours ago' },
  { id: 2, type: 'info', title: 'New Course Available', message: 'Check out our new React Advanced course', time: '5 hours ago' },
  { id: 3, type: 'warning', title: 'Live Class Reminder', message: 'React Workshop starts in 24 hours', time: '1 day ago' },
];

export function NotificationsPage() {
  return (
    <div>
      <h1 className="text-3xl mb-8">Notifications</h1>
      
      <div className="grid grid-cols-1 gap-4">
        {notifications.map((notif) => (
          <Card key={notif.id} hover>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded flex items-center justify-center ${
                notif.type === 'success' ? 'bg-green-100' : notif.type === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
              }`}>
                {notif.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                {notif.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
                {notif.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600" />}
              </div>
              <div className="flex-1">
                <h3 className="mb-1">{notif.title}</h3>
                <p className="text-sm text-slate-600 mb-2">{notif.message}</p>
                <span className="text-xs text-slate-500">{notif.time}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
