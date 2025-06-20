
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Loader2, HelpCircle } from 'lucide-react';

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

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    router.push('/login?redirect=/lost-and-found/report');
    return null;
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

      toast({
        title: 'Item Reported!',
        description: 'Your item report has been successfully submitted.',
      });
      router.push('/lost-and-found'); 
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
  );
}
