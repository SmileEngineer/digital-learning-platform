import { RootLayout } from '@/layouts/RootLayout';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootLayout>{children}</RootLayout>;
}
