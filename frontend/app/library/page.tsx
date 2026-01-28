'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/lib/api-client';

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: {
    asset: {
      id: string;
      title: string;
      description: string;
      fileKey: string;
    };
  }[];
}

export default function LibraryPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/api/auth/login');
    } else if (user) {
      fetchOrders();
    }
  }, [user, isLoading, router]);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get('/orders/me');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (assetId: string, title: string) => {
    try {
      const response = await apiClient.get(`/assets/${assetId}/download`);
      if (response.data.url) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = response.data.url;
        link.download = title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Failed to download asset:', error);
      alert('Failed to download. Please try again.');
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const paidOrders = orders.filter(order => order.status === 'PAID');

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
            <Button variant="ghost" onClick={() => router.push('/dashboard/sell')}>
              Sell
            </Button>
            <Button variant="outline" onClick={() => router.push('/api/auth/logout')}>
              Logout
            </Button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold mb-8">My Library</h2>
        
        {paidOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600 mb-4">You haven't purchased any assets yet.</p>
              <Button onClick={() => router.push('/')}>Browse Assets</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paidOrders.map((order) =>
              order.items.map((item) => (
                <Card key={item.asset.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{item.asset.title}</CardTitle>
                    <CardDescription>
                      Purchased on {new Date(order.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                      {item.asset.description}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => handleDownload(item.asset.id, item.asset.title)}
                    >
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
