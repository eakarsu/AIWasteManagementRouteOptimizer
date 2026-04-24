import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import DetailModal from '../components/DetailModal';
import FormModal from '../components/FormModal';

const formFields = [
  { key: 'plate_number', label: 'Plate Number' },
  { key: 'type', label: 'Type', type: 'select', options: ['truck', 'van', 'compactor', 'recycling_truck'] },
  { key: 'capacity_tons', label: 'Capacity (tons)', type: 'number' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'maintenance'] },
  { key: 'driver_id', label: 'Driver ID', type: 'number' },
  { key: 'fuel_level', label: 'Fuel Level (%)', type: 'number' },
  { key: 'mileage', label: 'Mileage', type: 'number' },
];

const detailFields = [
  { key: 'plate_number', label: 'Plate Number' },
  { key: 'type', label: 'Type' },
  { key: 'capacity_tons', label: 'Capacity (tons)' },
  { key: 'status', label: 'Status' },
  { key: 'driver_id', label: 'Driver ID' },
  { key: 'fuel_level', label: 'Fuel Level (%)' },
  { key: 'mileage', label: 'Mileage' },
  { key: 'last_maintenance', label: 'Last Maintenance' },
];

function FleetManagement() {
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
      const res = await fetch('/api/vehicles', { headers });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (data) => {
    try {
      await fetch('/api/vehicles', { method: 'POST', headers, body: JSON.stringify(data) });
      showToast('Vehicle added');
      setShowForm(false);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleUpdate = async (data) => {
    try {
      const id = editItem.id || editItem._id;
      await fetch(`/api/vehicles/${id}`, { method: 'PUT', headers, body: JSON.stringify(data) });
      showToast('Vehicle updated');
      setEditItem(null);
      setSelected(null);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (item) => {
    if (!confirm('Delete this vehicle?')) return;
    try {
      const id = item.id || item._id;
      await fetch(`/api/vehicles/${id}`, { method: 'DELETE', headers });
      showToast('Vehicle deleted');
      setSelected(null);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const getFuelColor = (level) => {
    if (level < 20) return 'red';
    if (level < 50) return 'yellow';
    return 'green';
  };

  const filtered = items.filter((v) =>
    (v.plate_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1>Fleet Management</h1>
        <div className="page-header-actions">
          <div className="search-bar">
            <Search />
            <input placeholder="Search vehicles..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> New Vehicle
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Plate Number</th>
              <th>Type</th>
              <th>Fuel Level</th>
              <th>Capacity (tons)</th>
              <th>Mileage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>No vehicles found</td></tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id || item._id} onClick={() => setSelected(item)}>
                  <td style={{ fontWeight: 600 }}>{item.plate_number || '-'}</td>
                  <td>{item.type || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div className={`progress-fill ${getFuelColor(item.fuel_level || 0)}`} style={{ width: `${item.fuel_level || 0}%` }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, minWidth: 35 }}>{item.fuel_level || 0}%</span>
                    </div>
                  </td>
                  <td>{item.capacity_tons ? `${item.capacity_tons}t` : '-'}</td>
                  <td>{item.mileage || '-'}</td>
                  <td><span className={`status-badge ${(item.status || 'active').toLowerCase()}`}>{item.status || 'active'}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && !editItem && (
        <DetailModal item={selected} fields={detailFields} title="Vehicle Details" onClose={() => setSelected(null)} onEdit={(item) => setEditItem(item)} onDelete={handleDelete} />
      )}
      {showForm && <FormModal fields={formFields} title="New Vehicle" onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
      {editItem && <FormModal fields={formFields} initialData={editItem} title="Edit Vehicle" onSubmit={handleUpdate} onClose={() => setEditItem(null)} />}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default FleetManagement;
