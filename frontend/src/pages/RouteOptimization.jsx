import React, { useState, useEffect } from 'react';
import { Plus, Search, Sparkles } from 'lucide-react';
import DetailModal from '../components/DetailModal';
import FormModal from '../components/FormModal';
import AIOutput from '../components/AIOutput';

const fields = [
  { key: 'name', label: 'Route Name' },
  { key: 'zone_id', label: 'Zone ID', type: 'number' },
  { key: 'distance_km', label: 'Distance (km)', type: 'number' },
  { key: 'estimated_time', label: 'Estimated Time (min)', type: 'number' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'completed'] },
  { key: 'stops', label: 'Stops', type: 'number' },
  { key: 'optimized', label: 'Optimized', type: 'select', options: ['true', 'false'] },
];

const detailFields = [
  { key: 'name', label: 'Route Name' },
  { key: 'zone_id', label: 'Zone ID' },
  { key: 'distance_km', label: 'Distance (km)' },
  { key: 'estimated_time', label: 'Estimated Time' },
  { key: 'status', label: 'Status' },
  { key: 'stops', label: 'Stops' },
  { key: 'optimized', label: 'Optimized' },
  { key: 'created_at', label: 'Created At' },
];

function RouteOptimization() {
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
      const res = await fetch('/api/routes', { headers });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await fetch('/api/routes', { method: 'POST', headers, body: JSON.stringify(data) });
      showToast('Route created');
      setShowForm(false);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleUpdate = async (data) => {
    try {
      const id = editItem.id || editItem._id;
      await fetch(`/api/routes/${id}`, { method: 'PUT', headers, body: JSON.stringify(data) });
      showToast('Route updated');
      setEditItem(null);
      setSelected(null);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (item) => {
    if (!confirm('Delete this route?')) return;
    try {
      const id = item.id || item._id;
      await fetch(`/api/routes/${id}`, { method: 'DELETE', headers });
      showToast('Route deleted');
      setSelected(null);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleAiOptimize = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch('/api/ai/optimize-route', { method: 'POST', headers, body: JSON.stringify({ zone_id: 1 }) });
      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      showToast('AI optimization failed', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const filtered = items.filter((r) =>
    (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.status || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1>Route Optimization</h1>
        <div className="page-header-actions">
          <div className="search-bar">
            <Search />
            <input placeholder="Search routes..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-ai" onClick={handleAiOptimize} disabled={aiLoading}>
            <Sparkles size={16} /> AI Optimize
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> New Route
          </button>
        </div>
      </div>

      {(aiResult || aiLoading) && (
        <AIOutput data={aiResult} loading={aiLoading} title="AI Route Optimization Results" />
      )}

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Zone ID</th>
              <th>Distance (km)</th>
              <th>Est. Time</th>
              <th>Stops</th>
              <th>Status</th>
              <th>Optimized</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>No routes found</td></tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id || item._id} onClick={() => setSelected(item)}>
                  <td style={{ fontWeight: 600 }}>{item.name || '-'}</td>
                  <td>{item.zone_id || '-'}</td>
                  <td>{item.distance_km ? `${item.distance_km} km` : '-'}</td>
                  <td>{item.estimated_time ? `${item.estimated_time} min` : '-'}</td>
                  <td>{item.stops || '-'}</td>
                  <td><span className={`status-badge ${(item.status || 'active').toLowerCase()}`}>{item.status || 'active'}</span></td>
                  <td>{item.optimized ? 'Yes' : 'No'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && !editItem && (
        <DetailModal
          item={selected}
          fields={detailFields}
          title="Route Details"
          onClose={() => setSelected(null)}
          onEdit={(item) => setEditItem(item)}
          onDelete={handleDelete}
        />
      )}

      {showForm && (
        <FormModal
          fields={fields}
          title="New Route"
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}

      {editItem && (
        <FormModal
          fields={fields}
          initialData={editItem}
          title="Edit Route"
          onSubmit={handleUpdate}
          onClose={() => setEditItem(null)}
        />
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default RouteOptimization;
