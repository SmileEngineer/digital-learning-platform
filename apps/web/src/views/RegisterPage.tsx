import Link from 'next/link';
import { Button } from '../components/Button';
import { GraduationCap } from 'lucide-react';

export function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <GraduationCap className="w-10 h-10 text-indigo-600" />
            <span className="text-2xl">LearnHub</span>
          </Link>
          <h1 className="text-3xl mb-2">Create Account</h1>
          <p className="text-slate-600">Start your learning journey today</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg border border-slate-200">
          <form className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm mb-2">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm mb-2">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1 rounded" />
              <span className="text-slate-600">
                I agree to the Terms of Service and Privacy Policy
              </span>
            </label>
            
            <Button type="submit" fullWidth size="lg">
              Create Account
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600">Already have an account? </span>
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
