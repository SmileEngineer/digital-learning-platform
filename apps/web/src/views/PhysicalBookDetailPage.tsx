'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, Truck, Star } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { fetchCatalogItem, type CatalogItem } from '@/lib/platform-api';

export function PhysicalBookDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const slug = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetchCatalogItem(slug)
      .then((book) => {
        if (!cancelled) {
          setItem(book);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load book.');
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!item || error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="text-center py-12">
          <h1 className="text-2xl mb-2">Book unavailable</h1>
          <p className="text-slate-600">{error ?? 'This book could not be found.'}</p>
        </Card>
      </div>
    );
  }

  const stock = item.stock ?? 0;

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Badge variant={stock > 0 ? 'success' : 'error'} className="mb-3">
                {stock > 0 ? 'In Stock' : 'Out of Stock'}
              </Badge>
              <h1 className="text-4xl mb-3">{item.title}</h1>
              <p className="text-lg text-slate-600 mb-4">by {item.author ?? item.instructor}</p>

              {item.rating && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span>{item.rating.toFixed(1)} rating</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-8">
              <img src={item.image} alt={item.title} className="w-full max-w-md mx-auto object-contain rounded-lg" />
            </div>

            <Card className="mb-8">
              <h2 className="text-2xl mb-4">Description</h2>
              <div className="prose prose-slate max-w-none text-slate-700">
                <p>{item.description}</p>
              </div>
            </Card>

            <Card className="mb-8">
              <h2 className="text-2xl mb-4">Book Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-600">Author</div>
                  <div>{item.author ?? item.instructor}</div>
                </div>
                <div>
                  <div className="text-slate-600">Catalog Type</div>
                  <div>Physical Book</div>
                </div>
                <div>
                  <div className="text-slate-600">Stock</div>
                  <div>{stock}</div>
                </div>
                <div>
                  <div className="text-slate-600">Price</div>
                  <div>${item.price.toFixed(2)}</div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Truck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mb-2 text-blue-900">Shipping Information</h3>
                  <p className="text-sm text-blue-800">
                    Delivery availability is validated by PIN code during checkout. Physical books create real
                    orders and shipment records in the platform database.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <div className="text-3xl text-indigo-600 mb-4">${item.price.toFixed(2)}</div>

                <div className="mb-4">
                  <Badge variant={stock > 0 ? 'success' : 'error'}>
                    <Package className="w-3 h-3 mr-1" />
                    {stock} in stock
                  </Badge>
                </div>

                <Button
                  fullWidth
                  size="lg"
                  className="mb-3"
                  disabled={stock === 0}
                  onClick={() => router.push(`/checkout?product=${item.slug}`)}
                >
                  Buy Now
                </Button>
                <Button
                  fullWidth
                  variant="outline"
                  size="lg"
                  onClick={() => router.push(`/checkout?product=${item.slug}`)}
                >
                  Validate Delivery
                </Button>

                <div className="mt-6 border-t border-slate-200 pt-6">
                  <h3 className="mb-3">Shipping Options:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Standard (5-7 days)</span>
                      <span>Validated at checkout</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PIN check</span>
                      <span>DTDC-style flow</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
