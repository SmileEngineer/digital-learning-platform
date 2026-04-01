import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Package, Truck, CheckCircle } from 'lucide-react';

const orders = [
  { id: 'ORD-2026-4321', date: 'March 28, 2026', items: 'Complete Web Dev Course', total: 71.99, status: 'completed' },
  { id: 'ORD-2026-4320', date: 'March 25, 2026', items: 'Python Book (Physical)', total: 45.99, status: 'shipping' },
  { id: 'ORD-2026-4319', date: 'March 20, 2026', items: 'JavaScript eBook', total: 29.99, status: 'completed' },
];

export function MyOrdersPage() {
  return (
    <div>
      <h1 className="text-3xl mb-8">My Orders</h1>
      
      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => (
          <Card key={order.id} hover>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="mb-1">Order {order.id}</h3>
                <div className="text-sm text-slate-600">{order.date}</div>
              </div>
              <Badge variant={order.status === 'completed' ? 'success' : 'warning'}>
                {order.status === 'shipping' && <Truck className="w-3 h-3 mr-1" />}
                {order.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                {order.status === 'shipping' ? 'Shipping' : 'Completed'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 mb-1">{order.items}</div>
                <div className="text-lg">${order.total}</div>
              </div>
              <Button size="sm" variant="outline">
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
