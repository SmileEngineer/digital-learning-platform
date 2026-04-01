import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { Plus, Edit, Trash2 } from 'lucide-react';

const coupons = [
  { id: 1, code: 'LEARN20', discount: '20%', uses: 145, status: 'active' },
  { id: 2, code: 'SUMMER50', discount: '50%', uses: 89, status: 'active' },
];

export function CouponManagementPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl">Coupon Management</h1>
        <Button><Plus className="w-4 h-4 mr-2" />Create Coupon</Button>
      </div>
      
      <Card padding="none">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm">Code</th>
              <th className="text-left px-6 py-3 text-sm">Discount</th>
              <th className="text-left px-6 py-3 text-sm">Uses</th>
              <th className="text-left px-6 py-3 text-sm">Status</th>
              <th className="text-left px-6 py-3 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b last:border-0">
                <td className="px-6 py-4">{coupon.code}</td>
                <td className="px-6 py-4">{coupon.discount}</td>
                <td className="px-6 py-4">{coupon.uses}</td>
                <td className="px-6 py-4">
                  <Badge variant="success">{coupon.status}</Badge>
                </td>
                <td className="px-6 py-4">
                  <button className="p-2 hover:bg-slate-100 rounded mr-2">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
