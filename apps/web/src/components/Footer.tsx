import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 font-black tracking-tight text-white">
              KANTRI <span className="text-indigo-400">LAWYER</span>
            </h3>
            <p className="mb-3 text-sm">
              Kantri by Awareness, Honest by Conscience
            </p>
            <p className="text-sm">+91 9392907777</p>
            <p className="text-sm">uday@kantrilawyer.com</p>
          </div>

          <div>
            <h4 className="mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/courses" className="transition-colors hover:text-white">Courses</Link></li>
              <li><Link href="/ebooks" className="transition-colors hover:text-white">eBooks</Link></li>
              <li><Link href="/books" className="transition-colors hover:text-white">Physical Books</Link></li>
              <li><Link href="/live-classes" className="transition-colors hover:text-white">Live Classes</Link></li>
              <li><Link href="/practice-exams" className="transition-colors hover:text-white">Practice Exams</Link></li>
              <li><Link href="/articles" className="transition-colors hover:text-white">Articles</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-white">Terms of Service</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms-of-service" className="transition-colors hover:text-white">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="transition-colors hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/shipping-policy" className="transition-colors hover:text-white">Shipping Policy</Link></li>
              <li><Link href="/cancellations-refunds" className="transition-colors hover:text-white">Cancellations &amp; Refunds</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 text-center text-sm">
          <p>Kantri Lawyer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
