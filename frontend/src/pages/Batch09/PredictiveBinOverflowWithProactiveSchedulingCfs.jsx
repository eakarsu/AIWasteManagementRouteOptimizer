// // === Batch 09 Gaps & Frontend Mounts ===
import React, { useState } from 'react';
import NativeAIPresets from '../../components/NativeAIPresets';
import AIReport from '../../components/AIReport';

export default function PredictiveBinOverflowWithProactiveSchedulingPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const run = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const r = await fetch('/api/custom/predictive-bin-overflow-with-proactive-scheduling', {
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
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Predictive bin overflow with proactive scheduling</h1>
      <p style={{ color: '#666', marginBottom: 16 }}>Generated gap feature for AIWasteManagementRouteOptimizer.</p>
      <NativeAIPresets disabled={loading} presets={[{ label: "Operations review", value: "Plan a weekly overflow review for downtown public bins using recent verified fill readings and collection times." }, { label: "Exception scenario", value: "Assess a weekend festival scenario with higher foot traffic and missing sensor readings; flag the uncertainty." }, { label: "Planning example", value: "Compare proactive pickup timing for school and market bins while preserving existing routes." }]} onChoose={({ value }) => setInput(value)} />
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
