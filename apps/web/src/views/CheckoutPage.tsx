'use client';

import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Tag, CreditCard } from 'lucide-react';

export function CheckoutPage() {
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  
  const subtotal = 89.99;
  const total = subtotal - discount;
  
  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-xl mb-4">Billing Information</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">First Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-2">Country</label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500">
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                  </select>
                </div>
              </form>
            </Card>
            
            <Card>
              <h2 className="text-xl mb-4">Payment Method</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 border-2 border-indigo-600 rounded-lg bg-indigo-50">
                  <input type="radio" name="payment" checked readOnly />
                  <CreditCard className="w-5 h-5" />
                  <span>Credit / Debit Card</span>
                </div>
                
                <div>
                  <label className="block text-sm mb-2">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-xl mb-4">Order Summary</h2>
              
              <div className="mb-4 pb-4 border-b border-slate-200">
                <div className="flex gap-3">
                  <div className="w-20 h-14 bg-slate-200 rounded"></div>
                  <div className="flex-1">
                    <h3 className="text-sm mb-1">Complete Web Development Bootcamp</h3>
                    <p className="text-sm text-slate-600">Course</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm mb-2">Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 text-sm"
                  />
                  <Button 
                    size="sm"
                    onClick={() => setDiscount(18)}
                  >
                    Apply
                  </Button>
                </div>
                {discount > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="success" size="sm">
                      <Tag className="w-3 h-3 mr-1" />
                      LEARN20 applied
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mb-4 pb-4 border-b border-slate-200">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount (20%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between text-lg mb-6">
                <span>Total</span>
                <span className="text-indigo-600">${total.toFixed(2)}</span>
              </div>
              
              <Button fullWidth size="lg">
                Complete Purchase
              </Button>
              
              <p className="text-xs text-slate-600 text-center mt-4">
                By completing your purchase you agree to our Terms of Service
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
