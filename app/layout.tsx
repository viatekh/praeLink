import './globals.css';
import Link from 'next/link';
import { AppBar, Toolbar, Typography, Box, Button, Stack } from '@mui/material';

export const metadata = {
  title: 'praeLink Equipment Rental',
  description: 'Lightweight rental platform'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppBar position="static" sx={{ mb: 3, bgcolor: '#6443cb' }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>praeLink</Typography>
            <Stack direction="row" spacing={2}>
              <Link href="/" passHref legacyBehavior>
                <Button color="inherit">Dashboard</Button>
              </Link>
              <Link href="/inventory" passHref legacyBehavior>
                <Button color="inherit">Inventory</Button>
              </Link>
              <Link href="/packages" passHref legacyBehavior>
                <Button color="inherit">Packages</Button>
              </Link>
              <Link href="/clients" passHref legacyBehavior>
                <Button color="inherit">Clients</Button>
              </Link>
              <Link href="/projects" passHref legacyBehavior>
                <Button color="inherit">Projects</Button>
              </Link>
            </Stack>
          </Toolbar>
        </AppBar>
        <main>{children}</main>
      </body>
    </html>
  );
}
