import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Plus } from 'lucide-react';

export function ArticlesManagementPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl">Articles Management</h1>
        <Button><Plus className="w-4 h-4 mr-2" />New Article</Button>
      </div>
      <Card><p className="text-slate-600">Articles management interface</p></Card>
    </div>
  );
}
