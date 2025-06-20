
'use client';

import { useState } from 'react';
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
import { Loader2, PartyPopper } from 'lucide-react';

const promoteEventSchema = z.object({
  title: z.string().min(3, 'Event title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  category: z.string().min(2, 'Category must be at least 2 characters').max(50),
  date: z.string().min(1, "Please specify the event date and time"), 
  location: z.string().min(3, 'Location must be at least 3 characters').max(100),
  tags: z.string().optional(),
  imageUrl: z.string().url({ message: "Please enter a valid URL or leave blank for a placeholder." }).optional().or(z.literal('')),
  imageHint: z.string().max(50, "Hint too long").optional(),
});

type PromoteEventFormValues = z.infer<typeof promoteEventSchema>;

export default function PromoteEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PromoteEventFormValues>({
    resolver: zodResolver(promoteEventSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      date: '', 
      location: '',
      tags: '',
      imageUrl: '',
      imageHint: '',
    },
  });

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    router.push('/login?redirect=/events/promote');
    return null;
  }

  const onSubmit: SubmitHandler<PromoteEventFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...data, 
          organizerId: user.uid,
          tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to promote event');
      }

      toast({
        title: 'Event Promoted!',
        description: 'Your event has been successfully listed.',
      });
      router.push('/events'); 
    } catch (error: any) {
      console.error('Error promoting event:', error);
      toast({
        title: 'Promotion Failed',
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
        title="Promote a Campus Event"
        description="Share details about an upcoming party, club meeting, or social gathering."
      />
      <Card className="mx-auto max-w-2xl shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <PartyPopper className="h-6 w-6 text-primary" />
            <CardTitle>Event Details</CardTitle>
          </div>
          <CardDescription>Fill out the form below to promote your event.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., End of Semester Bash, Coding Club Meetup" {...field} />
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
                    <FormLabel>Event Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Provide all relevant details about the event." {...field} rows={4} />
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
                        <Input placeholder="e.g., Social, Workshop, Club Meeting, Party" {...field} />
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
                      <FormLabel>Date & Time</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2024-10-26 8:00 PM" {...field} />
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
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Student Quad, Engineering Bldg Room 101" {...field} />
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
                      <Input placeholder="e.g., free food, live music, networking" {...field} />
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
                    <FormLabel>Image URL (Optional - e.g., event poster)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/poster.png (leave blank for default)" {...field} />
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
                      <Input placeholder="e.g., party students (1-2 keywords)" {...field} />
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
                {isSubmitting ? 'Promoting Event...' : 'Promote Event'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
