
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
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Loader2, Ticket } from 'lucide-react';

const ticketListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  category: z.string().min(2, 'Category must be at least 2 characters').max(50),
  price: z.string().regex(/^\$?(\d{1,3}(,\d{3})*(\.\d{2})?|\.\d{2}|\d+)$/, 'Invalid price format (e.g., $25.00 or 25)'),
  date: z.string().min(1, "Please specify the event date"), // Event date
  location: z.string().min(3, 'Location must be at least 3 characters').max(100),
  tags: z.string().optional(),
  imageUrl: z.string().url({ message: "Please enter a valid URL or leave blank for a placeholder." }).optional().or(z.literal('')),
  imageHint: z.string().max(50, "Hint too long").optional(),
});

type TicketListingFormValues = z.infer<typeof ticketListingSchema>;

export default function ListTicketPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TicketListingFormValues>({
    resolver: zodResolver(ticketListingSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      price: '',
      date: '', 
      location: '',
      tags: '',
      imageUrl: '',
      imageHint: '',
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/ticket-exchange/list');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const onSubmit: SubmitHandler<TicketListingFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/ticket-exchange/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...data, 
          sellerId: user.uid,
          price: data.price.startsWith('$') ? data.price : `$${data.price}`,
          tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to list ticket');
      }

      toast({
        title: 'Ticket Listed!',
        description: 'Your ticket has been successfully listed for exchange.',
      });
      router.push('/ticket-exchange'); 
    } catch (error: any) {
      console.error('Error listing ticket:', error);
      toast({
        title: 'Listing Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="List a Ticket"
        description="Offer your event ticket for sale or trade in the exchange."
      />
      <Card className="mx-auto max-w-2xl shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Ticket className="h-6 w-6 text-primary" />
            <CardTitle>Ticket Details</CardTitle>
          </div>
          <CardDescription>Fill out the form below to list your ticket.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title / Ticket Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Spring Fling Concert, Football Game Section A" {...field} />
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
                      <Textarea placeholder="Provide details about the ticket, seat, event, etc." {...field} rows={3} />
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
                        <Input placeholder="e.g., Concert, Sports, Theater" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., $25 or OBO" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date & Time</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2024-09-15 7:00 PM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Campus Stadium, Main Auditorium" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., music, football, student event" {...field} />
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
                    <FormLabel>Image URL (Optional - e.g., event flyer)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/flyer.png (leave blank for default)" {...field} />
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
                      <Input placeholder="e.g., concert music (1-2 keywords)" {...field} />
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
                {isSubmitting ? 'Listing Ticket...' : 'List Ticket'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
