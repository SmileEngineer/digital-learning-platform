'use client';

import { useEffect, useState } from 'react';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { CheckCircle, ExternalLink, Truck } from 'lucide-react';
import { fetchLearnerOrders, type LearnerOrder } from '@/lib/platform-api';

export function MyOrdersPage() {
  const [orders, setOrders] = useState<LearnerOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLearnerOrders()
      .then((items) => {
        if (!cancelled) {
          setOrders(items);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load orders.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="text-3xl mb-8">My Orders</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => (
          <Card key={`${order.orderNumber}-${order.itemSlug}`} hover>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="mb-1">Order {order.orderNumber}</h3>
                <div className="text-sm text-slate-600">
                  {new Date(order.createdAt).toLocaleDateString('en-US')}
                </div>
              </div>
              <Badge variant={order.status === 'delivered' || order.status === 'paid' ? 'success' : 'warning'}>
                {(order.status === 'shipping' || order.status === 'processing') && <Truck className="w-3 h-3 mr-1" />}
                {(order.status === 'delivered' || order.status === 'paid') && <CheckCircle className="w-3 h-3 mr-1" />}
                {order.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 mb-1">{order.itemTitle}</div>
                <div className="text-lg">${order.totalAmount.toFixed(2)}</div>
                {order.consignmentNumber && (
                  <div className="text-xs text-slate-500 mt-1">
                    Tracking: {order.consignmentNumber} {order.carrier ? `(${order.carrier})` : ''}
                  </div>
                )}
                {order.pinCode && (
                  <div className="text-xs text-slate-500 mt-1">
                    Delivery PIN: {order.pinCode}
                    {order.city ? ` • ${order.city}` : ''}
                  </div>
                )}
              </div>
              {order.trackingUrl ? (
                <a href={order.trackingUrl} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Track Order
                  </Button>
                </a>
              ) : (
                <Button size="sm" variant="outline" disabled>
                  View Details
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
