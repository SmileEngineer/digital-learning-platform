import Link from 'next/link';
import { Button } from '../components/Button';
import { Clock } from 'lucide-react';

export function PaymentPendingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-12 h-12 text-amber-600" />
        </div>
        
        <h1 className="text-3xl mb-3">Payment Pending</h1>
        <p className="text-slate-600 mb-8">
          Your payment is being processed. We'll send you an email confirmation once it's complete.
        </p>
        
        <div className="space-y-3">
          <Link href="/dashboard">
            <Button fullWidth size="lg">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button fullWidth variant="outline" size="lg">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
