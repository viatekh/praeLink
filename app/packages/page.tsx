'use client';
import { useState, useEffect } from 'react';
import supabase from '../../lib/supabase';

// Packages are made up of a name, and multiple items (name/qty)
type PackageItem = { name: string; qty: number; }
type RentalPackage = {
  id: number;
  name: string;
  items: PackageItem[];
};

export default function PackagesPage() {
  const [packages, setPackages] = useState<RentalPackage[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchPackages() {
    setLoading(true);
    const { data, error } = await supabase.from('packages').select('id, name, package_items (item_name, quantity)');
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
  useEffect(()=>{ fetchPackages(); },[]);

  // Add package
  const [showForm, setShowForm] = useState(false);
  const [pkgName, setPkgName] = useState('');
  const [pkgItems, setPkgItems] = useState<PackageItem[]>([{ name: '', qty: 1 }]);

  async function addPackage() {
    // Insert the package (returns id), then insert items!
    const { data, error } = await supabase.from('packages').insert([{ name: pkgName }]).select();
    if (data && data.length) {
      const pkgid = data[0].id;
      for (const it of pkgItems) {
        if (!it.name) continue;
        await supabase.from('package_items').insert([{ package_id: pkgid, item_name: it.name, quantity: it.qty }]);
      }
    }
    setShowForm(false); setPkgItems([{ name: '', qty: 1}]); setPkgName('');
    fetchPackages();
  }
  async function deletePackage(id: number) {
    await supabase.from('packages').delete().eq('id', id); // package_items has FK with ON DELETE CASCADE
    fetchPackages();
  }

  function updatePkgItem(i: number, field: string, value: string|number) {
    setPkgItems(pkgItems.map((it,ix)=>ix===i?{...it,[field]:value}:it));
  }

  return (
    <div style={{padding:24}}>
      <h2>Packages</h2>
      <button onClick={()=>setShowForm(true)}>Add Package</button>
      {showForm && (
        <div style={{background:'#fff8e7',padding:12,margin:'10px 0'}}>
          <input placeholder="Package Name" value={pkgName} onChange={e=>setPkgName(e.target.value)} />
          {pkgItems.map((it,i)=>(
            <div key={i} style={{marginBottom:7}}>
              <input placeholder="Item Name" value={it.name} onChange={e=>updatePkgItem(i,'name',e.target.value)}/>
              <input style={{width:60}} type="number" min={1} value={it.qty} onChange={e=>updatePkgItem(i,'qty',parseInt(e.target.value)||1)} />
              {pkgItems.length>1 && <button onClick={()=>setPkgItems(pkgItems.filter((_,ix)=>ix!==i))}>-</button>}
              {i===pkgItems.length-1 && <button onClick={()=>setPkgItems([...pkgItems,{name:'',qty:1}])}>+</button>}
            </div>
          ))}
          <button onClick={addPackage}>Save</button>
          <button onClick={()=>setShowForm(false)}>Cancel</button>
        </div>
      )}
      {loading ? <p>Loading...</p> : <table>
        <thead>
          <tr>
            <th>Name</th><th>Items</th><th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {packages.map(pkg=>(
            <tr key={pkg.id}>
              <td>{pkg.name}</td>
              <td>{pkg.items.map(it=>(`${it.name} x${it.qty}`)).join(', ')}</td>
              <td><button onClick={()=>deletePackage(pkg.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>}
    </div>
  );
}
