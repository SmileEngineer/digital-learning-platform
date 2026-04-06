import type { Metadata } from 'next';
import '@/styles/index.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Kantri Lawyer',
  description: 'Courses, eBooks, physical books, live classes, and practice exams',
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
