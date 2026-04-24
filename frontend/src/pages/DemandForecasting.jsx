import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import AIOutput from '../components/AIOutput';

function DemandForecasting() {
  const [zones, setZones] = useState([]);
  const [zoneId, setZoneId] = useState('');
  const [period, setPeriod] = useState('monthly');
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

  const handleForecast = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch('/api/ai/forecast-demand', {
        method: 'POST',
        headers,
        body: JSON.stringify({ zoneId: zoneId || undefined, period }),
      });
      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      showToast('Forecasting failed', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Demand Forecasting</h1>
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
          <button className="btn btn-ai" onClick={handleForecast} disabled={aiLoading}>
            <Sparkles size={16} /> Generate Forecast
          </button>
        </div>
      </div>

      <AIOutput data={aiResult} loading={aiLoading} title="Demand Forecast Results" />

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default DemandForecasting;
