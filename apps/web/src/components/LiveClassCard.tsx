import Link from 'next/link';
import { Badge } from './Badge';
import { Button } from './Button';
import { Calendar, Clock } from 'lucide-react';

interface LiveClassCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  date?: string;
  time?: string;
  duration: string;
  instructor: string;
  spotsLeft?: number;
}

export function LiveClassCard({
  id,
  title,
  description,
  image,
  price,
  date = 'TBD',
  time = 'TBD',
  duration,
  instructor,
  spotsLeft,
}: LiveClassCardProps) {
  return (
    <Link href={`/live-classes/${id}`} className="group">
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {spotsLeft && spotsLeft < 10 && (
            <div className="absolute top-3 left-3">
              <Badge variant="warning">
                Only {spotsLeft} spots left
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg mb-2 line-clamp-2">{title}</h3>
          <p className="text-slate-600 text-sm mb-3 line-clamp-2">{description}</p>
          
          <div className="space-y-2 mb-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{date} at {time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{duration}</span>
            </div>
          </div>
          
          <p className="text-sm text-slate-600 mb-3">with {instructor}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl text-indigo-600">${price}</span>
            <Button size="sm">Enroll Now</Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
