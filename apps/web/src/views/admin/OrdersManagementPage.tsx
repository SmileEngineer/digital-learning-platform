import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';

const orders = [
  { id: 'ORD-2026-4321', customer: 'John Doe', total: 89.99, status: 'completed', date: 'Mar 28, 2026' },
  { id: 'ORD-2026-4320', customer: 'Jane Smith', total: 45.99, status: 'shipping', date: 'Mar 27, 2026' },
];

export function OrdersManagementPage() {
  return (
    <div>
      <h1 className="text-3xl mb-8">Orders Management</h1>
      
      <Card padding="none">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm">Order ID</th>
              <th className="text-left px-6 py-3 text-sm">Customer</th>
              <th className="text-left px-6 py-3 text-sm">Total</th>
              <th className="text-left px-6 py-3 text-sm">Status</th>
              <th className="text-left px-6 py-3 text-sm">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b last:border-0">
                <td className="px-6 py-4">{order.id}</td>
                <td className="px-6 py-4">{order.customer}</td>
                <td className="px-6 py-4">${order.total}</td>
                <td className="px-6 py-4">
                  <Badge variant={order.status === 'completed' ? 'success' : 'warning'}>
                    {order.status}
                  </Badge>
                </td>
                <td className="px-6 py-4">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
