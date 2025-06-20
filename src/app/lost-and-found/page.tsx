
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/page-header';
import ItemCard from '@/components/common/item-card';
import { Button } from '@/components/ui/button';
import { PlusCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LostAndFoundAPIItem } from '@/app/api/lost-and-found/items/route';

export default function LostAndFoundPage() {
  const [lostItems, setLostItems] = useState<LostAndFoundAPIItem[]>([]);
  const [foundItems, setFoundItems] = useState<LostAndFoundAPIItem[]>([]);
  const [loadingLost, setLoadingLost] = useState(true);
  const [loadingFound, setLoadingFound] = useState(true);
  const [errorLost, setErrorLost] = useState<string | null>(null);
  const [errorFound, setErrorFound] = useState<string | null>(null);

  async function fetchItems(itemType: 'lost' | 'found') {
    if (itemType === 'lost') {
      setLoadingLost(true);
      setErrorLost(null);
    } else {
      setLoadingFound(true);
      setErrorFound(null);
    }

    try {
      const response = await fetch(`/api/lost-and-found/items?type=${itemType}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${itemType} items: ${response.statusText}`);
      }
      const data = await response.json();
      if (itemType === 'lost') {
        setLostItems(data);
      } else {
        setFoundItems(data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `An unknown error occurred while fetching ${itemType} items`;
      if (itemType === 'lost') {
        setErrorLost(errorMessage);
      } else {
        setErrorFound(errorMessage);
      }
      console.error(err);
    } finally {
      if (itemType === 'lost') {
        setLoadingLost(false);
      } else {
        setLoadingFound(false);
      }
    }
  }

  useEffect(() => {
    fetchItems('lost');
    fetchItems('found');
  }, []);

  const renderItemList = (
    items: LostAndFoundAPIItem[],
    loading: boolean,
    error: string | null,
    itemTypeName: string
  ) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading {itemTypeName} items...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center rounded-md border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
          <AlertTriangle className="mb-2 h-10 w-10" />
          <h3 className="text-lg font-semibold">Oops! Failed to load {itemTypeName} items.</h3>
          <p className="text-sm">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => fetchItems(itemTypeName.toLowerCase() as 'lost' | 'found')}>
            Try Again
          </Button>
        </div>
      );
    }

    if (items.length === 0) {
      return <p className="py-10 text-center text-muted-foreground">No {itemTypeName.toLowerCase()} items reported recently.</p>;
    }

    return (
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            title={item.title}
            description={item.description}
            imageUrl={item.imageUrl}
            imageHint={item.imageHint}
            category={item.category}
            date={`Date: ${item.date}`} // User-specified date of loss/find
            location={item.location}
            tags={item.tags}
            onAction={() => alert(`Viewing ${item.title}. Details coming soon!`)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Lost &amp; Found"
        description="Report lost items or browse found items on campus."
        actionButton={
          <Button asChild>
            <Link href="/lost-and-found/report">
              <PlusCircle className="mr-2 h-4 w-4" /> Report an Item
            </Link>
          </Button>
        }
      />
      <Tabs defaultValue="lost" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 lg:w-1/3">
          <TabsTrigger value="lost">Lost Items</TabsTrigger>
          <TabsTrigger value="found">Found Items</TabsTrigger>
        </TabsList>
        <TabsContent value="lost">
          {renderItemList(lostItems, loadingLost, errorLost, "Lost")}
        </TabsContent>
        <TabsContent value="found">
          {renderItemList(foundItems, loadingFound, errorFound, "Found")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
