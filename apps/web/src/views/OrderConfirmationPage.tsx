import Link from 'next/link';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CheckCircle, Download, FileText } from 'lucide-react';

export function OrderConfirmationPage() {
  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl mb-2">Order Confirmed!</h1>
          <p className="text-slate-600">Order #ORD-2026-4321</p>
        </div>
        
        <Card className="mb-6">
          <h2 className="text-xl mb-4">Order Details</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b border-slate-200">
              <div className="w-16 h-16 bg-slate-200 rounded"></div>
              <div className="flex-1">
                <h3 className="mb-1">Complete Web Development Bootcamp</h3>
                <p className="text-sm text-slate-600">Course</p>
              </div>
              <div className="text-right">
                <div className="text-lg">$71.99</div>
                <div className="text-sm text-slate-600">20% off applied</div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <span>Total Paid</span>
              <span className="text-xl text-indigo-600">$71.99</span>
            </div>
          </div>
        </Card>
        
        <Card className="mb-6">
          <h2 className="text-xl mb-4">Next Steps</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600">1</span>
              </div>
              <div>
                <h3 className="mb-1">Access Your Course</h3>
                <p className="text-sm text-slate-600">
                  Your course is now available in your dashboard. Start learning immediately!
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600">2</span>
              </div>
              <div>
                <h3 className="mb-1">Check Your Email</h3>
                <p className="text-sm text-slate-600">
                  We've sent your receipt and access instructions to your email.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600">3</span>
              </div>
              <div>
                <h3 className="mb-1">Start Learning</h3>
                <p className="text-sm text-slate-600">
                  Begin your journey and complete the course at your own pace.
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        <div className="flex gap-4">
          <Link href="/dashboard" className="flex-1">
            <Button fullWidth size="lg">
              Go to Dashboard
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            <Download className="w-4 h-4 mr-2" />
            Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}
