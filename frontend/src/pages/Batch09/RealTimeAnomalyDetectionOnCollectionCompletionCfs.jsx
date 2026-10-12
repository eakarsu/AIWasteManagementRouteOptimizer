// // === Batch 09 Gaps & Frontend Mounts ===
import React, { useState } from 'react';
import NativeAIPresets from '../../components/NativeAIPresets';
import AIReport from '../../components/AIReport';

export default function RealTimeAnomalyDetectionOnCollectionCompletionPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const run = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const r = await fetch('/api/custom/real-time-anomaly-detection-on-collection-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ prompt: input })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Request failed');
      setResult(data);
    } catch (e) { setError(e.message || 'Error'); }
    setLoading(false);
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Real-time anomaly detection on collection completion</h1>
      <p style={{ color: '#666', marginBottom: 16 }}>Generated gap feature for AIWasteManagementRouteOptimizer.</p>
      <NativeAIPresets disabled={loading} presets={[{ label: "Operations review", value: "Review a missed pickup signal when GPS shows a vehicle nearby but no completion scan was recorded." }, { label: "Exception scenario", value: "Assess duplicate completion events for the same stop and outline verification before notifying staff." }, { label: "Planning example", value: "Explain how to triage route completion gaps when device connectivity was intermittent." }]} onChoose={({ value }) => setInput(value)} />
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Describe what you need..."
        rows={6}
        style={{ width: '100%', padding: 12, border: '1px solid #ccc', borderRadius: 6, marginBottom: 12 }}
      />
      <button
        onClick={run}
        disabled={loading}
        style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
      >
        {loading ? 'Running...' : 'Run AI'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      <AIReport response={result} title="AI analysis" />
    </div>
  );
}
