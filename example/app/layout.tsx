import './globals.css';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log Console',
  description: 'Light log console',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
