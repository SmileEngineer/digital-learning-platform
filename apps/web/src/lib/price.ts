export function formatRupees(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  const minimumFractionDigits = Number.isInteger(value) ? 0 : 2;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(value);
}
