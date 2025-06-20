'use client';

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CalendarDays, MapPin } from 'lucide-react';

interface ItemCardProps {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt?: string;
  imageHint?: string;
  category?: string;
  price?: string;
  date?: string;
  location?: string;
  tags?: string[];
  actionLabel?: string;
  onAction?: () => void;
}

export default function ItemCard({
  title,
  description,
  imageUrl,
  imageAlt = 'Item image',
  imageHint,
  category,
  price,
  date,
  location,
  tags,
  actionLabel = 'View Details',
  onAction,
}: ItemCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={imageAlt}
          layout="fill"
          objectFit="cover"
          data-ai-hint={imageHint}
        />
      </div>
      <CardHeader>
        <CardTitle className="font-headline text-xl">{title}</CardTitle>
        {category && (
          <CardDescription>
            <Badge>{category}</Badge>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
        <div className="mt-2 space-y-1 text-sm">
          {price && (
            <div className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-primary" />
              <span>{price}</span>
            </div>
          )}
          {date && (
            <div className="flex items-center">
              <CalendarDays className="mr-2 h-4 w-4 text-primary" />
              <span>{date}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-primary" />
              <span>{location}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag}>
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {onAction && (
          <Button onClick={onAction} className="mt-2 w-full sm:mt-0 sm:w-auto">
            {actionLabel}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
