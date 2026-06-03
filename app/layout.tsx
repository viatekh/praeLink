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
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              praeLink
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button color="inherit" component={Link} href="/">Dashboard</Button>
              <Button color="inherit" component={Link} href="/inventory">Inventory</Button>
              <Button color="inherit" component={Link} href="/packages">Packages</Button>
              <Button color="inherit" component={Link} href="/clients">Clients</Button>
              <Button color="inherit" component={Link} href="/projects">Projects</Button>
            </Stack>
          </Toolbar>
        </AppBar>
        <main>{children}</main>
      </body>
    </html>
  );
}
