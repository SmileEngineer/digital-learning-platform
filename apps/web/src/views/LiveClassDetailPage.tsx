'use client';

import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { Calendar, Clock, Users, Video, Star } from 'lucide-react';

export function LiveClassDetailPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 5,
    minutes: 32,
    seconds: 45,
  });
  
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Badge variant="warning" className="mb-3">Only 8 spots left</Badge>
              <h1 className="text-4xl mb-3">Advanced React Patterns Workshop</h1>
              <p className="text-lg text-slate-600 mb-4">
                Master advanced React patterns including compound components, render props, custom hooks, and performance optimization techniques in this interactive live session.
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm text-slate-700 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>April 15, 2026 at 2:00 PM EST</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>3 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>42 enrolled</span>
                </div>
              </div>
              
              <p className="text-slate-600">
                Instructor: <span className="text-indigo-600">Alex Thompson</span>
              </p>
            </div>
            
            <div className="mb-8">
              <img 
                src="https://images.unsplash.com/photo-1766074903112-79661da9ab45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZlJTIwY2xhc3MlMjB3ZWJpbmFyJTIwdGVhY2hpbmd8ZW58MXx8fHwxNzc1MDU4MzEzfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Live Class"
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            
            <Card className="mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
              <h2 className="text-2xl mb-4 text-indigo-900">Class Starts In</h2>
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <div key={unit} className="text-center">
                    <div className="text-4xl text-indigo-600 mb-2">{value}</div>
                    <div className="text-sm text-slate-600 capitalize">{unit}</div>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="mb-8">
              <h2 className="text-2xl mb-4">What You'll Learn</h2>
              <div className="space-y-3">
                {[
                  'Compound component patterns for flexible APIs',
                  'Advanced custom hooks development',
                  'Render props and HOCs best practices',
                  'Context API optimization techniques',
                  'Performance optimization with React.memo and useMemo',
                  'Real-world refactoring examples',
                ].map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="mb-8">
              <h2 className="text-2xl mb-4">Class Schedule</h2>
              <div className="space-y-4">
                {[
                  { time: '2:00 PM', topic: 'Introduction & Overview', duration: '15 min' },
                  { time: '2:15 PM', topic: 'Compound Components Deep Dive', duration: '45 min' },
                  { time: '3:00 PM', topic: 'Break', duration: '10 min' },
                  { time: '3:10 PM', topic: 'Custom Hooks Patterns', duration: '45 min' },
                  { time: '3:55 PM', topic: 'Performance Optimization', duration: '40 min' },
                  { time: '4:35 PM', topic: 'Q&A Session', duration: '25 min' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b border-slate-200 last:border-0">
                    <div className="text-indigo-600 min-w-20">{item.time}</div>
                    <div className="flex-1">
                      <div className="mb-1">{item.topic}</div>
                      <div className="text-sm text-slate-600">{item.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="mb-8">
              <h2 className="text-2xl mb-4">Prerequisites</h2>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Solid understanding of React fundamentals</li>
                <li>Experience with React Hooks</li>
                <li>Basic knowledge of component composition</li>
                <li>A computer with webcam (optional for participation)</li>
              </ul>
            </Card>
            
            <Card>
              <h2 className="text-2xl mb-4">About the Instructor</h2>
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl mb-1">Alex Thompson</h3>
                  <p className="text-slate-600 mb-3">Senior React Engineer & Instructor</p>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      <span>4.9 rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>8,500 students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      <span>24 live classes</span>
                    </div>
                  </div>
                  <p className="text-slate-700">
                    Alex has 8+ years of experience building large-scale React applications and teaching advanced patterns to developers worldwide.
                  </p>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <div className="text-3xl text-indigo-600 mb-4">$49.99</div>
                
                <Button fullWidth size="lg" className="mb-3">
                  Enroll Now
                </Button>
                
                <div className="text-center text-sm text-slate-600 mb-6">
                  <Badge variant="warning" size="sm">Only 8 spots left</Badge>
                </div>
                
                <div className="space-y-3 border-t border-slate-200 pt-6">
                  <h3 className="mb-3">Includes:</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <Video className="w-5 h-5 text-slate-400" />
                    <span>Live interactive session</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <span>3 hours of instruction</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="w-5 h-5 text-slate-400" />
                    <span>Q&A with instructor</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <span>Recording access (7 days)</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-900">
                    <strong>Important:</strong> Class link will be emailed 1 hour before start time. Late cancellations (24h before) are non-refundable.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
