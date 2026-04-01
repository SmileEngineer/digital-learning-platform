import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export function ProfileSettingsPage() {
  return (
    <div>
      <h1 className="text-3xl mb-8">Profile Settings</h1>
      
      <Card className="max-w-2xl">
        <form className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-slate-200 rounded-full"></div>
            <div>
              <Button size="sm">Change Photo</Button>
              <p className="text-sm text-slate-600 mt-2">JPG or PNG, max 2MB</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">First Name</label>
              <input
                type="text"
                defaultValue="John"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Last Name</label>
              <input
                type="text"
                defaultValue="Doe"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm mb-2">Email</label>
            <input
              type="email"
              defaultValue="john@example.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">Phone</label>
            <input
              type="tel"
              defaultValue="+1 (555) 123-4567"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">Bio</label>
            <textarea
              rows={4}
              placeholder="Tell us about yourself..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            ></textarea>
          </div>
          
          <Button type="submit" size="lg">
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
