import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | License Guard',
    default: 'License Guard — Centralized License Management',
  },
  description:
    'Centralized License Guard: monitor, activate, and suspend client site licenses from a single admin dashboard.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
