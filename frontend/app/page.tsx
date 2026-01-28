'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/lib/api-client';

interface Asset {
  id: string;
  title: string;
  description: string;
  price: number;
  previewKey: string;
  seller: {
    email: string;
  };
}

export default function Home() {
  const { user, isLoading } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await apiClient.get('/assets');
      setAssets(response.data);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (assetId: string) => {
    try {
      const response = await apiClient.post('/payments/checkout', { assetId });
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Failed to create checkout:', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ProSets
          </h1>
          <nav className="flex gap-4 items-center">
            {user ? (
              <>
                <Link href="/library">
                  <Button variant="ghost">My Library</Button>
                </Link>
                <Link href="/dashboard/sell">
                  <Button variant="ghost">Sell</Button>
                </Link>
                <Button variant="outline" onClick={() => useAuth().logout()}>Logout</Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Digital Assets Marketplace
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
          Buy and sell digital assets securely with blockchain-level security
        </p>
      </section>

      {/* Assets Grid */}
      <section className="container mx-auto px-4 pb-16">
        <h3 className="text-3xl font-bold mb-8">Featured Assets</h3>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading assets...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No assets available yet.</p>
            {user && (
              <Link href="/dashboard/sell">
                <Button className="mt-4">Be the first to sell!</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <Card key={asset.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{asset.title}</CardTitle>
                  <CardDescription>by {asset.seller.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                    {asset.description}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">
                    ${Number(asset.price).toFixed(2)}
                  </span>
                  {user ? (
                    <Button onClick={() => handlePurchase(asset.id)}>
                      Buy Now
                    </Button>
                  ) : (
                    <Link href="/login">
                      <Button>Login to Buy</Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
