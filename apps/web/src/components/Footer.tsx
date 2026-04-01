import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="mb-4 font-black tracking-tight text-white">
              LEARN<span className="text-indigo-400">HUB</span>
            </h3>
            <p className="text-sm mb-4">
              Your trusted platform for digital learning, ebooks, and educational resources.
            </p>
            <div className="flex gap-3">
              <a href="#" className="hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white mb-4">Quick links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/courses" className="hover:text-white transition-colors">All courses</Link></li>
              <li><Link href="/ebooks" className="hover:text-white transition-colors">eBooks library</Link></li>
              <li><Link href="/books" className="hover:text-white transition-colors">Bookstore</Link></li>
              <li><Link href="/live-classes" className="hover:text-white transition-colors">Live classes</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/practice-exams" className="hover:text-white transition-colors">Practice exams</Link></li>
              <li><Link href="/articles" className="hover:text-white transition-colors">Articles</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact us</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white mb-4">Newsletter</h4>
            <p className="text-sm mb-3">Subscribe to get updates on new courses and offers.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Your email"
                className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
              <button className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-6 text-sm text-center">
          <p>&copy; 2026 LearnHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
