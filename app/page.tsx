'use client';
import { Box, Typography, Paper, Stack } from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 5 }}>
      <Typography variant="h3" gutterBottom>praeLink Dashboard</Typography>
      <Stack spacing={2} sx={{ mt: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Get Started</Typography>
          <Typography>
            Use the navigation at the top to access each module:
          </Typography>
          <ul>
            <li><Link href="/inventory">Inventory</Link>: Manage and track units and components</li>
            <li><Link href="/packages">Packages</Link>: Bundle common kits for fast quoting</li>
            <li><Link href="/clients">Clients</Link>: Store company and contact details</li>
            <li><Link href="/projects">Projects</Link>: Make bookings, kits, assign clients and track status</li>
          </ul>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Quick Actions</Typography>
          <Stack direction="row" spacing={2}>
            <Link href="/inventory"><a>Add Inventory</a></Link>
            <Link href="/clients"><a>Add Client</a></Link>
            <Link href="/projects"><a>New Project</a></Link>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
