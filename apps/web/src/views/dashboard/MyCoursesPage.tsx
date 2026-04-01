import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { PlayCircle, Clock, Award, BookOpen } from 'lucide-react';

const courses = [
  {
    id: 1,
    title: 'Complete Web Development Bootcamp',
    progress: 35,
    duration: '40 hours',
    completed: 14,
    total: 40,
    expires: 'Lifetime access',
    image: 'https://images.unsplash.com/photo-1771408427146-09be9a1d4535?w=200',
  },
  {
    id: 2,
    title: 'Data Science & Machine Learning',
    progress: 68,
    duration: '35 hours',
    completed: 24,
    total: 35,
    expires: 'Lifetime access',
    image: 'https://images.unsplash.com/photo-1762330917056-e69b34329ddf?w=200',
  },
  {
    id: 3,
    title: 'Digital Marketing Masterclass',
    progress: 100,
    duration: '28 hours',
    completed: 28,
    total: 28,
    expires: 'Lifetime access',
    image: 'https://images.unsplash.com/photo-1621743018966-29194999d736?w=200',
  },
];

export function MyCoursesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl mb-2">My Courses</h1>
        <p className="text-slate-600">Continue your learning journey</p>
      </div>
      
      <div className="flex gap-4 mb-6">
        <Button variant="primary" size="sm">All Courses</Button>
        <Button variant="outline" size="sm">In Progress</Button>
        <Button variant="outline" size="sm">Completed</Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {courses.map((course) => (
          <Card key={course.id} hover>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 h-32 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl">{course.title}</h3>
                  {course.progress === 100 && (
                    <Badge variant="success">
                      <Award className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <span>•</span>
                  <span>{course.completed} of {course.total} lessons</span>
                  <span>•</span>
                  <span>{course.expires}</span>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-slate-600">Progress</span>
                    <span className="text-indigo-600">{course.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {course.progress === 100 ? 'Review' : 'Continue Learning'}
                  </Button>
                  {course.progress === 100 && (
                    <Button variant="outline">
                      <Award className="w-4 h-4 mr-2" />
                      View Certificate
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {courses.length === 0 && (
        <Card className="text-center py-12">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl mb-2">No courses yet</h3>
          <p className="text-slate-600 mb-6">Start learning by browsing our course catalog</p>
          <Button>Browse Courses</Button>
        </Card>
      )}
    </div>
  );
}
