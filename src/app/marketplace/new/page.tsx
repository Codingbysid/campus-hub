
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ShoppingBag } from 'lucide-react';

const marketplaceItemSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  category: z.string().min(2, 'Category must be at least 2 characters').max(50),
  price: z.string().regex(/^\$?(\d{1,3}(,\d{3})*(\.\d{2})?|\.\d{2}|\d+)$/, 'Invalid price format (e.g., $10.99 or 10.99)'),
  tags: z.string().optional(),
  imageUrl: z.string().url({ message: "Please enter a valid URL or leave blank for a placeholder." }).optional().or(z.literal('')),
  imageHint: z.string().max(50, "Hint too long").optional(),
});

type MarketplaceItemFormValues = z.infer<typeof marketplaceItemSchema>;

export default function PostNewMarketplaceItemPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MarketplaceItemFormValues>({
    resolver: zodResolver(marketplaceItemSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      price: '',
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
    router.push('/login?redirect=/marketplace/new');
    return null;
  }

  const onSubmit: SubmitHandler<MarketplaceItemFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/marketplace/items', {
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
        throw new Error(errorData.message || 'Failed to post item');
      }

      toast({
        title: 'Item Posted!',
        description: 'Your item has been successfully listed in the marketplace.',
      });
      router.push('/'); // Redirect to marketplace homepage
    } catch (error: any) {
      console.error('Error posting item:', error);
      toast({
        title: 'Posting Failed',
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
        title="Post a New Item"
        description="List an item for sale in the student marketplace."
      />
      <Card className="mx-auto max-w-2xl shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <CardTitle>Item Details</CardTitle>
          </div>
          <CardDescription>Fill out the form below to list your item.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Vintage Graphic Tee" {...field} />
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
                      <Textarea placeholder="e.g., Comfortable cotton graphic tee, size M. Lightly worn." {...field} rows={4} />
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
                        <Input placeholder="e.g., Apparel, Electronics, Textbooks" {...field} />
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
                        <Input placeholder="e.g., $15.00 or 15" {...field} />
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
                      <Input placeholder="e.g., vintage, cotton, study" {...field} />
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
                      <Input placeholder="e.g., textbook study (1-2 keywords)" {...field} />
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
                {isSubmitting ? 'Posting Item...' : 'Post Item'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
