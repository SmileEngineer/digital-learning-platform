import { Badge } from '../components/Badge';
import { Calendar, Clock, User } from 'lucide-react';

export function ArticleDetailPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Badge variant="info" className="mb-3">Web Development</Badge>
          <h1 className="text-4xl mb-4">10 Best Practices for Writing Clean React Code</h1>
          
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Dr. Sarah Johnson</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>March 28, 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>5 min read</span>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <img 
            src="https://images.unsplash.com/photo-1771408427146-09be9a1d4535?w=1200"
            alt="Article"
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-700 mb-6">
            Writing clean, maintainable React code is essential for building scalable applications. In this article, we'll explore ten best practices that will help you write better React code.
          </p>
          
          <h2 className="text-2xl mb-4 mt-8">1. Use Functional Components and Hooks</h2>
          <p className="text-slate-700 mb-6">
            Functional components with hooks are now the standard way to write React components. They're more concise, easier to test, and promote better code organization.
          </p>
          
          <h2 className="text-2xl mb-4 mt-8">2. Keep Components Small and Focused</h2>
          <p className="text-slate-700 mb-6">
            Each component should have a single responsibility. If a component is doing too much, consider breaking it down into smaller, reusable pieces.
          </p>
          
          <h2 className="text-2xl mb-4 mt-8">3. Use PropTypes or TypeScript</h2>
          <p className="text-slate-700 mb-6">
            Type checking helps catch bugs early and makes your code more self-documenting. Consider using TypeScript for larger projects.
          </p>
          
          <h2 className="text-2xl mb-4 mt-8">Conclusion</h2>
          <p className="text-slate-700 mb-6">
            Following these best practices will help you write cleaner, more maintainable React code. Remember, clean code is not just about working code—it's about code that's easy to understand, modify, and extend.
          </p>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-200">
          <h3 className="text-xl mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="w-24 h-20 bg-slate-200 rounded flex-shrink-0"></div>
                <div>
                  <h4 className="mb-2">Related Article Title {i}</h4>
                  <p className="text-sm text-slate-600">5 min read</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
