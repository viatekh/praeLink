'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  Snackbar,
  Autocomplete,
  Stack,
} from '@mui/material';
import supabase from '../../lib/supabase';

const CATEGORY_OPTIONS = ['DJ', 'SPEAKER', 'LIGHT'];
const TYPE_OPTIONS = ['UNIT', 'COMPONENT'];
const STATUS_OPTIONS = ['OK', 'OUT OF SERVICE'];

type InventoryItem = {
  id: number;
  code: string;
  name: string;
  category: string;
  type: string;
  status: string;
  price_day: number | null;
  components: number[]; // store as array of IDs
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // For components picker
  const componentItems = items.filter((i) => i.type === 'COMPONENT');
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success'|'error' }>({ open: false, message: '', severity: 'success' });

  // Add Item Dialog Form State
  const [showForm, setShowForm] = useState(false);
  const [formItem, setFormItem] = useState<Partial<InventoryItem>>({ type: 'UNIT', status: 'OK', category: CATEGORY_OPTIONS[0], components: [] });

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase.from('inventory').select('*').order('id');
    if (error) {
      setSnackbar({ open: true, message: 'Failed to load inventory', severity: 'error' });
      setLoading(false);
      return;
    }
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchItems(); }, []);

  async function handleAdd() {
    if (!formItem.name) {
      setSnackbar({ open: true, message: 'Item Name required', severity: 'error' });
      return;
    }
    // Autogenerate code: <truncated NAME no spaces/titlecase>-<nextNumber>
    const base = formItem.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase();
    const countSame = items.filter(i => i.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase() === base).length + 1;
    const code = `${base}-${String(countSame).padStart(3, '0')}`;

    // Prepare DB insert (components as array of id numbers, supabase will map to correct array field)
    const toInsert = {
      ...formItem,
      code,
      components: formItem.components || [],
    };
    const { error } = await supabase.from('inventory').insert([toInsert]);
    if (error) {
      setSnackbar({ open: true, message: error.message || 'Error saving item', severity: 'error' });
    } else {
      setSnackbar({ open: true, message: 'Item added!', severity: 'success' });
      setShowForm(false);
      setFormItem({ type: 'UNIT', status: 'OK', category: CATEGORY_OPTIONS[0], components: [] });
      fetchItems();
    }
  }

  async function handleDelete(id: number) {
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (error) {
      setSnackbar({ open: true, message: 'Error deleting item', severity: 'error' });
    } else {
      setSnackbar({ open: true, message: 'Item deleted', severity: 'success' });
      fetchItems();
    }
  }

  return (
    <Box sx={{ maxWidth: 900, margin: '0 auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Inventory</Typography>
      <Button variant="contained" onClick={() => setShowForm(true)}>Add Item</Button>
      <Paper sx={{ mt: 3, p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell><TableCell>Name</TableCell>
              <TableCell>Category</TableCell><TableCell>Type</TableCell>
              <TableCell>Status</TableCell><TableCell>Price/Day</TableCell>
              <TableCell>Components</TableCell><TableCell>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? <TableRow><TableCell colSpan={8}><Typography>Loading...</Typography></TableCell></TableRow>
              : items.map(i => (
                <TableRow key={i.id}>
                  <TableCell>{i.code}</TableCell>
                  <TableCell>{i.name}</TableCell>
                  <TableCell>{i.category}</TableCell>
                  <TableCell>{i.type}</TableCell>
                  <TableCell>{i.status}</TableCell>
                  <TableCell>{i.price_day}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                      {(i.components || []).map(cid =>
                        <Chip size="small" key={cid} label={items.find(ci => ci.id === cid)?.name || cid} />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Button variant="outlined" color="error" onClick={() => handleDelete(i.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </Paper>
      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Inventory Item</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={formItem.name || ''}
              onChange={e => setFormItem({ ...formItem, name: e.target.value })}
              required
            />
            <FormControl>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={formItem.category || CATEGORY_OPTIONS[0]}
                onChange={e => setFormItem({ ...formItem, category: e.target.value })}
              >
                {CATEGORY_OPTIONS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>Type</InputLabel>
              <Select
                label="Type"
                value={formItem.type || TYPE_OPTIONS[0]}
                onChange={e => setFormItem({ ...formItem, type: e.target.value })}
              >
                {TYPE_OPTIONS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={formItem.status || STATUS_OPTIONS[0]}
                onChange={e => setFormItem({ ...formItem, status: e.target.value })}
              >
                {STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              label="Price/Day"
              type="number"
              value={formItem.price_day ?? ''}
              onChange={e => setFormItem({ ...formItem, price_day: Number(e.target.value) })}
            />
            {/* Only show 'Components' if UNIT */}
            {formItem.type === 'UNIT' && (
              <Autocomplete
                multiple
                options={componentItems}
                getOptionLabel={opt => opt.name}
                value={componentItems.filter(ci => (formItem.components || []).includes(ci.id))}
                onChange={(_, val) => setFormItem({ ...formItem, components: val.map(ci => ci.id) })}
                renderInput={(params) => (
                  <TextField {...params} label="Components (Select 0 or more)" />
                )}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowForm(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Save</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
