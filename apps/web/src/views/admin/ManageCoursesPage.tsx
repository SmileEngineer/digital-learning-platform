import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

const courses = [
  { id: 1, title: 'Web Development Bootcamp', students: 1245, price: 89.99, status: 'published' },
  { id: 2, title: 'Data Science Course', students: 892, price: 99.99, status: 'published' },
  { id: 3, title: 'React Advanced', students: 0, price: 79.99, status: 'draft' },
];

export function ManageCoursesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl">Manage Courses</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>
      
      <Card className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
          <select className="px-4 py-2 border border-slate-300 rounded-lg">
            <option>All Status</option>
            <option>Published</option>
            <option>Draft</option>
          </select>
        </div>
      </Card>
      
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm">Course Title</th>
                <th className="text-left px-6 py-3 text-sm">Students</th>
                <th className="text-left px-6 py-3 text-sm">Price</th>
                <th className="text-left px-6 py-3 text-sm">Status</th>
                <th className="text-left px-6 py-3 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-slate-200 last:border-0">
                  <td className="px-6 py-4">{course.title}</td>
                  <td className="px-6 py-4">{course.students}</td>
                  <td className="px-6 py-4">${course.price}</td>
                  <td className="px-6 py-4">
                    <Badge variant={course.status === 'published' ? 'success' : 'neutral'}>
                      {course.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-slate-100 rounded">
                        <Edit className="w-4 h-4 text-slate-600" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
