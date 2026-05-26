'use client';
import { useState, useEffect } from 'react';
import supabase from '../../lib/supabase';

type InventoryItem = {
  id: number;
  code: string;
  name: string;
  category: string;
  status: string;
  price_day: number | null;
  components: string[] | null;
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchItems() {
    setLoading(true);
    let { data, error } = await supabase.from('inventory').select('*').order('id');
    if (!error && data) setItems(data);
    setLoading(false);
  }
  useEffect(() => { fetchItems(); }, []);

  // Add item form state
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({});

  async function addItem() {
    await supabase.from('inventory').insert([newItem]);
    setShowForm(false); setNewItem({});
    fetchItems();
  }
  async function deleteItem(id: number) {
    await supabase.from('inventory').delete().eq('id', id);
    fetchItems();
  }

  return (
    <div style={{padding:24}}>
      <h2>Inventory</h2>
      <button onClick={() => setShowForm(true)}>Add Item</button>
      {showForm && (
        <div style={{background:'#f6f6ff',padding:12,margin:'10px 0'}}>
          <input placeholder="Code" value={newItem.code||''} onChange={e=>setNewItem({...newItem,code:e.target.value})} />
          <input placeholder="Name" value={newItem.name||''} onChange={e=>setNewItem({...newItem,name:e.target.value})} />
          <input placeholder="Category" value={newItem.category||''} onChange={e=>setNewItem({...newItem,category:e.target.value})} />
          <input placeholder="Status" value={newItem.status||''} onChange={e=>setNewItem({...newItem,status:e.target.value})} />
          <input placeholder="Price/Day" type="number" value={newItem.price_day||''} onChange={e=>setNewItem({...newItem,price_day:e.target.valueAsNumber})} />
          <input placeholder="Components (comma separated)" value={newItem.components?.join(',')||''} onChange={e=>setNewItem({...newItem,components:e.target.value.split(',')})}/>
          <button onClick={addItem}>Save</button>
          <button onClick={()=>setShowForm(false)}>Cancel</button>
        </div>
      )}
      {loading ? <p>Loading...</p> : <table>
        <thead>
          <tr>
            <th>Code</th><th>Name</th><th>Category</th><th>Status</th><th>Price/Day</th><th>Components</th><th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {items.map(i=>(
            <tr key={i.id}>
              <td>{i.code}</td>
              <td>{i.name}</td>
              <td>{i.category}</td>
              <td>{i.status}</td>
              <td>{i.price_day}</td>
              <td>{i.components?.join(', ')}</td>
              <td><button onClick={()=>deleteItem(i.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>}
    </div>
  );
}
