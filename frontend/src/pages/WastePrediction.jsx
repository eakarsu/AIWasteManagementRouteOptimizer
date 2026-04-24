import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import AIOutput from '../components/AIOutput';

function WastePrediction() {
  const [zones, setZones] = useState([]);
  const [zoneId, setZoneId] = useState('');
  const [period, setPeriod] = useState('weekly');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [bins, setBins] = useState([]);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetch('/api/zones', { headers }).then((r) => r.json()).then((d) => setZones(Array.isArray(d) ? d : [])).catch(() => {});
    fetch('/api/bins', { headers }).then((r) => r.json()).then((d) => setBins(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePredict = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch('/api/ai/predict-waste', {
        method: 'POST',
        headers,
        body: JSON.stringify({ zoneId: zoneId || undefined, period }),
      });
      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      showToast('Prediction failed', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Waste Prediction</h1>
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
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
            <label>Period</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
          <button className="btn btn-ai" onClick={handlePredict} disabled={aiLoading}>
            <Sparkles size={16} /> Generate Prediction
          </button>
        </div>
      </div>

      <AIOutput data={aiResult} loading={aiLoading} title="Waste Prediction Results" />

      {bins.length > 0 && (
        <div className="section" style={{ marginTop: 24 }}>
          <div className="section-title">Historical Bin Data</div>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Fill Level</th>
                  <th>Zone</th>
                  <th>Last Collected</th>
                </tr>
              </thead>
              <tbody>
                {bins.slice(0, 10).map((bin) => (
                  <tr key={bin.id || bin._id}>
                    <td>{bin.location || '-'}</td>
                    <td>{bin.binType || '-'}</td>
                    <td>{bin.fillLevel || 0}%</td>
                    <td>{bin.zone || '-'}</td>
                    <td>{bin.lastCollected ? new Date(bin.lastCollected).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default WastePrediction;
