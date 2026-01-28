'use client';

import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import apiClient from '@/lib/api-client';

const assetSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0.01, 'Price must be at least $0.01'),
  file: z.any(),
  preview: z.any(),
});

type AssetFormData = z.infer<typeof assetSchema>;

export default function SellPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<File | null>(null);

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
    },
  });

  if (!isLoading && !user) {
    router.push('/api/auth/login');
    return null;
  }

  const uploadFileToS3 = async (file: File, type: 'file' | 'preview'): Promise<string> => {
    // Step 1: Get presigned URL from backend
    const key = `${type}s/${Date.now()}-${file.name}`;
    const response = await apiClient.post('/storage/upload-url', {
      key,
      contentType: file.type,
    });

    const { url } = response.data;

    // Step 2: Upload file directly to S3
    await axios.put(url, file, {
      headers: {
        'Content-Type': file.type,
      },
      onUploadProgress: (progressEvent) => {
        const progress = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
        setUploadProgress(progress);
      },
    });

    return key;
  };

  const onSubmit = async (data: AssetFormData) => {
    if (!selectedFile || !selectedPreview) {
      alert('Please select both a file and a preview image');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload files to S3
      setUploadProgress(10);
      const fileKey = await uploadFileToS3(selectedFile, 'file');
      
      setUploadProgress(50);
      const previewKey = await uploadFileToS3(selectedPreview, 'preview');

      setUploadProgress(75);

      // Create asset in database
      await apiClient.post('/assets', {
        title: data.title,
        description: data.description,
        price: data.price,
        fileKey,
        previewKey,
        status: 'PUBLISHED',
      });

      setUploadProgress(100);
      alert('Asset created successfully!');
      router.push('/');
    } catch (error) {
      console.error('Failed to create asset:', error);
      alert('Failed to create asset. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ProSets
          </h1>
          <nav className="flex gap-4">
            <Button variant="ghost" onClick={() => router.push('/')}>
              Home
            </Button>
            <Button variant="ghost" onClick={() => router.push('/library')}>
              My Library
            </Button>
            <Button variant="outline" onClick={() => router.push('/api/auth/logout')}>
              Logout
            </Button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Sell Your Digital Asset</CardTitle>
            <CardDescription>
              Upload your digital product and start earning
            </CardDescription>
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
                        <Input placeholder="My Amazing Digital Product" {...field} />
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
                        <textarea
                          className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                          placeholder="Describe your product..."
                          {...field}
                        />
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
                      <FormLabel>Price (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="9.99"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>Product File</Label>
                  <Input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    disabled={uploading}
                  />
                  <p className="text-sm text-slate-500">
                    The actual file that buyers will download
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Preview Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedPreview(e.target.files?.[0] || null)}
                    disabled={uploading}
                  />
                  <p className="text-sm text-slate-500">
                    A preview image to show potential buyers
                  </p>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-center text-slate-600">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Create Asset'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
