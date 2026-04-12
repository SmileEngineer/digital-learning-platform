import { DashboardAuthGate } from '@/components/DashboardAuthGate';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { RootLayout } from '@/layouts/RootLayout';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAuthGate>
      <RootLayout>
        <DashboardLayout>{children}</DashboardLayout>
      </RootLayout>
    </DashboardAuthGate>
  );
}
