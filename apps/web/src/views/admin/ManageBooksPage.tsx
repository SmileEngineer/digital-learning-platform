import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { Plus, Edit, Trash2 } from 'lucide-react';

export function ManageBooksPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl">Manage Physical Books</h1>
        <Button><Plus className="w-4 h-4 mr-2" />Add Book</Button>
      </div>
      <Card><p className="text-slate-600">Physical books management interface</p></Card>
    </div>
  );
}
