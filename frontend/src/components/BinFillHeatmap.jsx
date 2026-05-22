import React, { useEffect, useState } from 'react';

function colorFor(v) {
  // 0 (green) -> 100 (red)
  const r = Math.round(40 + (v / 100) * 200);
  const g = Math.round(200 - (v / 100) * 180);
  const b = 60;
  return `rgb(${r},${g},${b})`;
}

export default function BinFillHeatmap() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/custom-views/bin-heatmap', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(e => setErr(String(e)));
  }, []);

  if (err) return <div style={{ color: '#c33' }}>Error: {err}</div>;
  if (!data) return <div>Loading bin heatmap...</div>;

  const hours = data.hours || [];
  const rows = data.rows || [];

  return (
    <div style={{ padding: 16, border: '1px solid #ddd', borderRadius: 8, background: '#fff' }}>
      <h3 style={{ margin: '0 0 8px 0' }}>Bin Fill-Level Heatmap (bin × hour)</h3>
      <div style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
        Rows: {rows.length} bins · Columns: {hours.length} time slots
      </div>
      <table data-testid="bin-heatmap-table" style={{ borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '4px 8px', borderBottom: '1px solid #ccc' }}>Bin</th>
            {hours.map(h => (
              <th key={h} style={{ padding: '4px 8px', borderBottom: '1px solid #ccc' }}>{h}:00</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.bin_id}>
              <td style={{ padding: '4px 8px', fontWeight: 600 }}>{r.bin_code}</td>
              {r.values.map((v, i) => (
                <td key={i} style={{
                  background: colorFor(v),
                  color: v > 60 ? '#fff' : '#222',
                  padding: '6px 10px',
                  textAlign: 'center',
                  minWidth: 32,
                }}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
