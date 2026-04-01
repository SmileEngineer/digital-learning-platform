import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { 
  BookOpen, 
  FileText, 
  Video, 
  ClipboardList, 
  Package, 
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';

export function DashboardOverviewPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Dashboard</h1>
        <p className="text-slate-600">Welcome back! Here's your learning progress.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100">Courses</span>
            <BookOpen className="w-5 h-5 text-blue-200" />
          </div>
          <div className="text-3xl mb-1">5</div>
          <div className="text-sm text-blue-100">3 in progress</div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-100">eBooks</span>
            <FileText className="w-5 h-5 text-purple-200" />
          </div>
          <div className="text-3xl mb-1">12</div>
          <div className="text-sm text-purple-100">All downloaded</div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100">Live Classes</span>
            <Video className="w-5 h-5 text-green-200" />
          </div>
          <div className="text-3xl mb-1">2</div>
          <div className="text-sm text-green-100">Upcoming</div>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-100">Exams</span>
            <ClipboardList className="w-5 h-5 text-orange-200" />
          </div>
          <div className="text-3xl mb-1">3</div>
          <div className="text-sm text-orange-100">Available</div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-xl mb-4">Continue Learning</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="w-16 h-12 bg-slate-200 rounded"></div>
                <div className="flex-1">
                  <h3 className="text-sm mb-1">Complete Web Development Bootcamp</h3>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">35% complete</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card>
          <h2 className="text-xl mb-4">Upcoming Live Classes</h2>
          <div className="space-y-4">
            {[
              { title: 'Advanced React Patterns', date: 'April 15', time: '2:00 PM' },
              { title: 'Machine Learning Masterclass', date: 'April 18', time: '10:00 AM' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-indigo-100 rounded flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm mb-1">{item.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span>{item.date}</span>
                    <span>•</span>
                    <span>{item.time}</span>
                  </div>
                  <Badge variant="warning" size="sm" className="mt-2">Starts in 3 days</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h2 className="text-xl mb-4">Recent Activity</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Completed lesson 5 in Web Development</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Downloaded JavaScript eBook</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Enrolled in React Workshop</span>
            </div>
          </div>
        </Card>
        
        <Card>
          <h2 className="text-xl mb-4">Learning Streak</h2>
          <div className="text-center">
            <div className="text-5xl text-indigo-600 mb-2">7</div>
            <div className="text-slate-600">days in a row</div>
            <div className="mt-4 flex justify-center gap-1">
              {[1,2,3,4,5,6,7].map(i => (
                <div key={i} className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center">
                  <span className="text-indigo-600 text-xs">✓</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        
        <Card>
          <h2 className="text-xl mb-4">Pending Orders</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <Package className="w-5 h-5 text-amber-600" />
              <div className="flex-1">
                <div className="text-sm mb-1">Python Book</div>
                <Badge variant="warning" size="sm">Shipping</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
