import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Download, Eye, FileText } from 'lucide-react';

const ebooks = [
  { id: 1, title: 'The Complete Guide to Modern JavaScript', pages: 450, format: 'PDF', downloaded: true },
  { id: 2, title: 'Python for Data Analysis', pages: 520, format: 'PDF', downloaded: true },
  { id: 3, title: 'React Design Patterns', pages: 380, format: 'PDF', downloaded: false },
];

export function MyEbooksPage() {
  return (
    <div>
      <h1 className="text-3xl mb-8">My eBooks & PDFs</h1>
      
      <div className="grid grid-cols-1 gap-4">
        {ebooks.map((ebook) => (
          <Card key={ebook.id} hover>
            <div className="flex items-center gap-4">
              <div className="w-12 h-16 bg-slate-200 rounded"></div>
              <div className="flex-1">
                <h3 className="mb-1">{ebook.title}</h3>
                <div className="text-sm text-slate-600">
                  {ebook.pages} pages • {ebook.format}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Read
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
