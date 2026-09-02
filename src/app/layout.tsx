import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shreenathji Trade Links',
  description: 'Industrial raw materials and export enquiries.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
