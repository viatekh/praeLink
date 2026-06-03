'use client';
import { useState, useEffect } from 'react';
import supabase from '../../lib/supabase';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Snackbar,
  Chip,
  Stack,
  MenuItem,
} from '@mui/material';

type PackageItem = { name: string; qty: number };
type RentalPackage = {
  id: number;
  name: string;
  items: PackageItem[];
};

export default function PackagesPage() {
  const [packages, setPackages] = useState<RentalPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [pkgName, setPkgName] = useState('');
  const [pkgItems, setPkgItems] = useState<PackageItem[]>([{ name: '', qty: 1 }]);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});
  const [inventory, setInventory] = useState<{ name: string }[]>([]);

  async function fetchPackages() {
    setLoading(true);
    const { data, error } = await supabase.from('packages').select('id, name, package_items (item_name, quantity)').order('id');
    if (!error && data) {
      setPackages(data.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        items: pkg.package_items?.map((it:any) => ({
          name: it.item_name,
          qty: it.quantity
        })) || []
      })));
    }
    setLoading(false);
  }

  async function fetchInventory() {
    const { data } = await supabase.from('inventory').select('name');
    if (data) setInventory(data);
  }

  useEffect(()=>{ fetchPackages(); fetchInventory(); },[]);

  async function addPackage() {
    if (!pkgName || pkgItems.length === 0 || !pkgItems[0].name) {
      setSnackbar({open:true, message:'Enter package name & at least one item', severity:'error'});
      return;
    }
    const { data, error } = await supabase.from('packages').insert([{ name: pkgName }]).select();
    if (data && data.length) {
      const pkgid = data[0].id;
      for (const it of pkgItems) {
        if (!it.name) continue;
        await supabase.from('package_items').insert([{ package_id: pkgid, item_name: it.name, quantity: it.qty }]);
      }
    }
    setShowForm(false); setPkgItems([{ name: '', qty: 1}]); setPkgName('');
    setSnackbar({open:true, message:'Saved', severity: 'success'});
    fetchPackages();
  }
  async function deletePackage(id: number) {
    await supabase.from('packages').delete().eq('id', id); // package_items: FK ON DELETE CASCADE
    setSnackbar({open:true, message:'Deleted', severity: 'success'});
    fetchPackages();
  }

  function updatePkgItem(i: number, field: string, value: string|number) {
    setPkgItems(pkgItems.map((it,ix)=>ix===i?{...it,[field]:value}:it));
  }

  return (
    <Box sx={{maxWidth:1000, mx:'auto', mt:4}}>
      <Typography variant="h4" gutterBottom>Packages</Typography>
      <Button variant="contained" sx={{mb:2}} onClick={()=>setShowForm(true)}>Add Package</Button>
      <Paper sx={{ p:2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell><TableCell>Items</TableCell><TableCell>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
              : packages.map(pkg=>(
                <TableRow key={pkg.id}>
                  <TableCell>{pkg.name}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                      {pkg.items.map(it =>
                        <Chip key={it.name} label={`${it.name} x${it.qty}`} size="small"/>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell><Button color="error" onClick={()=>deletePackage(pkg.id)}>Delete</Button></TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={showForm} onClose={()=>setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Package</DialogTitle>
        <DialogContent sx={{mt:1}}>
          <TextField
            label="Package Name"
            value={pkgName}
            onChange={e=>setPkgName(e.target.value)}
            fullWidth
            sx={{mb:2}}
          />
          {pkgItems.map((it, i)=>(
            <Stack key={i} direction="row" spacing={1} sx={{mb:1, alignItems:'center'}}>
              <TextField
                label="Item"
                value={it.name}
                onChange={e=>updatePkgItem(i,'name',e.target.value)}
                select
                sx={{ minWidth: 160 }}
              >
                {inventory.map((inv,ix) =>
                  <MenuItem key={inv.name+ix} value={inv.name}>{inv.name}</MenuItem>
                )}
              </TextField>
              <TextField
                label="Qty"
                type="number"
                sx={{ width: 80 }}
                value={it.qty||1}
                onChange={e=>updatePkgItem(i,'qty',parseInt(e.target.value)||1)}
              />
              {pkgItems.length>1 && <Button onClick={()=>setPkgItems(pkgItems.filter((_,ix)=>ix!==i))}>-</Button>}
              {i===pkgItems.length-1 && <Button onClick={()=>setPkgItems([...pkgItems,{name:'',qty:1}])}>+</Button>}
            </Stack>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setShowForm(false)}>Cancel</Button>
          <Button variant="contained" onClick={addPackage}>Save</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={()=>setSnackbar({...snackbar, open:false})}
        message={snackbar.message}
      />
    </Box>
  );
}
