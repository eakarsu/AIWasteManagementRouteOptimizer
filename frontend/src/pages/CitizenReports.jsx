import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import DetailModal from '../components/DetailModal';
import FormModal from '../components/FormModal';

const formFields = [
  { key: 'citizen_name', label: 'Citizen Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'location', label: 'Location' },
  { key: 'type', label: 'Type', type: 'select', options: ['overflow', 'illegal_dumping', 'missed_collection', 'damaged_bin', 'other'] },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'urgent'] },
  { key: 'status', label: 'Status', type: 'select', options: ['pending', 'in-progress', 'resolved', 'cancelled'] },
];

const detailFields = [
  { key: 'citizen_name', label: 'Citizen Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'location', label: 'Location' },
  { key: 'type', label: 'Type' },
  { key: 'description', label: 'Description' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Created At' },
  { key: 'resolved_at', label: 'Resolved At' },
];

function CitizenReports() {
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
      const res = await fetch('/api/reports', { headers });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (data) => {
    try {
      await fetch('/api/reports', { method: 'POST', headers, body: JSON.stringify(data) });
      showToast('Report created');
      setShowForm(false);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleUpdate = async (data) => {
    try {
      const id = editItem.id || editItem._id;
      await fetch(`/api/reports/${id}`, { method: 'PUT', headers, body: JSON.stringify(data) });
      showToast('Report updated');
      setEditItem(null);
      setSelected(null);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (item) => {
    if (!confirm('Delete this report?')) return;
    try {
      const id = item.id || item._id;
      await fetch(`/api/reports/${id}`, { method: 'DELETE', headers });
      showToast('Report deleted');
      setSelected(null);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const filtered = items.filter((r) =>
    (r.citizen_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.location || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1>Citizen Reports</h1>
        <div className="page-header-actions">
          <div className="search-bar">
            <Search />
            <input placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> New Report
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Citizen Name</th>
              <th>Type</th>
              <th>Location</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>No reports found</td></tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id || item._id} onClick={() => setSelected(item)}>
                  <td style={{ fontWeight: 600 }}>{item.citizen_name || '-'}</td>
                  <td>{item.type || '-'}</td>
                  <td>{item.location || '-'}</td>
                  <td><span className={`status-badge ${(item.priority || 'medium').toLowerCase()}`}>{item.priority || 'medium'}</span></td>
                  <td><span className={`status-badge ${(item.status || 'pending').toLowerCase()}`}>{item.status || 'pending'}</span></td>
                  <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && !editItem && (
        <DetailModal item={selected} fields={detailFields} title="Report Details" onClose={() => setSelected(null)} onEdit={(item) => setEditItem(item)} onDelete={handleDelete} />
      )}
      {showForm && <FormModal fields={formFields} title="New Report" onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
      {editItem && <FormModal fields={formFields} initialData={editItem} title="Edit Report" onSubmit={handleUpdate} onClose={() => setEditItem(null)} />}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default CitizenReports;
