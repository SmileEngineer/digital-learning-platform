import { LiveClassCard } from '../components/LiveClassCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '../components/Button';

const liveClasses = [
  {
    id: '1',
    title: 'Advanced React Patterns Workshop',
    description: 'Learn advanced React patterns including compound components, render props, and hooks.',
    image: 'https://images.unsplash.com/photo-1766074903112-79661da9ab45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZlJTIwY2xhc3MlMjB3ZWJpbmFyJTIwdGVhY2hpbmd8ZW58MXx8fHwxNzc1MDU4MzEzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 49.99,
    date: 'April 15, 2026',
    time: '2:00 PM EST',
    duration: '3 hours',
    instructor: 'Alex Thompson',
    spotsLeft: 8,
  },
  {
    id: '2',
    title: 'Machine Learning Masterclass',
    description: 'Deep dive into ML algorithms, neural networks, and practical implementations.',
    image: 'https://images.unsplash.com/photo-1762330917056-e69b34329ddf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwY291cnNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NzUwNTgzMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 79.99,
    date: 'April 18, 2026',
    time: '10:00 AM EST',
    duration: '4 hours',
    instructor: 'Dr. Maria Rodriguez',
    spotsLeft: 15,
  },
  {
    id: '3',
    title: 'UI/UX Design Sprint',
    description: 'Interactive session on design thinking, prototyping, and user research.',
    image: 'https://images.unsplash.com/photo-1621743018966-29194999d736?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBkZXNrfGVufDF8fHx8MTc3NTA1Njk2MHww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 59.99,
    date: 'April 22, 2026',
    time: '1:00 PM EST',
    duration: '3.5 hours',
    instructor: 'Jessica Lee',
    spotsLeft: 5,
  },
];

export function LiveClassesPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl mb-3">Live Classes</h1>
          <p className="text-slate-600 text-lg">Join interactive live sessions with expert instructors</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search live classes..."
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
          <p className="text-slate-600">{liveClasses.length} upcoming classes</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveClasses.map((liveClass) => (
            <LiveClassCard key={liveClass.id} {...liveClass} />
          ))}
        </div>
      </div>
    </div>
  );
}
