'use client';

import Link from 'next/link';
import { ArrowRight, Award, BookOpen, BookText, FileText, Video } from 'lucide-react';

const categories = [
  {
    href: '/courses',
    title: 'Digital Courses',
    description: 'Learn anytime, anywhere with my comprehensive video courses',
    icon: BookOpen,
    className: 'from-blue-500 to-blue-600',
    textClassName: 'text-blue-100',
  },
  {
    href: '/ebooks',
    title: 'eBooks',
    description: 'Access my extensive digital library of eBooks',
    icon: FileText,
    className: 'from-purple-500 to-purple-600',
    textClassName: 'text-purple-100',
  },
  {
    href: '/books',
    title: 'Physical Books',
    description: 'Access the Physical Books',
    icon: BookText,
    className: 'from-amber-500 to-orange-600',
    textClassName: 'text-amber-100',
  },
  {
    href: '/live-classes',
    title: 'Live Classes',
    description: 'Join real-time interactive Live Classes',
    icon: Video,
    className: 'from-green-500 to-green-600',
    textClassName: 'text-green-100',
  },
  {
    href: '/practice-exams',
    title: 'Practice Exams',
    description: 'Write Practice Exams and test your knowledge',
    icon: Award,
    className: 'from-rose-500 to-red-600',
    textClassName: 'text-rose-100',
  },
] as const;

export function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 py-14 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl py-6 text-center">
            <p className="text-xl font-semibold text-indigo-100 sm:text-2xl">
              Kantri by Awareness, Honest by Conscience.
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              An anonymous voice on a mission to simplify the law for the common people.
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base text-indigo-100 sm:text-lg">
              A sincere desire to build responsible citizens with strong values is my credential.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="mb-3 text-3xl font-bold text-slate-900">Explore by Category</h2>
            <p className="text-slate-600">
              Browse legal learning materials by format and choose the path that fits you best.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.href} href={category.href} className="group">
                  <div className={`rounded-2xl bg-gradient-to-br ${category.className} p-8 text-white transition-shadow hover:shadow-lg`}>
                    <Icon className="mb-4 h-12 w-12" />
                    <h3 className="mb-2 text-xl">{category.title}</h3>
                    <p className={`mb-4 text-sm ${category.textClassName}`}>{category.description}</p>
                    <span className="flex items-center gap-2 text-sm transition-all group-hover:gap-3">
                      Explore <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
