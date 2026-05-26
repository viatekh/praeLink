import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'praeLink Equipment Rental',
  description: 'Lightweight rental platform'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav style={{display: 'flex', gap: 12, padding: '18px', background: '#f6f1ff'}}>
          <Link href="/">Dashboard</Link>
          <Link href="/inventory">Inventory</Link>
          <Link href="/packages">Packages</Link>
          <Link href="/clients">Clients</Link>
          <Link href="/projects">Projects</Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
