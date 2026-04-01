import Link from 'next/link';
import { GraduationCap, User } from 'lucide-react';
import { Button } from './Button';

export function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      {/* Announcement bar */}
      <div className="bg-indigo-600 text-white text-center py-2 text-sm">
        🎉 New courses launching this week! Get 20% off with code LEARN20
      </div>
      
      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            <span className="text-xl">LearnHub</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/courses" className="text-slate-700 hover:text-indigo-600 transition-colors">
              Courses
            </Link>
            <Link href="/ebooks" className="text-slate-700 hover:text-indigo-600 transition-colors">
              eBooks
            </Link>
            <Link href="/books" className="text-slate-700 hover:text-indigo-600 transition-colors">
              Bookstore
            </Link>
            <Link href="/live-classes" className="text-slate-700 hover:text-indigo-600 transition-colors">
              Live Classes
            </Link>
            <Link href="/practice-exams" className="text-slate-700 hover:text-indigo-600 transition-colors">
              Practice Exams
            </Link>
            <Link href="/articles" className="text-slate-700 hover:text-indigo-600 transition-colors">
              Articles
            </Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <User className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Login</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
