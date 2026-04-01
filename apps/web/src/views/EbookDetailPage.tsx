import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { Download, Eye, FileText, Shield, Star } from 'lucide-react';

export function EbookDetailPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex gap-2 mb-3">
                <Badge variant="new">New Release</Badge>
                <Badge variant="success">Downloadable</Badge>
              </div>
              <h1 className="text-4xl mb-3">The Complete Guide to Modern JavaScript</h1>
              <p className="text-lg text-slate-600 mb-4">
                Master ES6+ features, async programming, modern JavaScript patterns, and build production-ready applications.
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span>4.9 (580 reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>450 pages</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  <span>PDF Format</span>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <img 
                src="https://images.unsplash.com/photo-1772617532657-2d0e38868716?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwZWR1Y2F0aW9uJTIwa25vd2xlZGdlfGVufDF8fHx8MTc3NTA1ODMxMXww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="eBook Cover"
                className="w-full max-w-md mx-auto object-contain rounded-lg shadow-lg"
              />
            </div>
            
            <Card className="mb-8">
              <h2 className="text-2xl mb-4">What's Inside</h2>
              <div className="space-y-3">
                {[
                  'Modern JavaScript ES6+ syntax and features',
                  'Async programming with Promises and async/await',
                  'Functional programming concepts',
                  'Object-oriented programming in JavaScript',
                  'Advanced array and object manipulation',
                  'Module systems and bundling',
                  'Testing and debugging techniques',
                  'Performance optimization strategies',
                ].map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-600 text-sm">{index + 1}</span>
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="mb-8">
              <h2 className="text-2xl mb-4">Description</h2>
              <div className="prose prose-slate max-w-none text-slate-700 space-y-4">
                <p>
                  This comprehensive guide covers everything you need to know about modern JavaScript development. From fundamentals to advanced concepts, you'll gain deep understanding of the language and best practices.
                </p>
                <p>
                  Written by experienced developers, this ebook includes practical examples, code snippets, and real-world scenarios that you can apply immediately to your projects.
                </p>
                <p>
                  Perfect for both beginners looking to learn JavaScript properly and experienced developers wanting to master modern ES6+ features.
                </p>
              </div>
            </Card>
            
            <Card className="mb-8">
              <h2 className="text-2xl mb-4">Preview Pages</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-slate-100 rounded border border-slate-200 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors">
                    <Eye className="w-8 h-8 text-slate-400" />
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Eye className="w-4 h-4 mr-2" />
                Preview More Pages
              </Button>
            </Card>
            
            <Card>
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mb-2 text-blue-900">Digital Rights & Security</h3>
                  <p className="text-sm text-blue-800">
                    This ebook is DRM-protected and will be watermarked with your account information. Download is allowed on up to 3 devices. Sharing or redistribution is prohibited and monitored.
                  </p>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <div className="text-3xl text-indigo-600 mb-4">$29.99</div>
                
                <Button fullWidth size="lg" className="mb-3">
                  <Download className="w-4 h-4 mr-2" />
                  Buy & Download
                </Button>
                <Button fullWidth variant="outline" size="lg" className="mb-6">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                
                <div className="text-center text-sm text-slate-600 mb-6">
                  30-Day Money-Back Guarantee
                </div>
                
                <div className="space-y-3 border-t border-slate-200 pt-6">
                  <h3 className="mb-3">Includes:</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <span>450 pages PDF</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Download className="w-5 h-5 text-slate-400" />
                    <span>Download on 3 devices</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Eye className="w-5 h-5 text-slate-400" />
                    <span>Preview available</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-5 h-5 text-slate-400" />
                    <span>Secure watermarking</span>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-slate-200 pt-6">
                  <h3 className="mb-3 text-sm">Specifications:</h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Format:</span>
                      <span>PDF</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pages:</span>
                      <span>450</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Language:</span>
                      <span>English</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Published:</span>
                      <span>March 2026</span>
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
