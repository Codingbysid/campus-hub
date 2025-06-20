
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/page-header';
import ItemCard from '@/components/common/item-card';
import { Button } from '@/components/ui/button';
import { PlusCircle, AlertTriangle, Loader2 } from 'lucide-react';
import type { CampusEventAPIItem } from '@/app/api/events/route';


export default function CampusEventsPage() {
  const [events, setEvents] = useState<CampusEventAPIItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${response.statusText}`);
        }
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);


  return (
    <div className="container mx-auto">
      <PageHeader
        title="Campus Events & Social"
        description="Discover and promote campus parties, club meetings, and social gatherings."
        actionButton={
          <Button asChild>
            <Link href="/events/promote">
              <PlusCircle className="mr-2 h-4 w-4" /> Promote an Event
            </Link>
          </Button>
        }
      />

      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading events...</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center rounded-md border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
          <AlertTriangle className="mb-2 h-10 w-10" />
          <h3 className="text-lg font-semibold">Oops! Something went wrong.</h3>
          <p className="text-sm">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">No campus events currently listed.</p>
          <p className="text-sm text-muted-foreground">Be the first to promote an event!</p>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((item) => (
            <ItemCard
              key={item.id}
              title={item.title}
              description={item.description}
              imageUrl={item.imageUrl}
              imageHint={item.imageHint}
              category={item.category}
              date={item.date} 
              location={item.location}
              tags={item.tags}
              onAction={() => alert(`Viewing ${item.title}. More details coming soon!`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
