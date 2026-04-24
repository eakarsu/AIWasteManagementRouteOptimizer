import React, { useState, useEffect } from 'react';
import { Plus, Search, Sparkles } from 'lucide-react';
import DetailModal from '../components/DetailModal';
import FormModal from '../components/FormModal';
import AIOutput from '../components/AIOutput';

const formFields = [
  { key: 'route_id', label: 'Route ID', type: 'number' },
  { key: 'vehicle_id', label: 'Vehicle ID', type: 'number' },
  { key: 'driver_id', label: 'Driver ID', type: 'number' },
  { key: 'day_of_week', label: 'Day of Week', type: 'select', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  { key: 'start_time', label: 'Start Time' },
  { key: 'end_time', label: 'End Time' },
  { key: 'frequency', label: 'Frequency', type: 'select', options: ['daily', 'weekly', 'biweekly', 'monthly'] },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'completed'] },
];

const detailFields = [
  { key: 'route_id', label: 'Route ID' },
  { key: 'vehicle_id', label: 'Vehicle ID' },
  { key: 'driver_id', label: 'Driver ID' },
  { key: 'day_of_week', label: 'Day of Week' },
  { key: 'start_time', label: 'Start Time' },
  { key: 'end_time', label: 'End Time' },
  { key: 'frequency', label: 'Frequency' },
  { key: 'status', label: 'Status' },
];

function CollectionSchedules() {
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
      const res = await fetch('/api/schedules', { headers });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (data) => {
    try {
      await fetch('/api/schedules', { method: 'POST', headers, body: JSON.stringify(data) });
      showToast('Schedule created');
      setShowForm(false);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleUpdate = async (data) => {
    try {
      const id = editItem.id || editItem._id;
      await fetch(`/api/schedules/${id}`, { method: 'PUT', headers, body: JSON.stringify(data) });
      showToast('Schedule updated');
      setEditItem(null);
      setSelected(null);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (item) => {
    if (!confirm('Delete this schedule?')) return;
    try {
      const id = item.id || item._id;
      await fetch(`/api/schedules/${id}`, { method: 'DELETE', headers });
      showToast('Schedule deleted');
      setSelected(null);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleAiOptimize = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch('/api/ai/schedule-optimizer', { method: 'POST', headers, body: JSON.stringify({}) });
      const data = await res.json();
      setAiResult(data);
    } catch (err) { showToast('AI optimization failed', 'error'); }
    finally { setAiLoading(false); }
  };

  const filtered = items.filter((s) =>
    (s.day_of_week || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.frequency || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1>Collection Schedules</h1>
        <div className="page-header-actions">
          <div className="search-bar">
            <Search />
            <input placeholder="Search schedules..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-ai" onClick={handleAiOptimize} disabled={aiLoading}>
            <Sparkles size={16} /> AI Optimize
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> New Schedule
          </button>
        </div>
      </div>

      {(aiResult || aiLoading) && (
        <AIOutput data={aiResult} loading={aiLoading} title="AI Schedule Optimization" />
      )}

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Route ID</th>
              <th>Vehicle ID</th>
              <th>Driver ID</th>
              <th>Day</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Frequency</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40 }}>No schedules found</td></tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id || item._id} onClick={() => setSelected(item)}>
                  <td style={{ fontWeight: 600 }}>{item.route_id || '-'}</td>
                  <td>{item.vehicle_id || '-'}</td>
                  <td>{item.driver_id || '-'}</td>
                  <td>{item.day_of_week || '-'}</td>
                  <td>{item.start_time || '-'}</td>
                  <td>{item.end_time || '-'}</td>
                  <td>{item.frequency || '-'}</td>
                  <td><span className={`status-badge ${(item.status || 'active').toLowerCase()}`}>{item.status || 'active'}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && !editItem && (
        <DetailModal item={selected} fields={detailFields} title="Schedule Details" onClose={() => setSelected(null)} onEdit={(item) => setEditItem(item)} onDelete={handleDelete} />
      )}
      {showForm && <FormModal fields={formFields} title="New Schedule" onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
      {editItem && <FormModal fields={formFields} initialData={editItem} title="Edit Schedule" onSubmit={handleUpdate} onClose={() => setEditItem(null)} />}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default CollectionSchedules;
