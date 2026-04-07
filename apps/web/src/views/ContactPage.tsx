import { Mail, Phone } from 'lucide-react';
import { Card } from '../components/Card';

export function ContactPage() {
  return (
    <div className="py-12">
      <div className="container mx-auto max-w-2xl px-4">
        <h1 className="mb-3 text-4xl font-bold text-slate-900">Contact Us Page</h1>
        <p className="mb-8 text-lg text-slate-600">
          You may contact us using the information below:
        </p>
        <Card className="space-y-4 p-8">
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm font-medium text-slate-500">Contact</p>
              <span className="text-slate-800">9392907777</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm font-medium text-slate-500">E-Mail ID</p>
              <a
                href="mailto:uday@kantrilawyer.com"
                className="text-indigo-700 hover:underline"
              >
                uday@kantrilawyer.com
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
