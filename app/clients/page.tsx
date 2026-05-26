'use client';
import { useState, useEffect } from 'react';
import supabase from '../../lib/supabase';

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

  async function fetchClients() {
    setLoading(true);
    let { data, error } = await supabase.from('clients').select('*').order('id');
    if (!error && data) setClients(data);
    setLoading(false);
  }
  useEffect(() => { fetchClients(); }, []);

  async function addClient() {
    await supabase.from('clients').insert([newClient]);
    setShowForm(false); setNewClient({});
    fetchClients();
  }
  async function deleteClient(id: number) {
    await supabase.from('clients').delete().eq('id', id);
    fetchClients();
  }

  return (
    <div style={{padding:24}}>
      <h2>Clients</h2>
      <button onClick={()=>setShowForm(true)}>Add Client</button>
      {showForm && (
        <div style={{background:'#e1fdff',padding:12,margin:'10px 0'}}>
          <input placeholder="Name" value={newClient.name||''} onChange={e=>setNewClient({...newClient,name:e.target.value})}/>
          <input placeholder="Email" value={newClient.email||''} onChange={e=>setNewClient({...newClient,email:e.target.value})}/>
          <input placeholder="Phone" value={newClient.phone||''} onChange={e=>setNewClient({...newClient,phone:e.target.value})}/>
          <input placeholder="Company" value={newClient.company||''} onChange={e=>setNewClient({...newClient,company:e.target.value})}/>
          <input placeholder="Address" value={newClient.address||''} onChange={e=>setNewClient({...newClient,address:e.target.value})}/>
          <button onClick={addClient}>Save</button>
          <button onClick={()=>setShowForm(false)}>Cancel</button>
        </div>
      )}
      {loading ? <p>Loading...</p> : <table>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Phone</th><th>Company</th><th>Address</th><th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(c=>(
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
              <td>{c.company}</td>
              <td>{c.address}</td>
              <td><button onClick={()=>deleteClient(c.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>}
    </div>
  );
}
