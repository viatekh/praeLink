'use client';
import { useState, useEffect, ChangeEvent } from 'react';
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
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Snackbar,
  Autocomplete,
  Stack,
  Chip,
} from '@mui/material';
import supabase from '../../lib/supabase';

type ProjectItem = { name: string; qty: number };
type Project = {
  id: number;
  name: string;
  client_id: number;
  quote_date: string;
  event_start: string;
  event_end: string;
  status: string;
  items: ProjectItem[];
};

const STATUS_OPTIONS = [
  'Enquiry', 'Quoted', 'Confirmed', 'Invoiced', 'Paid', 'Completed', 'Cancelled',
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success'|'error' }>({ open: false, message: '', severity: 'success' });

  // For kit list
  const [inventoryItems, setInventoryItems] = useState<{name: string}[]>([]);

  const [proj, setProj] = useState<Partial<Project>>({
    name: '', client_id: 0, quote_date: '', event_start: '', event_end: '', status: 'Enquiry', items: [ { name: '', qty: 1 } ]
  });

  async function fetchProjects() {
    setLoading(true);
    const { data, error } = await supabase.from('projects').select('*, project_items (name, quantity)').order('id', {ascending: false});
    if (!error && data) {
      setProjects(data.map(proj=>({
        id: proj.id,
        name: proj.name,
        client_id: proj.client_id,
        quote_date: proj.quote_date,
        event_start: proj.event_start,
        event_end: proj.event_end,
        status: proj.status,
        items: proj.project_items?.map((it:any)=>({name:it.name, qty:it.quantity}))||[]
      })));
    }
    setLoading(false);
  }

  async function fetchClients() {
    const { data } = await supabase.from('clients').select('id, name').order('name');
    if (data) setClients(data);
  }

  async function fetchInventory() {
    const { data } = await supabase.from('inventory').select('name');
    if (data) setInventoryItems(data);
  }

  useEffect(() => {
    fetchProjects();
    fetchClients();
    fetchInventory();
  }, []);

  function updateProjItem(i: number, field: string, value: string|number) {
    setProj({
      ...proj,
      items: (proj.items || []).map((it,ix)=>ix===i?{...it,[field]:value}:it)
    })
  }
  function addKitLine() {
    setProj({ ...proj, items: [ ...(proj.items||[]), { name: '', qty: 1 }] });
  }
  function removeKitLine(i: number) {
    setProj({ ...proj, items: (proj.items || []).filter((_, ix) => ix !== i) });
  }

  async function addProject() {
    if (!proj.name || !proj.client_id || (proj.items||[]).length === 0) {
      setSnackbar({ open: true, message: 'Name, client, and kit required', severity: 'error' });
      return;
    }
    // Insert project, then items
    const { data, error } = await supabase.from('projects').insert([{
      name: proj.name,
      client_id: proj.client_id,
      quote_date: proj.quote_date,
      event_start: proj.event_start,
      event_end: proj.event_end,
      status: proj.status
    }]).select();
    if (error) {
      setSnackbar({ open: true, message: 'Error adding project', severity: 'error' });
      return;
    }
    if (data && data.length) {
      for (const it of proj.items || []) {
        if (!it.name) continue;
        await supabase.from('project_items').insert([{
          project_id: data[0].id, name: it.name, quantity: it.qty, is_package: false
        }]);
      }
    }
    setShowForm(false);
    setProj({ name:'',client_id:0,quote_date:'',event_start:'',event_end:'',status:'Enquiry',items: [ { name: '', qty: 1 } ]});
    setSnackbar({ open: true, message: 'Project added', severity: 'success' });
    fetchProjects();
  }

  async function deleteProject(id: number) {
    await supabase.from('projects').delete().eq('id', id);
    setSnackbar({ open: true, message: 'Project deleted', severity: 'success' });
    fetchProjects();
  }

  return (
    <Box sx={{ maxWidth: 1000, margin: '0 auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Projects</Typography>
      <Button variant="contained" onClick={()=>setShowForm(true)}>Add Project</Button>
      <Paper sx={{ mt: 3, p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Dates</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Kit List</TableCell>
              <TableCell>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
              : projects.map(proj => (
                <TableRow key={proj.id}>
                  <TableCell>{proj.name}</TableCell>
                  <TableCell>{clients.find(c=>c.id===proj.client_id)?.name||'—'}</TableCell>
                  <TableCell>
                    {proj.event_start?.slice(0,10)} to {proj.event_end?.slice(0,10)}
                  </TableCell>
                  <TableCell>
                    <Chip label={proj.status} color={
                        proj.status === 'Enquiry' ? 'info' :
                        proj.status === 'Confirmed' ? 'success' :
                        proj.status === 'Cancelled' ? 'error' :
                        'default'
                    }/>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                      {proj.items.map((it, i) =>
                        <Chip size="small" key={i} label={`${it.name} x${it.qty}`} />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Button variant="outlined" color="error" onClick={()=>deleteProject(proj.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={showForm} onClose={()=>setShowForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Project</DialogTitle>
        <DialogContent>
          <Box sx={{display:'flex',flexDirection:'column',gap:2}}>
            <TextField
              label="Project Name"
              value={proj.name||''}
              onChange={e=>setProj({...proj, name: e.target.value})}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Client</InputLabel>
              <Select
                label="Client"
                value={proj.client_id||0}
                onChange={e=>setProj({...proj, client_id: Number(e.target.value) })}
                required
              >
                <MenuItem value={0}>Select Client</MenuItem>
                {clients.map(c=><MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Quote Date"
                type="date"
                value={proj.quote_date||''}
                onChange={e=>setProj({...proj, quote_date: e.target.value})}
              />
              <TextField
                label="Event Start"
                type="date"
                value={proj.event_start||''}
                onChange={e=>setProj({...proj, event_start: e.target.value})}
              />
              <TextField
                label="Event End"
                type="date"
                value={proj.event_end||''}
                onChange={e=>setProj({...proj, event_end: e.target.value})}
              />
            </Stack>
            <FormControl>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={proj.status||'Enquiry'}
                onChange={e=>setProj({...proj,status:e.target.value as string})}
              >
                {STATUS_OPTIONS.map(s=><MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <Box>
              <Typography variant="subtitle1">Kit List</Typography>
              {(proj.items||[]).map((it,i)=>(
                <Stack key={i} direction="row" spacing={1} alignItems="center" sx={{my:0.5}}>
                  <Autocomplete
                    freeSolo
                    options={inventoryItems.map(inv=>inv.name)}
                    value={it.name}
                    onInputChange={(_, val)=>updateProjItem(i, 'name', val)}
                    sx={{ width:220 }}
                    renderInput={params => <TextField {...params} label="Item/Package Name" />}
                  />
                  <TextField
                    label="Qty"
                    type="number"
                    InputProps={{ inputProps: {min:1} }}
                    sx={{ width: 80 }}
                    value={it.qty||1}
                    onChange={e=>updateProjItem(i, 'qty', parseInt(e.target.value)||1)}
                  />
                  {(proj.items||[]).length > 1 && (
                    <Button onClick={()=>removeKitLine(i)}>-</Button>
                  )}
                  {i === (proj.items||[]).length-1 && (
                    <Button onClick={addKitLine}>+</Button>
                  )}
                </Stack>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setShowForm(false)}>Cancel</Button>
          <Button variant="contained" onClick={addProject}>Save</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={()=>setSnackbar({...snackbar, open:false})}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
