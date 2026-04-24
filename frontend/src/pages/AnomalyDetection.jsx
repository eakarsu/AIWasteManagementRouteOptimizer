import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import AIOutput from '../components/AIOutput';

function AnomalyDetection() {
  const [zones, setZones] = useState([]);
  const [zoneId, setZoneId] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetch('/api/zones', { headers }).then((r) => r.json()).then((d) => setZones(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDetect = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch('/api/ai/detect-anomaly', {
        method: 'POST',
        headers,
        body: JSON.stringify({ zoneId: zoneId || undefined }),
      });
      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      showToast('Detection failed', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Anomaly Detection</h1>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
            <label>Zone</label>
            <select value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
              <option value="">All Zones</option>
              {zones.map((z) => (
                <option key={z.id || z._id} value={z.id || z._id}>{z.name}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-ai" onClick={handleDetect} disabled={aiLoading}>
            <Sparkles size={16} /> Detect Anomalies
          </button>
        </div>
      </div>

      <AIOutput data={aiResult} loading={aiLoading} title="Anomaly Detection Results" />

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default AnomalyDetection;
