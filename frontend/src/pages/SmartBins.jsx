import React, { useState, useEffect } from 'react';
import { Plus, Search, Sparkles } from 'lucide-react';
import DetailModal from '../components/DetailModal';
import FormModal from '../components/FormModal';
import AIOutput from '../components/AIOutput';

const formFields = [
  { key: 'bin_code', label: 'Bin Code' },
  { key: 'location', label: 'Location' },
  { key: 'zone_id', label: 'Zone ID', type: 'number' },
  { key: 'type', label: 'Bin Type', type: 'select', options: ['general', 'recycling', 'organic', 'hazardous'] },
  { key: 'capacity_liters', label: 'Capacity (L)', type: 'number' },
  { key: 'fill_level', label: 'Fill Level (%)', type: 'number', step: 1 },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'maintenance'] },
  { key: 'lat', label: 'Latitude', type: 'number', step: 0.000001, required: false },
  { key: 'lng', label: 'Longitude', type: 'number', step: 0.000001, required: false },
];

const detailFields = [
  { key: 'bin_code', label: 'Bin Code' },
  { key: 'location', label: 'Location' },
  { key: 'zone_id', label: 'Zone ID' },
  { key: 'type', label: 'Bin Type' },
  { key: 'capacity_liters', label: 'Capacity (L)' },
  { key: 'fill_level', label: 'Fill Level (%)' },
  { key: 'status', label: 'Status' },
  { key: 'last_collected', label: 'Last Collected' },
  { key: 'lat', label: 'Latitude' },
  { key: 'lng', label: 'Longitude' },
];

function SmartBins() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
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
      const res = await fetch('/api/bins', { headers });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (data) => {
    try {
      await fetch('/api/bins', { method: 'POST', headers, body: JSON.stringify(data) });
      showToast('Bin created');
      setShowForm(false);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleUpdate = async (data) => {
    try {
      const id = editItem.id || editItem._id;
      await fetch(`/api/bins/${id}`, { method: 'PUT', headers, body: JSON.stringify(data) });
      showToast('Bin updated');
      setEditItem(null);
      setSelected(null);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (item) => {
    if (!confirm('Delete this bin?')) return;
    try {
      const id = item.id || item._id;
      await fetch(`/api/bins/${id}`, { method: 'DELETE', headers });
      showToast('Bin deleted');
      setSelected(null);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleAiPredict = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch('/api/ai/predict-waste', { method: 'POST', headers, body: JSON.stringify({ zone_id: 'all' }) });
      const data = await res.json();
      setAiResult(data);
    } catch (err) { showToast('AI prediction failed', 'error'); }
    finally { setAiLoading(false); }
  };

  const getFillColor = (level) => {
    if (level >= 80) return 'red';
    if (level >= 50) return 'yellow';
    return 'green';
  };

  const filtered = items.filter((b) =>
    (b.location || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1>Smart Bins</h1>
        <div className="page-header-actions">
          <div className="search-bar">
            <Search />
            <input placeholder="Search bins..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-ai" onClick={handleAiPredict} disabled={aiLoading}>
            <Sparkles size={16} /> AI Predict Fill
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> New Bin
          </button>
        </div>
      </div>

      {(aiResult || aiLoading) && (
        <AIOutput data={aiResult} loading={aiLoading} title="AI Fill Level Prediction" />
      )}

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Bin Code</th>
              <th>Location</th>
              <th>Type</th>
              <th>Fill Level</th>
              <th>Capacity (L)</th>
              <th>Status</th>
              <th>Zone ID</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>No bins found</td></tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id || item._id} onClick={() => setSelected(item)}>
                  <td style={{ fontWeight: 600 }}>{item.bin_code || '-'}</td>
                  <td>{item.location || '-'}</td>
                  <td><span className="status-badge info">{item.type || '-'}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div className={`progress-fill ${getFillColor(item.fill_level || 0)}`} style={{ width: `${item.fill_level || 0}%` }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, minWidth: 35 }}>{item.fill_level || 0}%</span>
                    </div>
                  </td>
                  <td>{item.capacity_liters ? `${item.capacity_liters}L` : '-'}</td>
                  <td><span className={`status-badge ${(item.status || 'active').toLowerCase()}`}>{item.status || 'active'}</span></td>
                  <td>{item.zone_id || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && !editItem && (
        <DetailModal item={selected} fields={detailFields} title="Bin Details" onClose={() => setSelected(null)} onEdit={(item) => setEditItem(item)} onDelete={handleDelete} />
      )}
      {showForm && <FormModal fields={formFields} title="New Bin" onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
      {editItem && <FormModal fields={formFields} initialData={editItem} title="Edit Bin" onSubmit={handleUpdate} onClose={() => setEditItem(null)} />}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default SmartBins;
