'use client';

import { useState } from 'react';
import { EbookCard } from '../components/EbookCard';
import { CatalogFilterBanner } from '../components/CatalogFilterBanner';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '../components/Button';

const ebooks = [
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
  {
    id: '3',
    title: 'React Design Patterns',
    description: 'Build scalable React applications with proven design patterns.',
    coverImage: 'https://images.unsplash.com/photo-1772617532657-2d0e38868716?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwZWR1Y2F0aW9uJTIwa25vd2xlZGdlfGVufDF8fHx8MTc3NTA1ODMxMXww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 27.99,
    pages: 380,
    format: 'PDF',
    downloadAllowed: true,
    previewAvailable: true,
  },
  {
    id: '4',
    title: 'Machine Learning Essentials',
    description: 'Core concepts and algorithms in machine learning explained simply.',
    coverImage: 'https://images.unsplash.com/photo-1724148227179-807a0ca73774?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlYm9vayUyMHJlYWRlciUyMGRpZ2l0YWx8ZW58MXx8fHwxNzc1MDU4MzEzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 39.99,
    pages: 600,
    format: 'PDF',
    downloadAllowed: true,
    previewAvailable: true,
    tags: ['Bestseller'],
  },
];

const categories = ['All', 'Programming', 'Data Science', 'Design', 'Business', 'Marketing'];

export function EbooksPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <CatalogFilterBanner />
        <div className="mb-8">
          <h1 className="text-4xl mb-3">eBooks & PDFs</h1>
          <p className="text-slate-600 text-lg">Download and read our extensive digital library</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search ebooks..."
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
        
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-slate-600">{ebooks.length} ebooks found</p>
            <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500">
              <option>Most Popular</option>
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ebooks.map((ebook) => (
            <EbookCard key={ebook.id} {...ebook} />
          ))}
        </div>
        
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
