import Link from 'next/link';
import { Button } from '../components/Button';
import { XCircle } from 'lucide-react';

export function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        
        <h1 className="text-3xl mb-3">Payment Failed</h1>
        <p className="text-slate-600 mb-8">
          We couldn't process your payment. Please check your payment details and try again.
        </p>
        
        <div className="space-y-3">
          <Link href="/checkout">
            <Button fullWidth size="lg">
              Try Again
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
