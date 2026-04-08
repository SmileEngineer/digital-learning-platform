'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  createRazorpayServerOrder,
  fetchCatalogItem,
  fetchCheckoutCapabilities,
  fetchCheckoutQuote,
  purchaseCatalogItem,
  verifyRazorpayCheckout,
  type CatalogItem,
  type CheckoutQuote,
} from '@/lib/platform-api';
import { formatRupees } from '@/lib/price';

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const w = window as unknown as { Razorpay?: unknown };
  if (w.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not load Razorpay checkout.'));
    document.body.appendChild(s);
  });
}

export function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const productSlug = searchParams.get('product') ?? '';
  const checkoutPath = productSlug ? `/checkout?product=${encodeURIComponent(productSlug)}` : '/checkout';
  const loginPath = `/login?next=${encodeURIComponent(checkoutPath)}`;
  const [product, setProduct] = useState<CatalogItem | null>(null);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<{ demo: boolean; razorpay: boolean } | null>(null);
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
    fetchCheckoutCapabilities()
      .then(setCapabilities)
      .catch(() => setCapabilities({ demo: true, razorpay: false }));
  }, []);

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

  const useRazorpay =
    !!capabilities?.razorpay && product?.currency === 'INR' && total > 0;

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

  async function handleDemoPurchase() {
    if (!user) {
      router.push(loginPath);
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

  async function handleRazorpay() {
    if (!user) {
      router.push(loginPath);
      return;
    }
    if (!product || product.currency !== 'INR') {
      setError('Razorpay is only enabled for INR catalog items.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await loadRazorpayScript();
      const rz = await createRazorpayServerOrder(purchasePayload);
      const Rzp = (
        window as unknown as {
          Razorpay: new (opts: Record<string, unknown>) => {
            open: () => void;
            on: (ev: string, fn: (x: unknown) => void) => void;
          };
        }
      ).Razorpay;

      const rzp = new Rzp({
        key: rz.keyId,
        amount: rz.amount,
        currency: rz.currency,
        name: 'Kantri Lawyer',
        description: product.title,
        order_id: rz.orderId,
        handler: async (response: unknown) => {
          const r = response as RazorpaySuccessResponse;
          try {
            setSubmitting(true);
            const result = await verifyRazorpayCheckout({
              ...purchasePayload,
              razorpay_order_id: r.razorpay_order_id,
              razorpay_payment_id: r.razorpay_payment_id,
              razorpay_signature: r.razorpay_signature,
            });
            router.push(`/order-confirmation?order=${encodeURIComponent(result.orderNumber)}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment verification failed.');
          } finally {
            setSubmitting(false);
          }
        },
        prefill: {
          name: billingName,
          email: billingEmail,
        },
        theme: { color: '#4f46e5' },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
          },
        },
      });

      rzp.on('payment.failed', (failure: unknown) => {
        const f = failure as { error?: { description?: string } };
        setError(f?.error?.description ?? 'Payment failed.');
        setSubmitting(false);
      });

      rzp.open();
      setSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start payment.');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto max-w-5xl px-4">
        <h1 className="mb-8 text-3xl">Checkout</h1>

        {!productSlug && (
          <Card className="mb-8 py-10 text-center">
            <p className="mb-4 text-slate-600">Select a course, ebook, book, live class, or exam first.</p>
            <Button onClick={() => router.push('/courses')}>Browse Catalog</Button>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {authLoading ? (
              <Card>
                <p className="text-slate-600">Loading checkout details...</p>
              </Card>
            ) : !user ? (
              <Card>
                <h2 className="mb-3 text-xl">Sign In Required</h2>
                <p className="mb-5 text-sm text-slate-600">
                  Billing, shipping, and payment details are available only after sign-in. Complete authentication
                  first, then continue with checkout.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button onClick={() => router.push(loginPath)}>Sign in to continue</Button>
                  <Button variant="outline" onClick={() => router.push('/courses')}>
                    Browse catalog
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                <Card>
                  <h2 className="mb-4 text-xl">Billing Information</h2>
                  <form className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm">Full Name</label>
                      <input
                        type="text"
                        value={billingName}
                        onChange={(e) => setBillingName(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm">Email</label>
                      <input
                        type="email"
                        value={billingEmail}
                        onChange={(e) => setBillingEmail(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </form>
                </Card>

                {requiresShipping && (
                  <Card>
                    <h2 className="mb-4 text-xl">Shipping Information</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                          <label className="mb-2 block text-sm">{label}</label>
                          <input
                            type="text"
                            value={shipping[key]}
                            onChange={(e) =>
                              setShipping((current) => ({ ...current, [key]: e.target.value }))
                            }
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
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
                            Carrier: {quote.shipping.carrier} - Estimated delivery in {quote.shipping.estimatedDays} day
                            {quote.shipping.estimatedDays === 1 ? '' : 's'}
                            {quote.shipping.city ? ` to ${quote.shipping.city}` : ''}.
                          </p>
                        ) : null}
                      </div>
                    )}
                  </Card>
                )}

                <Card>
                  <h2 className="mb-3 text-xl">Payment</h2>
                  <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <Lock className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                    <div>
                      {useRazorpay ? (
                        <p>
                          Secure payment is processed by <strong>Razorpay</strong> (cards, UPI, netbanking where supported).
                          Configure <code className="text-xs">RAZORPAY_KEY_ID</code> and{' '}
                          <code className="text-xs">RAZORPAY_KEY_SECRET</code> on the API.
                        </p>
                      ) : (
                        <p>
                          <strong>Demo checkout:</strong> card fields are not used. Completing purchase records a paid order
                          immediately for testing. For production INR payments, configure Razorpay on the API.
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card>
              <h2 className="mb-4 text-xl">Order Summary</h2>

              <div className="mb-4 border-b border-slate-200 pb-4">
                <div className="flex gap-3">
                  <div className="h-14 w-20 overflow-hidden rounded bg-slate-200">
                    {product && (
                      <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-sm">{product?.title ?? 'Select a product'}</h3>
                    <p className="text-sm text-slate-600">{product?.type ?? 'Catalog item'}</p>
                  </div>
                </div>
              </div>

              {message && <p className="mb-3 text-sm text-green-700">{message}</p>}
              {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

              {requiresShipping && user && (
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

              <div className="mb-4 space-y-2 border-b border-slate-200 pb-4">
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

              <div className="mb-6 flex justify-between text-lg">
                <span>Total</span>
                <span className="text-indigo-600">{formatRupees(total)}</span>
              </div>

              {authLoading ? (
                <Button fullWidth size="lg" disabled>
                  Loading...
                </Button>
              ) : !user ? (
                <Button fullWidth size="lg" onClick={() => router.push(loginPath)} disabled={!productSlug}>
                  Sign in to continue
                </Button>
              ) : useRazorpay ? (
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => void handleRazorpay()}
                  disabled={
                    loading ||
                    submitting ||
                    !productSlug ||
                    (requiresShipping && quote?.shipping.deliveryAvailable === false)
                  }
                >
                  {submitting ? 'Processing...' : 'Pay with Razorpay'}
                </Button>
              ) : (
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => void handleDemoPurchase()}
                  disabled={
                    loading ||
                    submitting ||
                    !productSlug ||
                    (requiresShipping && quote?.shipping.deliveryAvailable === false)
                  }
                >
                  {submitting ? 'Processing...' : 'Complete demo purchase'}
                </Button>
              )}

              <p className="mt-4 text-center text-xs text-slate-600">
                {!user
                  ? 'Please sign in before entering billing, shipping, or payment details.'
                  : useRazorpay
                  ? 'You will complete payment in the Razorpay window. Orders are confirmed after successful payment.'
                  : 'Demo mode creates a paid order and unlocks digital access without a real payment gateway.'}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
