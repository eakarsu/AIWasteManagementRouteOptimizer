import React, { useEffect, useState } from 'react';

export default function RouteEfficiencyChart() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/custom-views/route-efficiency', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(e => setErr(String(e)));
  }, []);

  if (err) return <div style={{ color: '#c33' }}>Error: {err}</div>;
  if (!data) return <div>Loading route efficiency...</div>;

  const series = data.series || [];
  const maxScore = Math.max(100, ...series.map(s => s.efficiency_score));

  return (
    <div style={{ padding: 16, border: '1px solid #ddd', borderRadius: 8, background: '#fff' }}>
      <h3 style={{ margin: '0 0 8px 0' }}>Route Efficiency Chart</h3>
      <div style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
        Routes: {data.summary?.total_routes} · Avg Efficiency: {data.summary?.avg_efficiency} · Optimized: {data.summary?.optimized_count}
      </div>
      <div data-testid="route-efficiency-bars" style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 220, padding: '4px 0', borderBottom: '1px solid #eee' }}>
        {series.map(s => {
          const h = Math.round((s.efficiency_score / maxScore) * 200);
          return (
            <div key={s.route_id} title={`${s.name} — ${s.efficiency_score}`} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: h,
                background: s.optimized ? '#2e7d32' : '#1976d2',
                borderRadius: '4px 4px 0 0',
                marginBottom: 4,
              }} />
              <div style={{ fontSize: 10, color: '#444', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {s.name?.slice(0, 10)}
              </div>
              <div style={{ fontSize: 10, color: '#888' }}>{s.efficiency_score}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
