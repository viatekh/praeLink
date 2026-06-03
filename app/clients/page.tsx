'use client';
import { useState, useEffect } from 'react';
import supabase from '../../lib/supabase';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
} from '@mui/material';

type Client = {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success'|'error' }>({ open: false, message: '', severity: 'success' });

  async function fetchClients() {
    setLoading(true);
    let { data, error } = await supabase.from('clients').select('*').order('id');
    if (!error && data) setClients(data);
    setLoading(false);
  }
  useEffect(() => { fetchClients(); }, []);

  async function addClient() {
    if (!newClient.name || !newClient.email) {
      setSnackbar({ open: true, message: 'Name and email are required', severity: 'error' });
      return;
    }
    const { error } = await supabase.from('clients').insert([newClient]);
    setShowForm(false); setNewClient({});
    if (error) setSnackbar({ open: true, message: 'Failed to save', severity: 'error' });
    else setSnackbar({ open: true, message: 'Saved', severity: 'success' });
    fetchClients();
  }
  async function deleteClient(id: number) {
    await supabase.from('clients').delete().eq('id', id);
    fetchClients();
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Clients</Typography>
      <Button variant="contained" sx={{mb:2}} onClick={()=>setShowForm(true)}>Add Client</Button>
      <Paper sx={{ p:2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell><TableCell>Email</TableCell>
              <TableCell>Phone</TableCell><TableCell>Company</TableCell>
              <TableCell>Address</TableCell><TableCell>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
              : clients.map(c=>(
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.company}</TableCell>
                  <TableCell>{c.address}</TableCell>
                  <TableCell><Button color="error" onClick={()=>deleteClient(c.id)}>Delete</Button></TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={showForm} onClose={()=>setShowForm(false)}>
        <DialogTitle>Add Client</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={newClient.name||''} onChange={e=>setNewClient({...newClient, name: e.target.value})} fullWidth sx={{mb:2}}/>
          <TextField label="Email" value={newClient.email||''} onChange={e=>setNewClient({...newClient, email: e.target.value})} fullWidth sx={{mb:2}}/>
          <TextField label="Phone" value={newClient.phone||''} onChange={e=>setNewClient({...newClient, phone: e.target.value})} fullWidth sx={{mb:2}}/>
          <TextField label="Company" value={newClient.company||''} onChange={e=>setNewClient({...newClient, company: e.target.value})} fullWidth sx={{mb:2}}/>
          <TextField label="Address" value={newClient.address||''} onChange={e=>setNewClient({...newClient, address: e.target.value})} fullWidth/>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setShowForm(false)}>Cancel</Button>
          <Button variant="contained" onClick={addClient}>Save</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={()=>setSnackbar({...snackbar, open:false})}
        message={snackbar.message}
      />
    </Box>
  );
}
