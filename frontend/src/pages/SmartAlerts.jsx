import React, { useState, useEffect } from 'react';
import { Search, Sparkles, CheckCircle } from 'lucide-react';
import DetailModal from '../components/DetailModal';
import FormModal from '../components/FormModal';
import AIOutput from '../components/AIOutput';

const detailFields = [
  { key: 'type', label: 'Type' },
  { key: 'message', label: 'Message' },
  { key: 'severity', label: 'Severity' },
  { key: 'zone_id', label: 'Zone ID' },
  { key: 'is_read', label: 'Read' },
  { key: 'created_at', label: 'Created At' },
];

function SmartAlerts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
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
      const res = await fetch('/api/alerts', { headers });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (data) => {
    try {
      const id = editItem.id || editItem._id;
      await fetch(`/api/alerts/${id}`, { method: 'PUT', headers, body: JSON.stringify(data) });
      showToast('Alert updated');
      setEditItem(null);
      setSelected(null);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (item) => {
    if (!confirm('Delete this alert?')) return;
    try {
      const id = item.id || item._id;
      await fetch(`/api/alerts/${id}`, { method: 'DELETE', headers });
      showToast('Alert deleted');
      setSelected(null);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleMarkRead = async (item) => {
    try {
      const id = item.id || item._id;
      await fetch(`/api/alerts/${id}`, { method: 'PUT', headers, body: JSON.stringify({ ...item, is_read: true }) });
      showToast('Marked as read');
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleGenerateAlert = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch('/api/ai/generate-alert', { method: 'POST', headers, body: JSON.stringify({}) });
      const data = await res.json();
      setAiResult(data);
      fetchData();
    } catch (err) { showToast('AI alert generation failed', 'error'); }
    finally { setAiLoading(false); }
  };

  const editFormFields = [
    { key: 'type', label: 'Type', type: 'select', options: ['bin_overflow', 'maintenance', 'route_delay', 'system', 'weather'] },
    { key: 'message', label: 'Message', type: 'textarea' },
    { key: 'severity', label: 'Severity', type: 'select', options: ['info', 'warning', 'critical'] },
    { key: 'zone_id', label: 'Zone ID', type: 'number', required: false },
    { key: 'is_read', label: 'Read', type: 'select', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }] },
  ];

  const filtered = items.filter((a) =>
    (a.type || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.message || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1>Smart Alerts</h1>
        <div className="page-header-actions">
          <div className="search-bar">
            <Search />
            <input placeholder="Search alerts..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-ai" onClick={handleGenerateAlert} disabled={aiLoading}>
            <Sparkles size={16} /> Generate AI Alert
          </button>
        </div>
      </div>

      {(aiResult || aiLoading) && (
        <AIOutput data={aiResult} loading={aiLoading} title="AI Generated Alert" />
      )}

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Message</th>
              <th>Severity</th>
              <th>Zone ID</th>
              <th>Read</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>No alerts found</td></tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id || item._id} onClick={() => setSelected(item)}>
                  <td style={{ fontWeight: 600 }}>{item.type || '-'}</td>
                  <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.message || '-'}</td>
                  <td><span className={`status-badge ${(item.severity || 'info').toLowerCase()}`}>{item.severity || 'info'}</span></td>
                  <td>{item.zone_id || '-'}</td>
                  <td>{item.is_read ? 'Yes' : 'No'}</td>
                  <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
                  <td>
                    {!item.is_read && (
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={(e) => { e.stopPropagation(); handleMarkRead(item); }}
                      >
                        <CheckCircle size={14} /> Read
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && !editItem && (
        <DetailModal item={selected} fields={detailFields} title="Alert Details" onClose={() => setSelected(null)} onEdit={(item) => setEditItem(item)} onDelete={handleDelete} />
      )}
      {editItem && <FormModal fields={editFormFields} initialData={editItem} title="Edit Alert" onSubmit={handleUpdate} onClose={() => setEditItem(null)} />}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default SmartAlerts;
