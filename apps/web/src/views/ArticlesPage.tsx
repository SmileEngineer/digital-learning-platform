import Link from 'next/link';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Calendar, Clock } from 'lucide-react';

const articles = [
  {
    id: '1',
    title: '10 Best Practices for Writing Clean React Code',
    excerpt: 'Learn how to write maintainable and scalable React applications with these proven best practices.',
    image: 'https://images.unsplash.com/photo-1771408427146-09be9a1d4535?w=600',
    category: 'Web Development',
    date: 'March 28, 2026',
    readTime: '5 min read',
  },
  {
    id: '2',
    title: 'Introduction to Machine Learning Algorithms',
    excerpt: 'Understand the fundamental algorithms that power modern machine learning applications.',
    image: 'https://images.unsplash.com/photo-1762330917056-e69b34329ddf?w=600',
    category: 'Data Science',
    date: 'March 25, 2026',
    readTime: '8 min read',
  },
  {
    id: '3',
    title: 'The Future of Web Development in 2026',
    excerpt: 'Explore emerging trends and technologies shaping the future of web development.',
    image: 'https://images.unsplash.com/photo-1621743018966-29194999d736?w=600',
    category: 'Technology',
    date: 'March 22, 2026',
    readTime: '6 min read',
  },
];

export function ArticlesPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl mb-3">Articles & Blog</h1>
          <p className="text-slate-600 text-lg">Learn from our expert insights and tutorials</p>
        </div>
        
        {/* Featured Article */}
        <Card className="mb-8" hover>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-200 rounded-lg overflow-hidden">
              <img 
                src={articles[0].image} 
                alt={articles[0].title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <Badge variant="info" className="mb-3 w-fit">Featured</Badge>
              <Link href={`/articles/${articles[0].id}`}>
                <h2 className="text-2xl mb-3 hover:text-indigo-600 transition-colors">
                  {articles[0].title}
                </h2>
              </Link>
              <p className="text-slate-600 mb-4">{articles[0].excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <Badge variant="neutral">{articles[0].category}</Badge>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{articles[0].date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{articles[0].readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.slice(1).map((article) => (
            <Link key={article.id} href={`/articles/${article.id}`} className="group">
              <Card hover>
                <div className="h-48 bg-slate-200 rounded-lg overflow-hidden mb-4">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <Badge variant="neutral" className="mb-3">{article.category}</Badge>
                <h3 className="text-xl mb-2 group-hover:text-indigo-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-slate-600 text-sm mb-4">{article.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{article.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
