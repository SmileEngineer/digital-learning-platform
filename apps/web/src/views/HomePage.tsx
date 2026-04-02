'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { CourseCard } from '../components/CourseCard';
import { EbookCard } from '../components/EbookCard';
import { LiveClassCard } from '../components/LiveClassCard';
import { ArrowRight, BookOpen, Video, FileText, Award, Star } from 'lucide-react';
import { fetchHomeHighlights, type HomeHighlights } from '@/lib/platform-api';

const emptyHighlights: HomeHighlights = {
  featuredCourses: [],
  featuredEbooks: [],
  upcomingLiveClasses: [],
  featuredExams: [],
  featuredBooks: [],
  featuredArticles: [],
  stats: { courses: 0, students: 0, ebooks: 0, successRate: 95 },
  scroller: { enabled: false, message: '' },
};

export function HomePage() {
  const [data, setData] = useState<HomeHighlights>(emptyHighlights);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHomeHighlights()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load homepage');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      {data.scroller.enabled && data.scroller.message && (
        <div className="bg-amber-100 border-b border-amber-200 text-amber-900">
          <div className="container mx-auto px-4 py-3 text-sm">{data.scroller.message}</div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl mb-6">Transform Your Future with Expert-Led Learning</h1>
            <p className="text-xl mb-8 text-indigo-100">
              Access thousands of courses, ebooks, live classes, and practice exams. Learn at your own pace, earn certificates, and advance your career.
            </p>
            <div className="flex gap-4">
              <Link href="/courses">
                <Button size="lg" variant="secondary">
                  Browse Courses
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="bg-white py-12 border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl text-indigo-600 mb-2">{loading ? '...' : `${data.stats.courses}+`}</div>
              <div className="text-slate-600">Courses</div>
            </div>
            <div>
              <div className="text-4xl text-indigo-600 mb-2">{loading ? '...' : `${data.stats.students}+`}</div>
              <div className="text-slate-600">Students</div>
            </div>
            <div>
              <div className="text-4xl text-indigo-600 mb-2">{loading ? '...' : `${data.stats.ebooks}+`}</div>
              <div className="text-slate-600">eBooks</div>
            </div>
            <div>
              <div className="text-4xl text-indigo-600 mb-2">{data.stats.successRate}%</div>
              <div className="text-slate-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Courses */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl mb-2">Featured Courses</h2>
              <p className="text-slate-600">Most popular courses chosen by our students</p>
            </div>
            <Link href="/courses">
              <Button variant="outline">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.featuredCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured eBooks */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl mb-2">Featured eBooks & PDFs</h2>
              <p className="text-slate-600">Expand your knowledge with our digital library</p>
            </div>
            <Link href="/ebooks">
              <Button variant="outline">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.featuredEbooks.map((ebook) => (
              <EbookCard
                key={ebook.id}
                id={String(ebook.id)}
                title={ebook.title}
                description={ebook.description}
                coverImage={ebook.coverImage}
                price={ebook.price}
                pages={ebook.pages ?? 0}
                format={ebook.format}
                downloadAllowed={ebook.downloadAllowed}
                previewAvailable={ebook.previewAvailable}
                tags={ebook.tags}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Upcoming Live Classes */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl mb-2">Upcoming Live Classes</h2>
              <p className="text-slate-600">Join interactive sessions with expert instructors</p>
            </div>
            <Link href="/live-classes">
              <Button variant="outline">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.upcomingLiveClasses.map((liveClass) => (
              <LiveClassCard key={liveClass.id} {...liveClass} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl mb-8 text-center">Explore by Category</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/courses" className="group">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-lg hover:shadow-lg transition-shadow">
                <BookOpen className="w-12 h-12 mb-4" />
                <h3 className="text-xl mb-2">Digital Courses</h3>
                <p className="text-blue-100 text-sm mb-4">Learn anytime, anywhere with our comprehensive video courses</p>
                <span className="text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                  Explore <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
            
            <Link href="/ebooks" className="group">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-lg hover:shadow-lg transition-shadow">
                <FileText className="w-12 h-12 mb-4" />
                <h3 className="text-xl mb-2">eBooks & PDFs</h3>
                <p className="text-purple-100 text-sm mb-4">Access our extensive digital library of books and guides</p>
                <span className="text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                  Explore <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
            
            <Link href="/live-classes" className="group">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-lg hover:shadow-lg transition-shadow">
                <Video className="w-12 h-12 mb-4" />
                <h3 className="text-xl mb-2">Live Classes</h3>
                <p className="text-green-100 text-sm mb-4">Join real-time interactive sessions with instructors</p>
                <span className="text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                  Explore <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
            
            <Link href="/practice-exams" className="group">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-8 rounded-lg hover:shadow-lg transition-shadow">
                <Award className="w-12 h-12 mb-4" />
                <h3 className="text-xl mb-2">Practice Exams</h3>
                <p className="text-orange-100 text-sm mb-4">Test your knowledge and prepare for certifications</p>
                <span className="text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                  Explore <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl mb-8 text-center">What Our Students Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4">
                  "The courses are incredibly well-structured and the instructors are top-notch. I've learned so much and applied it directly to my career."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                  <div>
                    <div>Student Name</div>
                    <div className="text-sm text-slate-600">Software Engineer</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
