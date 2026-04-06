import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../components/Button';
import { ArrowLeft } from 'lucide-react';

export function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-indigo-600">
              <Image src="/images/logo.svg" alt="" width={40} height={40} className="object-cover" />
            </span>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              KANTRI <span className="text-indigo-600">LAWYER</span>
            </span>
          </Link>
          <h1 className="text-3xl mb-2">Reset Password</h1>
          <p className="text-slate-600">Enter your email to receive a reset link</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg border border-slate-200">
          <form className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <Button type="submit" fullWidth size="lg">
              Send Reset Link
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
