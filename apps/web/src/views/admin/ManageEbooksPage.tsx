import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

const ebooks = [
  { id: 1, title: 'JavaScript Guide', downloads: 523, price: 29.99, status: 'published' },
  { id: 2, title: 'Python Book', downloads: 412, price: 34.99, status: 'published' },
];

export function ManageEbooksPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl">Manage eBooks</h1>
        <Button><Plus className="w-4 h-4 mr-2" />Add eBook</Button>
      </div>
      
      <Card padding="none">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm">Title</th>
              <th className="text-left px-6 py-3 text-sm">Downloads</th>
              <th className="text-left px-6 py-3 text-sm">Price</th>
              <th className="text-left px-6 py-3 text-sm">Status</th>
              <th className="text-left px-6 py-3 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ebooks.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="px-6 py-4">{item.title}</td>
                <td className="px-6 py-4">{item.downloads}</td>
                <td className="px-6 py-4">${item.price}</td>
                <td className="px-6 py-4">
                  <Badge variant="success">{item.status}</Badge>
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
