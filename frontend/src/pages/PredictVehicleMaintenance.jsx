import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import AIOutput from '../components/AIOutput';

function PredictVehicleMaintenance() {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetch('/api/vehicles', { headers })
      .then((r) => r.json())
      .then((d) => setVehicles(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const handleRun = async () => {
    if (!vehicleId) return;
    setAiLoading(true);
    setAiResult(null);
    setError(null);
    try {
      const res = await fetch('/api/ai/predict-vehicle-maintenance', {
        method: 'POST',
        headers,
        body: JSON.stringify({ vehicle_id: parseInt(vehicleId, 10) }),
      });
      if (res.status === 503) {
        setError('AI service unavailable. The OPENROUTER_API_KEY is not configured on the server.');
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Prediction failed.');
        return;
      }
      setAiResult(data);
    } catch (err) {
      setError('Prediction failed. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Predictive Vehicle Maintenance</h1>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 240 }}>
            <label>Vehicle</label>
            <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
              <option value="">-- Select Vehicle --</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate_number || `Vehicle ${v.id}`}
                  {v.type ? ` (${v.type})` : ''}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-ai"
            onClick={handleRun}
            disabled={!vehicleId || aiLoading}
          >
            <Sparkles size={16} /> Predict Maintenance
          </button>
        </div>
      </div>

      {error && (
        <div className="toast error" style={{ position: 'static', marginBottom: 16 }}>
          {error}
        </div>
      )}

      <AIOutput data={aiResult} loading={aiLoading} title="Maintenance Prediction" />
    </div>
  );
}

export default PredictVehicleMaintenance;
