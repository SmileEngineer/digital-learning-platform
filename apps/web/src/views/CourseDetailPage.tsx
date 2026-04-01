'use client';

import { useParams } from 'next/navigation';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { CourseCard } from '../components/CourseCard';
import { 
  Clock, 
  Users, 
  Star, 
  Award, 
  Download, 
  PlayCircle,
  CheckCircle,
  ChevronDown,
  Globe,
  Signal
} from 'lucide-react';

const relatedCourses = [
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
];

export function CourseDetailPage() {
  const { id } = useParams();
  
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="mb-6">
              <div className="flex gap-2 mb-3">
                <Badge variant="bestseller">Bestseller</Badge>
                <Badge variant="success">Updated April 2026</Badge>
              </div>
              <h1 className="text-4xl mb-3">Complete Web Development Bootcamp</h1>
              <p className="text-lg text-slate-600 mb-4">
                Master HTML, CSS, JavaScript, React, Node.js and more. Build real-world projects and launch your web development career.
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span>4.8 (2,340 ratings)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>15,420 students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>40 hours</span>
                </div>
              </div>
              
              <div className="mt-4 text-sm">
                <p className="text-slate-600">
                  Created by <span className="text-indigo-600">Dr. Sarah Johnson</span>
                </p>
              </div>
            </div>
            
            {/* Course Image */}
            <div className="mb-8">
              <img 
                src="https://images.unsplash.com/photo-1771408427146-09be9a1d4535?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMHN0dWRlbnQlMjBsYXB0b3B8ZW58MXx8fHwxNzc1MDQ0OTc4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Course"
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            
            {/* What You'll Learn */}
            <Card className="mb-8">
              <h2 className="text-2xl mb-4">What you'll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Build responsive websites with HTML, CSS, and JavaScript',
                  'Master modern React and Redux for frontend development',
                  'Create RESTful APIs with Node.js and Express',
                  'Work with MongoDB and SQL databases',
                  'Deploy applications to production environments',
                  'Implement authentication and authorization',
                  'Write clean, maintainable code following best practices',
                  'Build a complete full-stack application portfolio',
                ].map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Course Content */}
            <Card className="mb-8">
              <h2 className="text-2xl mb-4">Course Content</h2>
              <p className="text-slate-600 mb-4">12 sections • 120 lectures • 40h total length</p>
              
              <div className="space-y-2">
                {[
                  { title: 'Introduction to Web Development', lectures: 8, duration: '45min' },
                  { title: 'HTML Fundamentals', lectures: 12, duration: '2h 15min' },
                  { title: 'CSS and Responsive Design', lectures: 15, duration: '3h 20min' },
                  { title: 'JavaScript Basics', lectures: 18, duration: '4h 30min' },
                  { title: 'Advanced JavaScript', lectures: 14, duration: '3h 45min' },
                  { title: 'React Fundamentals', lectures: 16, duration: '4h 10min' },
                ].map((section, index) => (
                  <details key={index} className="bg-slate-50 border border-slate-200 rounded-lg">
                    <summary className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ChevronDown className="w-4 h-4" />
                        <span>{section.title}</span>
                      </div>
                      <span className="text-sm text-slate-600">
                        {section.lectures} lectures • {section.duration}
                      </span>
                    </summary>
                    <div className="px-4 py-3 border-t border-slate-200">
                      <div className="space-y-2">
                        {[1, 2, 3].map((lecture) => (
                          <div key={lecture} className="flex items-center justify-between text-sm py-2">
                            <div className="flex items-center gap-3">
                              <PlayCircle className="w-4 h-4 text-slate-400" />
                              <span>Lecture {lecture}: Introduction</span>
                              <Badge variant="info" size="sm">Preview</Badge>
                            </div>
                            <span className="text-slate-600">12:34</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </Card>
            
            {/* Requirements */}
            <Card className="mb-8">
              <h2 className="text-2xl mb-4">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>No prior programming experience required</li>
                <li>A computer with internet connection</li>
                <li>Willingness to learn and practice</li>
              </ul>
            </Card>
            
            {/* Description */}
            <Card className="mb-8">
              <h2 className="text-2xl mb-4">Description</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 mb-4">
                  Welcome to the Complete Web Development Bootcamp! This comprehensive course is designed to take you from absolute beginner to professional web developer.
                </p>
                <p className="text-slate-700 mb-4">
                  You'll learn by building real-world projects and applications. By the end of this course, you'll have the skills and portfolio to land your first web development job or freelance gig.
                </p>
                <p className="text-slate-700">
                  This course is constantly updated with new content and improvements based on student feedback. Join thousands of successful students who have transformed their careers with this course.
                </p>
              </div>
            </Card>
            
            {/* Instructor */}
            <Card className="mb-8">
              <h2 className="text-2xl mb-4">Instructor</h2>
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-slate-200 rounded-full flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl mb-1">Dr. Sarah Johnson</h3>
                  <p className="text-slate-600 mb-3">Senior Software Engineer & Educator</p>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      <span>4.8 instructor rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>45,000 students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4" />
                      <span>12 courses</span>
                    </div>
                  </div>
                  <p className="text-slate-700">
                    Sarah has over 10 years of experience in software development and has taught over 45,000 students worldwide. She specializes in web development and is passionate about making coding accessible to everyone.
                  </p>
                </div>
              </div>
            </Card>
            
            {/* FAQ */}
            <Card>
              <h2 className="text-2xl mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {[
                  {
                    q: 'How long do I have access to the course?',
                    a: 'You have lifetime access to this course once purchased.',
                  },
                  {
                    q: 'Do I get a certificate?',
                    a: 'Yes, you receive a certificate of completion when you finish all lectures.',
                  },
                  {
                    q: 'What if I need help?',
                    a: 'You can ask questions in the Q&A section and get support from instructors.',
                  },
                ].map((faq, index) => (
                  <div key={index} className="border-b border-slate-200 pb-4 last:border-0">
                    <h4 className="mb-2">{faq.q}</h4>
                    <p className="text-slate-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <div className="text-3xl text-indigo-600 mb-4">$89.99</div>
                
                <Button fullWidth size="lg" className="mb-3">
                  Buy Now
                </Button>
                <Button fullWidth variant="outline" size="lg" className="mb-6">
                  Add to Cart
                </Button>
                
                <div className="text-center text-sm text-slate-600 mb-6">
                  30-Day Money-Back Guarantee
                </div>
                
                <div className="space-y-3 border-t border-slate-200 pt-6">
                  <h3 className="mb-3">This course includes:</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <span>40 hours on-demand video</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Download className="w-5 h-5 text-slate-400" />
                    <span>Downloadable resources</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Award className="w-5 h-5 text-slate-400" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="w-5 h-5 text-slate-400" />
                    <span>Access on mobile and desktop</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Signal className="w-5 h-5 text-slate-400" />
                    <span>Full lifetime access</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Related Courses */}
        <div className="mt-16">
          <h2 className="text-3xl mb-6">Related Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
