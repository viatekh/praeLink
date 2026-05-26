'use client';
import { useState, useEffect } from 'react';
import supabase from '../../lib/supabase';

type Project = {
  id: number;
  name: string;
  client_id: number;
  quote_date: string;
  event_start: string;
  event_end: string;
  status: string;
  items: { name: string, qty: number }[];
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProjects() {
    setLoading(true);
    const { data, error } = await supabase.from('projects').select('*, project_items (name, quantity, is_package)');
    if (!error && data) {
      setProjects(data.map(proj=>({
        id: proj.id,
        name: proj.name,
        client_id: proj.client_id,
        quote_date: proj.quote_date,
        event_start: proj.event_start,
        event_end: proj.event_end,
        status: proj.status,
        items: proj.project_items?.map((it:any)=>({name:it.name, qty:it.quantity, is_package:it.is_package}))||[]
      })));
    }
    setLoading(false);
  }
  async function fetchClients() {
    const { data } = await supabase.from('clients').select('id, name');
    if (data) setClients(data);
  }
  useEffect(() => { fetchProjects(); fetchClients(); }, []);

  // Add project
  const [showForm, setShowForm] = useState(false);
  const [proj, setProj] = useState<Partial<Project>>({name:'',client_id:0,quote_date:'',event_start:'',event_end:'',status:'Enquiry',items:[]});
  function updateProjItem(i: number, field: string, value: string|number) {
    setProj({
      ...proj,
      items: (proj.items || []).map((it,ix)=>ix===i?{...it,[field]:value}:it)
    })
  }

  async function addProject() {
    // Insert project, then insert items as needed
    const { data, error } = await supabase.from('projects').insert([{
      name: proj.name,
      client_id: proj.client_id,
      quote_date: proj.quote_date,
      event_start: proj.event_start,
      event_end: proj.event_end,
      status: proj.status
    }]).select();
    if (data && data.length) {
      for (const it of (proj.items||[])) {
        if (!it.name) continue;
        await supabase.from('project_items').insert([{
          project_id: data[0].id, name: it.name, quantity: it.qty, is_package: false
        }]);
      }
    }
    setShowForm(false); setProj({ name:'',client_id:0,quote_date:'',event_start:'',event_end:'',status:'Enquiry',items:[]});
    fetchProjects();
  }

  async function deleteProject(id: number) {
    await supabase.from('projects').delete().eq('id', id);
    fetchProjects();
  }

  return (
    <div style={{padding:24}}>
      <h2>Projects</h2>
      <button onClick={()=>setShowForm(true)}>Add Project</button>
      {showForm && (
        <div style={{background:'#ffeff6',padding:12,margin:'10px 0'}}>
          <input placeholder="Name" value={proj.name||''} onChange={e=>setProj({...proj,name:e.target.value})} />
          <select value={proj.client_id||0} onChange={e=>setProj({...proj,client_id:parseInt(e.target.value)||0})}>
            <option value={0}>Select Client</option>
            {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input placeholder="Quote Date" type="date" value={proj.quote_date||''} onChange={e=>setProj({...proj,quote_date:e.target.value})}/>
          <input placeholder="Event Start" type="date" value={proj.event_start||''} onChange={e=>setProj({...proj,event_start:e.target.value})}/>
          <input placeholder="Event End" type="date" value={proj.event_end||''} onChange={e=>setProj({...proj,event_end:e.target.value})}/>
          <select value={proj.status||'Enquiry'} onChange={e=>setProj({...proj,status:e.target.value})}>
            <option>Enquiry</option>
            <option>Quoted</option>
            <option>Confirmed</option>
            <option>Invoiced</option>
            <option>Paid</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
          {(proj.items||[]).map((it,i)=>(
            <div key={i} style={{marginBottom:7}}>
              <input placeholder="Item/Package Name" value={it.name} onChange={e=>updateProjItem(i,'name',e.target.value)} />
              <input style={{width:60}} type="number" min={1} value={it.qty||1} onChange={e=>updateProjItem(i,'qty',parseInt(e.target.value)||1)} />
              {proj.items.length>1 && <button onClick={()=>setProj({...proj,items:(proj.items||[]).filter((_,ix)=>ix!==i)})}>-</button>}
              {i===proj.items.length-1 && <button onClick={()=>setProj({...proj,items:[...(proj.items||[]),{name:'',qty:1}]})}>+</button>}
            </div>
          ))}
          <button onClick={addProject}>Save</button>
          <button onClick={()=>setShowForm(false)}>Cancel</button>
        </div>
      )}
      {loading ? <p>Loading...</p> : <table>
        <thead>
          <tr>
            <th>Name</th><th>Client</th><th>Dates</th><th>Status</th><th>Kit List</th><th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(p=>(
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{clients.find(c=>c.id===p.client_id)?.name||'—'}</td>
              <td>{p.event_start} to {p.event_end}</td>
              <td>{p.status}</td>
              <td>{p.items.map(it=>(`${it.name} x${it.qty}`)).join(', ')}</td>
              <td><button onClick={()=>deleteProject(p.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>}
    </div>
  );
}
