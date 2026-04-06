'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchCatalogItem,
  fetchCheckoutQuote,
  purchaseCatalogItem,
  type CatalogItem,
  type CheckoutQuote,
} from '@/lib/platform-api';
import { formatRupees } from '@/lib/price';

export function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const productSlug = searchParams.get('product') ?? '';
  const [product, setProduct] = useState<CatalogItem | null>(null);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [billingName, setBillingName] = useState(user?.name ?? '');
  const [billingEmail, setBillingEmail] = useState(user?.email ?? '');
  const [shipping, setShipping] = useState({
    fullName: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pinCode: '',
  });

  useEffect(() => {
    setBillingName(user?.name ?? '');
    setBillingEmail(user?.email ?? '');
    setShipping((current) => ({
      ...current,
      fullName: user?.name ?? current.fullName,
      email: user?.email ?? current.email,
    }));
  }, [user]);

  useEffect(() => {
    if (!productSlug) {
      setLoading(false);
      setProduct(null);
      setQuote(null);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const [item, initialQuote] = await Promise.all([
          fetchCatalogItem(productSlug),
          fetchCheckoutQuote({ product: productSlug }),
        ]);
        if (!cancelled) {
          setProduct(item);
          setQuote(initialQuote);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not prepare checkout.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [productSlug]);

  const requiresShipping = quote?.shipping.required ?? false;

  const subtotal = quote?.pricing.subtotal ?? 0;
  const discount = quote?.pricing.discount ?? 0;
  const total = quote?.pricing.total ?? 0;

  const purchasePayload = useMemo(
    () => ({
      product: productSlug,
      shipping: requiresShipping
        ? {
            ...shipping,
            fullName: shipping.fullName || billingName,
            email: shipping.email || billingEmail,
          }
        : undefined,
    }),
    [billingEmail, billingName, productSlug, requiresShipping, shipping]
  );

  async function refreshQuote() {
    if (!productSlug) return;
    try {
      const next = await fetchCheckoutQuote(purchasePayload);
      setQuote(next);
      setMessage('Quote updated.');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not refresh quote.');
    }
  }

  async function handlePurchase() {
    if (!user) {
      router.push(`/login?next=/checkout?product=${encodeURIComponent(productSlug)}`);
      return;
    }
    try {
      setSubmitting(true);
      const result = await purchaseCatalogItem(purchasePayload);
      router.push(`/order-confirmation?order=${encodeURIComponent(result.orderNumber)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete purchase.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl mb-8">Checkout</h1>

        {!productSlug && (
          <Card className="mb-8 text-center py-10">
            <p className="text-slate-600 mb-4">Select a course, ebook, book, live class, or exam first.</p>
            <Button onClick={() => router.push('/courses')}>Browse Catalog</Button>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-xl mb-4">Billing Information</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Full Name</label>
                  <input
                    type="text"
                    value={billingName}
                    onChange={(e) => setBillingName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </form>
            </Card>

            {requiresShipping && (
              <Card>
                <h2 className="text-xl mb-4">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(
                    [
                      ['fullName', 'Full Name'],
                      ['email', 'Email'],
                      ['phone', 'Phone Number'],
                      ['addressLine', 'Full Address'],
                      ['city', 'City'],
                      ['state', 'State'],
                      ['pinCode', 'Postal PIN Code'],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className={key === 'addressLine' ? 'md:col-span-2' : ''}>
                      <label className="block text-sm mb-2">{label}</label>
                      <input
                        type="text"
                        value={shipping[key]}
                        onChange={(e) =>
                          setShipping((current) => ({ ...current, [key]: e.target.value }))
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ))}
                </div>
                {quote?.shipping.message && (
                  <div
                    className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                      quote.shipping.deliveryAvailable
                        ? 'border-green-200 bg-green-50 text-green-800'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    <p>{quote.shipping.message}</p>
                    {quote.shipping.deliveryAvailable && quote.shipping.estimatedDays ? (
                      <p className="mt-1">
                        Carrier: {quote.shipping.carrier} • Estimated delivery in {quote.shipping.estimatedDays} day
                        {quote.shipping.estimatedDays === 1 ? '' : 's'}
                        {quote.shipping.city ? ` to ${quote.shipping.city}` : ''}.
                      </p>
                    ) : null}
                  </div>
                )}
              </Card>
            )}

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
                  <div className="w-20 h-14 bg-slate-200 rounded overflow-hidden">
                    {product && (
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm mb-1">{product?.title ?? 'Select a product'}</h3>
                    <p className="text-sm text-slate-600">{product?.type ?? 'Catalog item'}</p>
                  </div>
                </div>
              </div>

              {message && <p className="mb-3 text-sm text-green-700">{message}</p>}
              {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

              {requiresShipping && (
                <Button
                  fullWidth
                  variant="outline"
                  className="mb-4"
                  onClick={() => void refreshQuote()}
                  disabled={!shipping.pinCode.trim() || loading}
                >
                  Validate DTDC Delivery
                </Button>
              )}

              <div className="space-y-2 mb-4 pb-4 border-b border-slate-200">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatRupees(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatRupees(discount)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-lg mb-6">
                <span>Total</span>
                <span className="text-indigo-600">{formatRupees(total)}</span>
              </div>

              <Button
                fullWidth
                size="lg"
                onClick={() => void handlePurchase()}
                disabled={
                  loading ||
                  submitting ||
                  !productSlug ||
                  (requiresShipping && quote?.shipping.deliveryAvailable === false)
                }
              >
                {submitting ? 'Processing…' : 'Complete Purchase'}
              </Button>

              <p className="text-xs text-slate-600 text-center mt-4">
                This checkout currently uses the platform&apos;s demo purchase flow and creates real orders and entitlements.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
