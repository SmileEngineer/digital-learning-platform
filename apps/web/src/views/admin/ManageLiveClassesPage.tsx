import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Plus } from 'lucide-react';

export function ManageLiveClassesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl">Manage Live Classes</h1>
        <Button><Plus className="w-4 h-4 mr-2" />Schedule Class</Button>
      </div>
      <Card><p className="text-slate-600">Live classes management interface</p></Card>
    </div>
  );
}
