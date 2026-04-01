import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export function ChangePasswordPage() {
  return (
    <div>
      <h1 className="text-3xl mb-8">Change Password</h1>
      
      <Card className="max-w-2xl">
        <form className="space-y-6">
          <div>
            <label className="block text-sm mb-2">Current Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <Button type="submit" size="lg">
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
