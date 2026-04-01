import Link from 'next/link';
import { Badge } from './Badge';
import { Button } from './Button';
import { Download, Eye } from 'lucide-react';

interface EbookCardProps {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  price: number;
  pages: number;
  format?: string;
  downloadAllowed?: boolean;
  previewAvailable?: boolean;
  tags?: string[];
}

export function EbookCard({
  id,
  title,
  description,
  coverImage,
  price,
  pages,
  format = 'PDF',
  downloadAllowed = true,
  previewAvailable = true,
  tags = [],
}: EbookCardProps) {
  return (
    <Link href={`/ebooks/${id}`} className="group">
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <div className="relative h-64 overflow-hidden bg-slate-100 flex items-center justify-center">
          <img 
            src={coverImage} 
            alt={title} 
            className="h-full object-contain group-hover:scale-105 transition-transform duration-200"
          />
          {tags.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="new">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg mb-2 line-clamp-2">{title}</h3>
          <p className="text-slate-600 text-sm mb-3 line-clamp-2">{description}</p>
          
          <div className="flex items-center gap-3 mb-3 text-sm text-slate-600">
            <span>{pages} pages</span>
            <span>•</span>
            <span>{format}</span>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            {downloadAllowed && (
              <Badge variant="success" size="sm">
                <Download className="w-3 h-3 mr-1" />
                Download
              </Badge>
            )}
            {previewAvailable && (
              <Badge variant="info" size="sm">
                <Eye className="w-3 h-3 mr-1" />
                Preview
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl text-indigo-600">${price}</span>
            <Button size="sm">View Details</Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
