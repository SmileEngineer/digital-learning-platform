import type { NeonQueryFunction } from '@neondatabase/serverless';

type DeliveryRow = {
  pin_code: string;
  city: string | null;
  state: string | null;
  carrier: string;
  estimated_days: number;
  is_active: boolean;
  notes: string | null;
};

export type DeliveryCheckResult = {
  pinCode: string;
  available: boolean;
  carrier: string;
  city: string | null;
  state: string | null;
  estimatedDays: number | null;
  message: string;
  trackingBaseUrl: string;
};

export function normalizePinCode(value: string): string {
  return value.trim();
}

export function isValidPinFormat(pin: string): boolean {
  return /^\d{6}$/.test(pin) && !pin.startsWith('0');
}

export function buildDtdcTrackingUrl(consignmentNumber: string): string {
  return `https://www.dtdc.in/tracking/default.asp?strCnno=${encodeURIComponent(consignmentNumber)}`;
}

export async function lookupDeliveryAvailability(
  sql: NeonQueryFunction<false, false>,
  pinCode: string
): Promise<DeliveryCheckResult> {
  const pin = normalizePinCode(pinCode);
  if (!isValidPinFormat(pin)) {
    return {
      pinCode: pin,
      available: false,
      carrier: 'DTDC',
      city: null,
      state: null,
      estimatedDays: null,
      message: 'Enter a valid 6-digit PIN code.',
      trackingBaseUrl: buildDtdcTrackingUrl('TRACKING_NUMBER'),
    };
  }

  const rows = (await sql`
    SELECT pin_code, city, state, carrier, estimated_days, is_active, notes
    FROM delivery_serviceability
    WHERE pin_code = ${pin}
    LIMIT 1
  `) as DeliveryRow[];

  const row = rows[0] ?? null;
  if (row && !row.is_active) {
    return {
      pinCode: pin,
      available: false,
      carrier: row.carrier,
      city: row.city,
      state: row.state,
      estimatedDays: null,
      message: 'DTDC delivery is not currently available for this PIN code.',
      trackingBaseUrl: buildDtdcTrackingUrl('TRACKING_NUMBER'),
    };
  }

  if (!row) {
    return {
      pinCode: pin,
      available: true,
      carrier: 'DTDC',
      city: null,
      state: null,
      estimatedDays: 5,
      message: 'DTDC delivery can be arranged for this PIN code. Final confirmation happens at order processing.',
      trackingBaseUrl: buildDtdcTrackingUrl('TRACKING_NUMBER'),
    };
  }

  return {
    pinCode: row.pin_code,
    available: true,
    carrier: row.carrier,
    city: row.city,
    state: row.state,
    estimatedDays: row.estimated_days,
    message: row.notes
      ? `${row.carrier} delivery available. ${row.notes}`
      : `${row.carrier} delivery is available for this PIN code.`,
    trackingBaseUrl: buildDtdcTrackingUrl('TRACKING_NUMBER'),
  };
}
