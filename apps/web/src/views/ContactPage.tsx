import { Mail, Phone } from 'lucide-react';
import { Card } from '../components/Card';

export function ContactPage() {
  return (
    <div className="py-12">
      <div className="container mx-auto max-w-2xl px-4">
        <h1 className="mb-3 text-4xl font-bold text-slate-900">Contact</h1>
        <p className="mb-8 text-lg text-slate-600">
          Reach out for admissions, technical support, or partnerships.
        </p>
        <Card className="space-y-4 p-8">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm font-medium text-slate-500">Email</p>
              <a
                href="mailto:support@learnhub.example"
                className="text-indigo-700 hover:underline"
              >
                support@learnhub.example
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm font-medium text-slate-500">Phone</p>
              <span className="text-slate-800">+91 — — — — — — —</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
