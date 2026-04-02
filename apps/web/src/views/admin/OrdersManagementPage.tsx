'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw, Save } from 'lucide-react';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import {
  exportAdminShipmentsCsv,
  fetchAdminShipments,
  updateAdminShipment,
  type AdminShipment,
} from '@/lib/platform-api';

export function OrdersManagementPage() {
  const [shipments, setShipments] = useState<AdminShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Record<string, { shipmentStatus: AdminShipment['shipmentStatus']; consignmentNumber: string; adminNotes: string }>>({});

  async function loadShipments() {
    try {
      setLoading(true);
      const data = await fetchAdminShipments();
      setShipments(data);
      setFormState(
        Object.fromEntries(
          data.map((item) => [
            item.id,
            {
              shipmentStatus: item.shipmentStatus,
              consignmentNumber: item.consignmentNumber ?? '',
              adminNotes: item.adminNotes ?? '',
            },
          ])
        )
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load shipments.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadShipments();
  }, []);

  const orderedShipments = useMemo(
    () => [...shipments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [shipments]
  );

  async function handleExport() {
    try {
      const csv = await exportAdminShipmentsCsv();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'shipping-list.csv';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not export shipping list.');
    }
  }

  async function handleSave(id: string) {
    const draft = formState[id];
    if (!draft) return;
    try {
      setSavingId(id);
      const updated = await updateAdminShipment(id, {
        shipmentStatus: draft.shipmentStatus,
        consignmentNumber: draft.consignmentNumber.trim() || null,
        adminNotes: draft.adminNotes.trim() || null,
      });
      setShipments((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setMessage(`Shipment ${updated.orderNumber} updated successfully.`);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update shipment.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl">Orders Management</h1>
          <p className="mt-2 text-slate-600">
            Manage physical-book orders, update DTDC consignment numbers, mark deliveries, and export the shipping list.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadShipments}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => void handleExport()}>
            <Download className="w-4 h-4 mr-2" />
            Export Shipping List
          </Button>
        </div>
      </div>

      {message && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="space-y-4">
        {loading ? (
          <Card>
            <p className="text-slate-600">Loading shipments…</p>
          </Card>
        ) : orderedShipments.length === 0 ? (
          <Card>
            <p className="text-slate-600">No physical-book shipments found yet.</p>
          </Card>
        ) : (
          orderedShipments.map((shipment) => {
            const draft = formState[shipment.id];
            return (
              <Card key={shipment.id}>
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex-1">
                    <div className="flex gap-2 mb-3 flex-wrap">
                      <Badge
                        variant={
                          shipment.shipmentStatus === 'delivered'
                            ? 'success'
                            : shipment.shipmentStatus === 'cancelled'
                              ? 'error'
                              : shipment.shipmentStatus === 'shipped'
                                ? 'info'
                                : 'warning'
                        }
                      >
                        {shipment.shipmentStatus}
                      </Badge>
                      <Badge variant="neutral">{shipment.carrier}</Badge>
                    </div>
                    <h3 className="text-lg">{shipment.itemTitle}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Order {shipment.orderNumber} • {shipment.customerName} • Qty {shipment.quantity}
                    </p>
                    <p className="mt-3 text-sm text-slate-700">
                      {shipment.shippingAddress.addressLine}
                      {shipment.shippingAddress.city ? `, ${shipment.shippingAddress.city}` : ''}
                      {shipment.shippingAddress.state ? `, ${shipment.shippingAddress.state}` : ''} - {shipment.shippingAddress.pinCode}
                    </p>
                    {shipment.trackingUrl && (
                      <a
                        href={shipment.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-sm text-indigo-600 hover:underline"
                      >
                        Open tracking page
                      </a>
                    )}
                  </div>

                  <div className="w-full xl:max-w-md space-y-4">
                    <label className="block">
                      <span className="mb-2 block text-sm text-slate-700">Shipment status</span>
                      <select
                        value={draft?.shipmentStatus ?? shipment.shipmentStatus}
                        onChange={(e) =>
                          setFormState((current) => ({
                            ...current,
                            [shipment.id]: {
                              shipmentStatus: e.target.value as AdminShipment['shipmentStatus'],
                              consignmentNumber: current[shipment.id]?.consignmentNumber ?? shipment.consignmentNumber ?? '',
                              adminNotes: current[shipment.id]?.adminNotes ?? shipment.adminNotes ?? '',
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm text-slate-700">DTDC consignment number</span>
                      <input
                        value={draft?.consignmentNumber ?? shipment.consignmentNumber ?? ''}
                        onChange={(e) =>
                          setFormState((current) => ({
                            ...current,
                            [shipment.id]: {
                              shipmentStatus: current[shipment.id]?.shipmentStatus ?? shipment.shipmentStatus,
                              consignmentNumber: e.target.value,
                              adminNotes: current[shipment.id]?.adminNotes ?? shipment.adminNotes ?? '',
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm text-slate-700">Admin notes</span>
                      <textarea
                        rows={3}
                        value={draft?.adminNotes ?? shipment.adminNotes ?? ''}
                        onChange={(e) =>
                          setFormState((current) => ({
                            ...current,
                            [shipment.id]: {
                              shipmentStatus: current[shipment.id]?.shipmentStatus ?? shipment.shipmentStatus,
                              consignmentNumber: current[shipment.id]?.consignmentNumber ?? shipment.consignmentNumber ?? '',
                              adminNotes: e.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      />
                    </label>
                    <Button onClick={() => void handleSave(shipment.id)} disabled={savingId === shipment.id}>
                      <Save className="w-4 h-4 mr-2" />
                      {savingId === shipment.id ? 'Saving…' : 'Save Shipment Update'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
