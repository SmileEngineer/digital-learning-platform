'use client';

import { Card } from '../../components/Card';
import { TrendingUp, Users, DollarSign, ShoppingBag, BookOpen, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 12400 },
  { month: 'Feb', revenue: 15800 },
  { month: 'Mar', revenue: 18200 },
  { month: 'Apr', revenue: 21500 },
];

export function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Admin Dashboard</h1>
        <p className="text-slate-600">Overview of platform performance</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600">Total Revenue</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl mb-1">$67,900</div>
          <div className="text-sm text-green-600">+12.5% from last month</div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600">Active Users</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl mb-1">3,240</div>
          <div className="text-sm text-blue-600">+8.2% from last month</div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600">Total Orders</span>
            <ShoppingBag className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl mb-1">892</div>
          <div className="text-sm text-purple-600">+15.3% from last month</div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600">Courses</span>
            <BookOpen className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl mb-1">127</div>
          <div className="text-sm text-slate-600">5 new this month</div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-xl mb-4">Revenue Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        <Card>
          <h2 className="text-xl mb-4">Sales by Category</h2>
          <div className="space-y-4">
            {[
              { name: 'Courses', value: 45, color: 'bg-blue-600' },
              { name: 'eBooks', value: 28, color: 'bg-purple-600' },
              { name: 'Live Classes', value: 18, color: 'bg-green-600' },
              { name: 'Practice Exams', value: 9, color: 'bg-orange-600' },
            ].map((item) => (
              <div key={item.name}>
                <div className="flex justify-between mb-2 text-sm">
                  <span>{item.name}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h2 className="text-xl mb-4">Recent Orders</h2>
          <div className="space-y-3 text-sm">
            {[1,2,3].map((i) => (
              <div key={i} className="flex justify-between">
                <span className="text-slate-600">ORD-2026-{4320 + i}</span>
                <span className="text-green-600">$89.99</span>
              </div>
            ))}
          </div>
        </Card>
        
        <Card>
          <h2 className="text-xl mb-4">Popular Courses</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-700">Web Development</span>
              <span className="text-slate-600">1,245 enrollments</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Data Science</span>
              <span className="text-slate-600">892 enrollments</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Digital Marketing</span>
              <span className="text-slate-600">654 enrollments</span>
            </div>
          </div>
        </Card>
        
        <Card>
          <h2 className="text-xl mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 rounded transition-colors">
              Add New Course
            </button>
            <button className="w-full text-left px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 rounded transition-colors">
              Create Coupon
            </button>
            <button className="w-full text-left px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 rounded transition-colors">
              View Reports
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
