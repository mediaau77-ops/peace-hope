import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Peace & Hope',
  description: 'Peace & Hope frontend split scaffold',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
