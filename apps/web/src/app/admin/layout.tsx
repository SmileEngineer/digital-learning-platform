import { AdminAuthGate } from '@/components/AdminAuthGate';
import { AdminLayout } from '@/layouts/AdminLayout';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGate>
      <AdminLayout>{children}</AdminLayout>
    </AdminAuthGate>
  );
}
