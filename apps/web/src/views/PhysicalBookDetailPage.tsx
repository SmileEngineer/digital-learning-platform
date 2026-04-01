import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { Package, Truck, Star } from 'lucide-react';

export function PhysicalBookDetailPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Badge variant="success" className="mb-3">In Stock</Badge>
              <h1 className="text-4xl mb-3">Clean Code: A Handbook of Agile Software Craftsmanship</h1>
              <p className="text-lg text-slate-600 mb-4">by Robert C. Martin</p>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span>4.8 (1,245 reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <img 
                src="https://images.unsplash.com/photo-1569728723358-d1a317aa7fba?w=600"
                alt="Book"
                className="w-full max-w-md mx-auto object-contain rounded-lg"
              />
            </div>
            
            <Card className="mb-8">
              <h2 className="text-2xl mb-4">Description</h2>
              <div className="prose prose-slate max-w-none text-slate-700 space-y-4">
                <p>
                  Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code.
                </p>
                <p>
                  This book is packed with practical advice—about everything from naming to refactoring to testing. It will help you to develop the mindset of a craftsperson, someone who takes pride in their work and writes clean, maintainable code.
                </p>
              </div>
            </Card>
            
            <Card className="mb-8">
              <h2 className="text-2xl mb-4">Book Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-600">Publisher</div>
                  <div>Prentice Hall</div>
                </div>
                <div>
                  <div className="text-slate-600">Publication Date</div>
                  <div>August 2008</div>
                </div>
                <div>
                  <div className="text-slate-600">Pages</div>
                  <div>464 pages</div>
                </div>
                <div>
                  <div className="text-slate-600">ISBN</div>
                  <div>978-0132350884</div>
                </div>
                <div>
                  <div className="text-slate-600">Language</div>
                  <div>English</div>
                </div>
                <div>
                  <div className="text-slate-600">Binding</div>
                  <div>Paperback</div>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Truck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mb-2 text-blue-900">Shipping Information</h3>
                  <p className="text-sm text-blue-800">
                    Free shipping on orders over $50. Standard delivery takes 5-7 business days. Express shipping available at checkout.
                  </p>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <div className="text-3xl text-indigo-600 mb-4">$42.99</div>
                
                <div className="mb-4">
                  <Badge variant="success">
                    <Package className="w-3 h-3 mr-1" />
                    15 in stock
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    defaultValue="1"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                
                <Button fullWidth size="lg" className="mb-3">
                  Add to Cart
                </Button>
                <Button fullWidth variant="outline" size="lg">
                  Buy Now
                </Button>
                
                <div className="mt-6 border-t border-slate-200 pt-6">
                  <h3 className="mb-3">Shipping Options:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Standard (5-7 days)</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Express (2-3 days)</span>
                      <span>$9.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Day</span>
                      <span>$19.99</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
