import React, { useState } from 'react';
import { Sparkles, Trash2 } from 'lucide-react';
import AIOutput from '../components/AIOutput';

function WasteClassification() {
  const [description, setDescription] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleClassify = async () => {
    if (!description.trim()) {
      showToast('Please enter a waste description', 'error');
      return;
    }
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch('/api/ai/classify-waste', {
        method: 'POST',
        headers,
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      showToast('Classification failed', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const categories = [
    { name: 'Recyclable', color: '#1a73e8', desc: 'Paper, plastic, glass, metal' },
    { name: 'Organic', color: '#34a853', desc: 'Food waste, yard waste' },
    { name: 'Hazardous', color: '#ea4335', desc: 'Chemicals, batteries, paint' },
    { name: 'Electronic', color: '#7c3aed', desc: 'E-waste, appliances, cables' },
    { name: 'General', color: '#64748b', desc: 'Non-recyclable, mixed waste' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Waste Classification</h1>
      </div>

      <div className="cards-grid" style={{ marginBottom: 24 }}>
        {categories.map((cat) => (
          <div className="card" key={cat.name} style={{ borderLeft: `4px solid ${cat.color}` }}>
            <div style={{ fontWeight: 700, color: cat.color, marginBottom: 4 }}>{cat.name}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>{cat.desc}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label>Waste Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the waste item(s) you want to classify. Example: 'Used plastic bottles, aluminum cans, and cardboard boxes'"
            style={{ minHeight: 120 }}
          />
        </div>
        <button className="btn btn-ai" onClick={handleClassify} disabled={aiLoading || !description.trim()}>
          <Sparkles size={16} /> Classify Waste
        </button>
      </div>

      <AIOutput data={aiResult} loading={aiLoading} title="Classification Results" />

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default WasteClassification;
