'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, HelpCircle } from 'lucide-react';
import { findLostItemMatches } from '@/ai/flows/find-lost-item-matches-flow';
import type { LostAndFoundAPIItem } from '@/app/api/lost-and-found/items/route';
import ItemCard from '@/components/common/item-card';

const reportItemSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  category: z.string().min(2, 'Category must be at least 2 characters').max(50),
  date: z.string().min(1, "Please specify the date"), // Date lost or found
  location: z.string().min(3, 'Location must be at least 3 characters').max(100),
  itemType: z.enum(['lost', 'found'], { required_error: "You must select if the item is lost or found." }),
  tags: z.string().optional(),
  imageUrl: z.string().url({ message: "Please enter a valid URL or leave blank for a placeholder." }).optional().or(z.literal('')),
  imageHint: z.string().max(50, "Hint too long").optional(),
});

type ReportItemFormValues = z.infer<typeof reportItemSchema>;

export default function ReportLostAndFoundItemPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [potentialMatches, setPotentialMatches] = useState<LostAndFoundAPIItem[]>([]);
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);


  const form = useForm<ReportItemFormValues>({
    resolver: zodResolver(reportItemSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0], // Default to today
      location: '',
      itemType: 'lost',
      tags: '',
      imageUrl: '',
      imageHint: '',
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/lost-and-found/report');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleItemMatchCheck = async (lostItemData: ReportItemFormValues) => {
    try {
      toast({ title: 'Report Submitted!', description: 'Now checking for potential matches...' });
      const foundResponse = await fetch('/api/lost-and-found/items?type=found');
      if (!foundResponse.ok) throw new Error('Could not fetch found items.');
      
      const foundItems: LostAndFoundAPIItem[] = await foundResponse.json();
      if (foundItems.length === 0) {
        toast({ title: 'No matches found.', description: 'Your report is live. We hope someone finds your item soon!' });
        router.push('/lost-and-found');
        return;
      }

      const lostItemForMatch = {
        id: 'new',
        title: lostItemData.title,
        description: lostItemData.description,
        category: lostItemData.category,
        date: lostItemData.date,
        location: lostItemData.location,
        tags: lostItemData.tags ? lostItemData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      const matchOutput = await findLostItemMatches({
          lostItem: lostItemForMatch,
          foundItems: foundItems,
      });

      if (matchOutput.matches && matchOutput.matches.length > 0) {
        const matchedItems = foundItems.filter(item => 
            matchOutput.matches.some(match => match.id === item.id)
        );
        setPotentialMatches(matchedItems);
        setIsMatchDialogOpen(true);
      } else {
        toast({ title: 'No immediate matches found.', description: 'Your report is now live for others to see.' });
        router.push('/lost-and-found');
      }

    } catch (error: any) {
      console.error("Failed to check for matches:", error);
      toast({ title: "Couldn't check for matches", description: "Your item was reported, but we couldn't check for matches at this time.", variant: 'destructive'});
      router.push('/lost-and-found');
    }
  }


  const onSubmit: SubmitHandler<ReportItemFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/lost-and-found/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...data, 
          reporterId: user.uid,
          tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to report item');
      }
      
      // If a lost item was reported, check for matches. Otherwise, just redirect.
      if (data.itemType === 'lost') {
        await handleItemMatchCheck(data);
      } else {
        toast({
          title: 'Item Reported!',
          description: 'Your item report has been successfully submitted.',
        });
        router.push('/lost-and-found'); 
      }

    } catch (error: any) {
      console.error('Error reporting item:', error);
      toast({
        title: 'Reporting Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="container mx-auto py-8">
        <PageHeader
          title="Report an Item"
          description="Submit details for a lost or found item on campus."
        />
        <Card className="mx-auto max-w-2xl shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <HelpCircle className="h-6 w-6 text-primary" />
              <CardTitle>Item Report Details</CardTitle>
            </div>
            <CardDescription>Fill out the form below to report your item.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="itemType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Is this item Lost or Found?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1 md:flex-row md:space-x-4 md:space-y-0"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="lost" />
                            </FormControl>
                            <FormLabel className="font-normal">I Lost an Item</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="found" />
                            </FormControl>
                            <FormLabel className="font-normal">I Found an Item</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Title/Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Black iPhone 13, Blue Hydro Flask" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Detailed description of the item, including any distinguishing features." {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Electronics, Drinkware, Keys" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Lost/Found</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Lost/Found</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Library 2nd Floor, Student Union Cafeteria" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (comma-separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., phone, water bottle, lost key" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.png (leave blank for default)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageHint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image AI Hint (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., keys car (1-2 keywords)" {...field} />
                      </FormControl>
                      <FormDescription>
                        Helpful keywords if a placeholder image is used (max 2 words).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting || authLoading}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isMatchDialogOpen} onOpenChange={setIsMatchDialogOpen}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Potential Matches Found!</AlertDialogTitle>
            <AlertDialogDescription>
              We found the following items that might be what you're looking for. Please review them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 max-h-[60vh] overflow-y-auto rounded-md border p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {potentialMatches.map((item) => (
                    <ItemCard
                        key={item.id}
                        title={item.title}
                        description={item.description}
                        imageUrl={item.imageUrl}
                        imageHint={item.imageHint}
                        category={item.category}
                        date={`Date: ${item.date}`}
                        location={item.location}
                        tags={item.tags}
                        onAction={() => alert(`Contact info for this item would be shown here!`)}
                        actionLabel="View Item"
                    />
                ))}
              </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setIsMatchDialogOpen(false);
              router.push('/lost-and-found');
            }}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
