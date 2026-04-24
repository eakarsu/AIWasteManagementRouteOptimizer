import React, { useState, useEffect } from 'react';
import { Plus, Search, Star } from 'lucide-react';
import DetailModal from '../components/DetailModal';
import FormModal from '../components/FormModal';

const formFields = [
  { key: 'name', label: 'Driver Name' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Phone' },
  { key: 'license_number', label: 'License Number' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'on-leave'] },
  { key: 'experience_years', label: 'Experience (years)', type: 'number' },
  { key: 'rating', label: 'Rating (1-5)', type: 'number', step: 0.1 },
  { key: 'assigned_vehicle_id', label: 'Assigned Vehicle ID', type: 'number', required: false },
];

const detailFields = [
  { key: 'name', label: 'Driver Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'license_number', label: 'License Number' },
  { key: 'status', label: 'Status' },
  { key: 'experience_years', label: 'Experience (years)' },
  { key: 'rating', label: 'Rating' },
  { key: 'assigned_vehicle_id', label: 'Assigned Vehicle ID' },
];

function DriverManagement() {
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
      const res = await fetch('/api/drivers', { headers });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (data) => {
    try {
      await fetch('/api/drivers', { method: 'POST', headers, body: JSON.stringify(data) });
      showToast('Driver added');
      setShowForm(false);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleUpdate = async (data) => {
    try {
      const id = editItem.id || editItem._id;
      await fetch(`/api/drivers/${id}`, { method: 'PUT', headers, body: JSON.stringify(data) });
      showToast('Driver updated');
      setEditItem(null);
      setSelected(null);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (item) => {
    if (!confirm('Delete this driver?')) return;
    try {
      const id = item.id || item._id;
      await fetch(`/api/drivers/${id}`, { method: 'DELETE', headers });
      showToast('Driver deleted');
      setSelected(null);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const renderStars = (rating) => {
    const r = parseFloat(rating) || 0;
    const full = Math.floor(r);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          fill={i < full ? '#fbbc04' : 'none'}
          color={i < full ? '#fbbc04' : '#d1d5db'}
        />
      );
    }
    return <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>{stars} <span style={{ marginLeft: 4, fontSize: 13, fontWeight: 600 }}>{r.toFixed(1)}</span></span>;
  };

  const filtered = items.filter((d) =>
    (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1>Driver Management</h1>
        <div className="page-header-actions">
          <div className="search-bar">
            <Search />
            <input placeholder="Search drivers..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> New Driver
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>License</th>
              <th>Rating</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>No drivers found</td></tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id || item._id} onClick={() => setSelected(item)}>
                  <td style={{ fontWeight: 600 }}>{item.name || '-'}</td>
                  <td>{item.email || '-'}</td>
                  <td>{item.phone || '-'}</td>
                  <td>{item.license_number || '-'}</td>
                  <td>{renderStars(item.rating)}</td>
                  <td><span className={`status-badge ${(item.status || 'active').toLowerCase()}`}>{item.status || 'active'}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && !editItem && (
        <DetailModal item={selected} fields={detailFields} title="Driver Details" onClose={() => setSelected(null)} onEdit={(item) => setEditItem(item)} onDelete={handleDelete} />
      )}
      {showForm && <FormModal fields={formFields} title="New Driver" onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
      {editItem && <FormModal fields={formFields} initialData={editItem} title="Edit Driver" onSubmit={handleUpdate} onClose={() => setEditItem(null)} />}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default DriverManagement;
