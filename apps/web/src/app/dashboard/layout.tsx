import { DashboardAuthGate } from '@/components/DashboardAuthGate';
import { DashboardLayout } from '@/layouts/DashboardLayout';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAuthGate>
      <DashboardLayout>{children}</DashboardLayout>
    </DashboardAuthGate>
  );
}
