import React, { useEffect, useState } from 'react';

const blank = {
  name: '',
  area: '',
  frequency: 'weekly',
  start_time: '08:00',
  hauler: 'Hauler-A',
  waste_type: 'general',
  active: true,
};

export default function CollectionRulesEditor() {
  const [rules, setRules] = useState([]);
  const [draft, setDraft] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [err, setErr] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const load = async () => {
    try {
      const r = await fetch('/api/custom-views/collection-rules', { headers });
      const d = await r.json();
      setRules(d.rules || []);
    } catch (e) { setErr(String(e)); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (editingId) {
        await fetch(`/api/custom-views/collection-rules/${editingId}`, {
          method: 'PUT', headers, body: JSON.stringify(draft),
        });
      } else {
        await fetch('/api/custom-views/collection-rules', {
          method: 'POST', headers, body: JSON.stringify(draft),
        });
      }
      setDraft(blank); setEditingId(null);
      load();
    } catch (e) { setErr(String(e)); }
  };

  const startEdit = (r) => { setDraft(r); setEditingId(r.id); };

  const remove = async (id) => {
    try {
      await fetch(`/api/custom-views/collection-rules/${id}`, { method: 'DELETE', headers });
      load();
    } catch (e) { setErr(String(e)); }
  };

  const setField = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  return (
    <div style={{ padding: 16, border: '1px solid #ddd', borderRadius: 8, background: '#fff' }}>
      <h3 style={{ margin: '0 0 8px 0' }}>Collection Rules Editor</h3>
      {err && <div style={{ color: '#c33' }}>Error: {err}</div>}

      <div data-testid="rules-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
        <input placeholder="Name" value={draft.name} onChange={e => setField('name', e.target.value)} />
        <input placeholder="Area" value={draft.area} onChange={e => setField('area', e.target.value)} />
        <select value={draft.frequency} onChange={e => setField('frequency', e.target.value)}>
          <option value="daily">daily</option>
          <option value="weekly">weekly</option>
          <option value="biweekly">biweekly</option>
          <option value="monthly">monthly</option>
        </select>
        <input placeholder="Start (HH:MM)" value={draft.start_time} onChange={e => setField('start_time', e.target.value)} />
        <input placeholder="Hauler" value={draft.hauler} onChange={e => setField('hauler', e.target.value)} />
        <select value={draft.waste_type} onChange={e => setField('waste_type', e.target.value)}>
          <option value="general">general</option>
          <option value="recycling">recycling</option>
          <option value="organic">organic</option>
          <option value="hazardous">hazardous</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={!!draft.active} onChange={e => setField('active', e.target.checked)} />
          Active
        </label>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={save} style={{ padding: '6px 12px' }}>{editingId ? 'Update' : 'Add'}</button>
          {editingId && <button onClick={() => { setDraft(blank); setEditingId(null); }}>Cancel</button>}
        </div>
      </div>

      <table data-testid="rules-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ textAlign: 'left', padding: 6 }}>Name</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Area</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Freq</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Start</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Hauler</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Type</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Active</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 6 }}>{r.name}</td>
              <td style={{ padding: 6 }}>{r.area}</td>
              <td style={{ padding: 6 }}>{r.frequency}</td>
              <td style={{ padding: 6 }}>{r.start_time}</td>
              <td style={{ padding: 6 }}>{r.hauler}</td>
              <td style={{ padding: 6 }}>{r.waste_type}</td>
              <td style={{ padding: 6 }}>{r.active ? 'yes' : 'no'}</td>
              <td style={{ padding: 6 }}>
                <button onClick={() => startEdit(r)} style={{ marginRight: 4 }}>Edit</button>
                <button onClick={() => remove(r.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
