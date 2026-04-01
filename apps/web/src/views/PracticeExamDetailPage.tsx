import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { Clock, FileText, Award, Shield, AlertCircle } from 'lucide-react';

export function PracticeExamDetailPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Badge variant="info" className="mb-3">Certification Prep</Badge>
              <h1 className="text-4xl mb-3">AWS Certified Solutions Architect Practice Exam</h1>
              <p className="text-lg text-slate-600 mb-4">
                Comprehensive practice test covering all AWS Solutions Architect exam topics with detailed explanations for every question.
              </p>
            </div>
            
            <Card className="mb-8">
              <h2 className="text-2xl mb-4">Exam Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <div className="text-sm text-slate-600">Questions</div>
                    <div className="text-lg">65 questions</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <div className="text-sm text-slate-600">Time Limit</div>
                    <div className="text-lg">130 minutes</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <div className="text-sm text-slate-600">Attempts</div>
                    <div className="text-lg">3 attempts</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <div className="text-sm text-slate-600">Passing Score</div>
                    <div className="text-lg">72%</div>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="mb-8">
              <h2 className="text-2xl mb-4">Topics Covered</h2>
              <div className="space-y-3">
                {[
                  { topic: 'Design Resilient Architectures', percentage: 30 },
                  { topic: 'Design High-Performing Architectures', percentage: 28 },
                  { topic: 'Design Secure Applications', percentage: 24 },
                  { topic: 'Design Cost-Optimized Architectures', percentage: 18 },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-700">{item.topic}</span>
                      <span className="text-slate-600">{item.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="mb-8">
              <h2 className="text-2xl mb-4">What's Included</h2>
              <div className="space-y-3">
                {[
                  '65 practice questions matching real exam difficulty',
                  'Detailed explanations for all answers',
                  'Performance analytics and score breakdown',
                  'Topic-wise strength assessment',
                  'Timed exam simulation mode',
                  'Printable score report',
                  '3 full exam attempts',
                  'Access valid for 90 days',
                ].map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="mb-8">
              <h2 className="text-2xl mb-4">Exam Rules & Guidelines</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <strong>No pausing:</strong> Once started, the exam timer cannot be paused. Ensure you have uninterrupted time.
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                  <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900">
                    <strong>Secure environment:</strong> Browser tab switching and copy-paste are monitored for integrity.
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <Award className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-900">
                    <strong>Instant results:</strong> Get your score immediately after submission with detailed breakdown.
                  </div>
                </div>
              </div>
            </Card>
            
            <Card>
              <h2 className="text-2xl mb-4">Description</h2>
              <div className="prose prose-slate max-w-none text-slate-700 space-y-4">
                <p>
                  This practice exam is designed to help you prepare for the AWS Certified Solutions Architect - Associate certification. The questions are carefully crafted to match the difficulty and style of the actual exam.
                </p>
                <p>
                  Each question comes with detailed explanations that help you understand the concepts deeply, not just memorize answers. Track your progress across multiple attempts and identify areas that need more study.
                </p>
                <p>
                  Perfect for final preparation before scheduling your actual certification exam.
                </p>
              </div>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <div className="text-3xl text-indigo-600 mb-4">$39.99</div>
                
                <Button fullWidth size="lg" className="mb-6">
                  Purchase Exam
                </Button>
                
                <div className="space-y-3 border-t border-slate-200 pt-6">
                  <h3 className="mb-3">Exam Details:</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <span>65 questions</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <span>130 minutes</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <span>3 attempts allowed</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Award className="w-5 h-5 text-slate-400" />
                    <span>72% passing score</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <span>90 days access</span>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-slate-200 pt-6">
                  <h3 className="mb-3 text-sm">Key Features:</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• Instant score report</li>
                    <li>• Detailed explanations</li>
                    <li>• Performance analytics</li>
                    <li>• Printable certificate</li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
