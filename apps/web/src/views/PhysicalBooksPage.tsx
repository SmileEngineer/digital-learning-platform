import Link from 'next/link';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Search, SlidersHorizontal, Package } from 'lucide-react';

const books = [
  {
    id: '1',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    price: 42.99,
    image: 'https://images.unsplash.com/photo-1569728723358-d1a317aa7fba?w=300',
    stock: 15,
    rating: 4.8,
  },
  {
    id: '2',
    title: 'The Pragmatic Programmer',
    author: 'David Thomas',
    price: 38.99,
    image: 'https://images.unsplash.com/photo-1569728723358-d1a317aa7fba?w=300',
    stock: 8,
    rating: 4.9,
  },
  {
    id: '3',
    title: 'Design Patterns: Elements of Reusable Object',
    author: 'Erich Gamma',
    price: 45.99,
    image: 'https://images.unsplash.com/photo-1569728723358-d1a317aa7fba?w=300',
    stock: 0,
    rating: 4.7,
  },
];

export function PhysicalBooksPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl mb-3">Physical Bookstore</h1>
          <p className="text-slate-600 text-lg">Browse our collection of physical books with worldwide shipping</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search books..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <Button variant="outline">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <Link key={book.id} href={`/books/${book.id}`} className="group">
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-64 bg-slate-100 flex items-center justify-center">
                  <img src={book.image} alt={book.title} className="h-full object-contain" />
                  {book.stock === 0 && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="error">Out of Stock</Badge>
                    </div>
                  )}
                  {book.stock > 0 && book.stock < 10 && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="warning">Only {book.stock} left</Badge>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg mb-2 line-clamp-2">{book.title}</h3>
                  <p className="text-sm text-slate-600 mb-3">by {book.author}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl text-indigo-600">${book.price}</span>
                    <Button size="sm" disabled={book.stock === 0}>
                      {book.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
