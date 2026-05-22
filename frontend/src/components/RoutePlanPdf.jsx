import React, { useState } from 'react';

export default function RoutePlanPdf() {
  const [status, setStatus] = useState('idle');
  const [preview, setPreview] = useState('');
  const [err, setErr] = useState(null);

  const fetchPlan = async () => {
    setStatus('loading');
    setErr(null);
    try {
      const token = localStorage.getItem('token');
      const r = await fetch('/api/custom-views/route-plan-pdf', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const text = await r.text();
      setPreview(text);
      setStatus('ready');
    } catch (e) {
      setErr(String(e));
      setStatus('error');
    }
  };

  const download = () => {
    const blob = new Blob([preview], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'route-plan.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 16, border: '1px solid #ddd', borderRadius: 8, background: '#fff' }}>
      <h3 style={{ margin: '0 0 8px 0' }}>Route Plan PDF</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={fetchPlan} disabled={status === 'loading'} style={{ padding: '6px 14px' }}>
          {status === 'loading' ? 'Generating...' : 'Generate Plan'}
        </button>
        {preview && <button onClick={download} style={{ padding: '6px 14px' }}>Download</button>}
      </div>
      {err && <div style={{ color: '#c33' }}>Error: {err}</div>}
      {preview && (
        <pre data-testid="route-plan-preview" style={{
          background: '#0f172a',
          color: '#e2e8f0',
          padding: 12,
          borderRadius: 6,
          maxHeight: 280,
          overflow: 'auto',
          fontSize: 11,
        }}>{preview}</pre>
      )}
    </div>
  );
}
