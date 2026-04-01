import Link from 'next/link';
import { Badge } from './Badge';
import { Button } from './Button';
import { Clock, Users, Star } from 'lucide-react';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  students: number;
  rating?: number;
  tags?: string[];
  instructor: string;
}

export function CourseCard({
  id,
  title,
  description,
  image,
  price,
  duration,
  students,
  rating,
  tags = [],
  instructor,
}: CourseCardProps) {
  return (
    <Link href={`/courses/${id}`} className="group">
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {tags.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant={tag === 'Bestseller' ? 'bestseller' : 'new'}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg mb-2 line-clamp-2">{title}</h3>
          <p className="text-slate-600 text-sm mb-3 line-clamp-2">{description}</p>
          
          <div className="flex items-center gap-4 mb-3 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{students}</span>
            </div>
            {rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{rating}</span>
              </div>
            )}
          </div>
          
          <p className="text-sm text-slate-600 mb-3">by {instructor}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl text-indigo-600">${price}</span>
            <Button size="sm">View Course</Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
