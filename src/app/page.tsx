
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/page-header';
import ItemCard from '@/components/common/item-card';
import { Button } from '@/components/ui/button';
import { PlusCircle, AlertTriangle, Loader2 } from 'lucide-react';
import type { MarketplaceAPIItem } from '@/app/api/marketplace/items/route';

export default function MarketplacePage() {
  const [items, setItems] = useState<MarketplaceAPIItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/marketplace/items');
        if (!response.ok) {
          throw new Error(`Failed to fetch items: ${response.statusText}`);
        }
        const data = await response.json();
        setItems(data);
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
    fetchItems();
  }, []);

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Student Marketplace"
        description="Buy and sell items within the campus community."
        actionButton={
          <Button asChild>
            <Link href="/marketplace/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Post New Item
            </Link>
          </Button>
        }
      />

      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading items...</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center rounded-md border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
          <AlertTriangle className="mb-2 h-10 w-10" />
          <h3 className="text-lg font-semibold">Oops! Something went wrong.</h3>
          <p className="text-sm">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">No items currently listed in the marketplace.</p>
          <p className="text-sm text-muted-foreground">Be the first to post something!</p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              title={item.title}
              description={item.description}
              imageUrl={item.imageUrl}
              imageHint={item.imageHint}
              category={item.category}
              price={item.price}
              tags={item.tags}
              onAction={() => alert(`Viewing ${item.title}. More details coming soon!`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
