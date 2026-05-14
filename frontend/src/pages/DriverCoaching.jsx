import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import AIOutput from '../components/AIOutput';

function DriverCoaching() {
  const [drivers, setDrivers] = useState([]);
  const [driverId, setDriverId] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetch('/api/drivers', { headers })
      .then((r) => r.json())
      .then((d) => setDrivers(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const handleRun = async () => {
    if (!driverId) return;
    setAiLoading(true);
    setAiResult(null);
    setError(null);
    try {
      const res = await fetch('/api/ai/driver-coaching', {
        method: 'POST',
        headers,
        body: JSON.stringify({ driver_id: parseInt(driverId, 10) }),
      });
      if (res.status === 503) {
        setError('AI service unavailable. The OPENROUTER_API_KEY is not configured on the server.');
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Coaching analysis failed.');
        return;
      }
      setAiResult(data);
    } catch (err) {
      setError('Coaching analysis failed. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Driver Route Coaching</h1>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 240 }}>
            <label>Driver</label>
            <select value={driverId} onChange={(e) => setDriverId(e.target.value)}>
              <option value="">-- Select Driver --</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name || `Driver ${d.id}`}
                  {d.experience_years ? ` (${d.experience_years}y)` : ''}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-ai"
            onClick={handleRun}
            disabled={!driverId || aiLoading}
          >
            <Sparkles size={16} /> Generate Coaching
          </button>
        </div>
      </div>

      {error && (
        <div className="toast error" style={{ position: 'static', marginBottom: 16 }}>
          {error}
        </div>
      )}

      <AIOutput data={aiResult} loading={aiLoading} title="Driver Coaching Report" />
    </div>
  );
}

export default DriverCoaching;
