import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import DetailModal from '../components/DetailModal';
import FormModal from '../components/FormModal';

const formFields = [
  { key: 'name', label: 'Zone Name' },
  { key: 'area_sqkm', label: 'Area (sq km)', type: 'number', step: 0.01 },
  { key: 'population', label: 'Population', type: 'number' },
  { key: 'households', label: 'Households', type: 'number' },
  { key: 'waste_type', label: 'Waste Type', type: 'select', options: ['general', 'recycling', 'organic', 'hazardous', 'mixed'] },
  { key: 'collection_frequency', label: 'Collection Frequency', type: 'select', options: ['daily', 'weekly', 'biweekly', 'monthly'] },
  { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
];

const detailFields = [
  { key: 'name', label: 'Zone Name' },
  { key: 'area_sqkm', label: 'Area (sq km)' },
  { key: 'population', label: 'Population' },
  { key: 'households', label: 'Households' },
  { key: 'waste_type', label: 'Waste Type' },
  { key: 'collection_frequency', label: 'Collection Frequency' },
  { key: 'priority', label: 'Priority' },
];

function ZoneManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetchData(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      const res = await fetch('/api/zones', { headers });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (data) => {
    try {
      await fetch('/api/zones', { method: 'POST', headers, body: JSON.stringify(data) });
      showToast('Zone created');
      setShowForm(false);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleUpdate = async (data) => {
    try {
      const id = editItem.id || editItem._id;
      await fetch(`/api/zones/${id}`, { method: 'PUT', headers, body: JSON.stringify(data) });
      showToast('Zone updated');
      setEditItem(null);
      setSelected(null);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (item) => {
    if (!confirm('Delete this zone?')) return;
    try {
      const id = item.id || item._id;
      await fetch(`/api/zones/${id}`, { method: 'DELETE', headers });
      showToast('Zone deleted');
      setSelected(null);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const filtered = items.filter((z) =>
    (z.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (z.waste_type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1>Zone Management</h1>
        <div className="page-header-actions">
          <div className="search-bar">
            <Search />
            <input placeholder="Search zones..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> New Zone
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Area (sq km)</th>
              <th>Population</th>
              <th>Households</th>
              <th>Waste Type</th>
              <th>Collection Frequency</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>No zones found</td></tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id || item._id} onClick={() => setSelected(item)}>
                  <td style={{ fontWeight: 600 }}>{item.name || '-'}</td>
                  <td>{item.area_sqkm || '-'}</td>
                  <td>{item.population ? item.population.toLocaleString() : '-'}</td>
                  <td>{item.households ? item.households.toLocaleString() : '-'}</td>
                  <td>{item.waste_type || '-'}</td>
                  <td>{item.collection_frequency || '-'}</td>
                  <td><span className={`status-badge ${(item.priority || 'medium').toLowerCase()}`}>{item.priority || 'medium'}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && !editItem && (
        <DetailModal item={selected} fields={detailFields} title="Zone Details" onClose={() => setSelected(null)} onEdit={(item) => setEditItem(item)} onDelete={handleDelete} />
      )}
      {showForm && <FormModal fields={formFields} title="New Zone" onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
      {editItem && <FormModal fields={formFields} initialData={editItem} title="Edit Zone" onSubmit={handleUpdate} onClose={() => setEditItem(null)} />}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default ZoneManagement;
