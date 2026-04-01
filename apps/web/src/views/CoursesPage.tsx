'use client';

import { useState } from 'react';
import { CourseCard } from '../components/CourseCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '../components/Button';

const courses = [
  {
    id: '1',
    title: 'Complete Web Development Bootcamp',
    description: 'Master HTML, CSS, JavaScript, React, Node.js and more in this comprehensive course.',
    image: 'https://images.unsplash.com/photo-1771408427146-09be9a1d4535?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMHN0dWRlbnQlMjBsYXB0b3B8ZW58MXx8fHwxNzc1MDQ0OTc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 89.99,
    duration: '40 hours',
    students: 15420,
    rating: 4.8,
    tags: ['Bestseller'],
    instructor: 'Dr. Sarah Johnson',
  },
  {
    id: '2',
    title: 'Data Science & Machine Learning',
    description: 'Learn Python, pandas, scikit-learn, and build real-world ML projects.',
    image: 'https://images.unsplash.com/photo-1762330917056-e69b34329ddf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwY291cnNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NzUwNTgzMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 99.99,
    duration: '35 hours',
    students: 12300,
    rating: 4.9,
    tags: ['New'],
    instructor: 'Prof. Michael Chen',
  },
  {
    id: '3',
    title: 'Digital Marketing Masterclass',
    description: 'Complete guide to SEO, social media marketing, content marketing, and analytics.',
    image: 'https://images.unsplash.com/photo-1621743018966-29194999d736?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBkZXNrfGVufDF8fHx8MTc3NTA1Njk2MHww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 79.99,
    duration: '28 hours',
    students: 9800,
    rating: 4.7,
    tags: ['Bestseller'],
    instructor: 'Emily Martinez',
  },
  {
    id: '4',
    title: 'UI/UX Design Fundamentals',
    description: 'Learn user interface and user experience design from scratch with practical projects.',
    image: 'https://images.unsplash.com/photo-1621743018966-29194999d736?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBkZXNrfGVufDF8fHx8MTc3NTA1Njk2MHww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 69.99,
    duration: '25 hours',
    students: 8500,
    rating: 4.6,
    instructor: 'James Wilson',
  },
  {
    id: '5',
    title: 'Python Programming Complete Course',
    description: 'From basics to advanced Python programming with real-world projects.',
    image: 'https://images.unsplash.com/photo-1762330917056-e69b34329ddf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwY291cnNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NzUwNTgzMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 84.99,
    duration: '32 hours',
    students: 11200,
    rating: 4.8,
    tags: ['New'],
    instructor: 'Dr. Lisa Anderson',
  },
  {
    id: '6',
    title: 'Cloud Computing with AWS',
    description: 'Master Amazon Web Services and cloud architecture concepts.',
    image: 'https://images.unsplash.com/photo-1771408427146-09be9a1d4535?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMHN0dWRlbnQlMjBsYXB0b3B8ZW58MXx8fHwxNzc1MDQ0OTc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 94.99,
    duration: '38 hours',
    students: 7600,
    rating: 4.7,
    instructor: 'Robert Kumar',
  },
];

const categories = ['All', 'Web Development', 'Data Science', 'Design', 'Marketing', 'Business'];

export function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-3">All Courses</h1>
          <p className="text-slate-600 text-lg">Browse our extensive collection of expert-led courses</p>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <Button variant="outline">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
          
          <div className="flex gap-2 mt-4 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Course Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-slate-600">{courses.length} courses found</p>
            <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500">
              <option>Most Popular</option>
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Highest Rated</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
        
        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-12">
          <Button variant="outline" size="sm">Previous</Button>
          <Button variant="primary" size="sm">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
}
