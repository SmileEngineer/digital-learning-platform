import Link from 'next/link';
import { Button } from '../components/Button';
import { CourseCard } from '../components/CourseCard';
import { EbookCard } from '../components/EbookCard';
import { LiveClassCard } from '../components/LiveClassCard';
import { ArrowRight, BookOpen, Video, FileText, Award, Star } from 'lucide-react';

const featuredCourses = [
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
];

const featuredEbooks = [
  {
    id: '1',
    title: 'The Complete Guide to Modern JavaScript',
    description: 'Master ES6+ features, async programming, and modern JavaScript patterns.',
    coverImage: 'https://images.unsplash.com/photo-1772617532657-2d0e38868716?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwZWR1Y2F0aW9uJTIwa25vd2xlZGdlfGVufDF8fHx8MTc3NTA1ODMxMXww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 29.99,
    pages: 450,
    format: 'PDF',
    downloadAllowed: true,
    previewAvailable: true,
    tags: ['New Release'],
  },
  {
    id: '2',
    title: 'Python for Data Analysis',
    description: 'Comprehensive guide to data manipulation and analysis using pandas and NumPy.',
    coverImage: 'https://images.unsplash.com/photo-1724148227179-807a0ca73774?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlYm9vayUyMHJlYWRlciUyMGRpZ2l0YWx8ZW58MXx8fHwxNzc1MDU4MzEzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 34.99,
    pages: 520,
    format: 'PDF',
    downloadAllowed: true,
    previewAvailable: true,
  },
];

const upcomingLiveClasses = [
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
];

export function HomePage() {
  return (
    <div>
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
              <div className="text-4xl text-indigo-600 mb-2">500+</div>
              <div className="text-slate-600">Courses</div>
            </div>
            <div>
              <div className="text-4xl text-indigo-600 mb-2">50K+</div>
              <div className="text-slate-600">Students</div>
            </div>
            <div>
              <div className="text-4xl text-indigo-600 mb-2">200+</div>
              <div className="text-slate-600">eBooks</div>
            </div>
            <div>
              <div className="text-4xl text-indigo-600 mb-2">95%</div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
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
            {featuredEbooks.map((ebook) => (
              <EbookCard key={ebook.id} {...ebook} />
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
            {upcomingLiveClasses.map((liveClass) => (
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
