import React from 'react';
import { CheckCircle, Sparkles, BarChart3, AlertCircle, Info } from 'lucide-react';

function AIOutput({ data, loading, title }) {
  if (loading) {
    return (
      <div className="ai-output">
        <div className="ai-output-section">
          <div className="ai-loading">
            <div className="ai-loading-spinner" />
            <p>AI is analyzing your data...</p>
          </div>
          <div className="ai-skeleton">
            <div className="ai-skeleton-line" />
            <div className="ai-skeleton-line" />
            <div className="ai-skeleton-line" />
            <div className="ai-skeleton-line" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getColorForIndex = (i) => {
    const colors = ['#1a73e8', '#34a853', '#ea4335', '#fbbc04', '#4285f4', '#7c3aed', '#06b6d4'];
    return colors[i % colors.length];
  };

  const isNumeric = (val) => {
    if (typeof val === 'number') return true;
    if (typeof val === 'string') {
      const cleaned = val.replace(/[%$,]/g, '');
      return !isNaN(cleaned) && cleaned.trim() !== '';
    }
    return false;
  };

  const getNumericValue = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseFloat(val.replace(/[%$,]/g, ''));
    return 0;
  };

  const renderValue = (key, value, depth = 0) => {
    if (value === null || value === undefined) return <span>-</span>;

    if (typeof value === 'boolean') {
      return <span style={{ color: value ? '#34a853' : '#ea4335' }}>{value ? 'Yes' : 'No'}</span>;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      return <span className="ai-value">{String(value)}</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="ai-value">None</span>;

      if (value.every((v) => typeof v === 'string' || typeof v === 'number')) {
        const lowerKey = key.toLowerCase();
        const isRecommendation = lowerKey.includes('recommend') || lowerKey.includes('suggestion') || lowerKey.includes('action') || lowerKey.includes('tip');

        if (isRecommendation) {
          return (
            <div>
              {value.map((item, i) => (
                <div className="ai-recommendation" key={i}>
                  <CheckCircle size={18} />
                  <p>{String(item)}</p>
                </div>
              ))}
            </div>
          );
        }

        return (
          <div>
            {value.map((item, i) => (
              <div className="ai-list-item" key={i}>{String(item)}</div>
            ))}
          </div>
        );
      }

      return (
        <div>
          {value.map((item, i) => (
            <div className="ai-output-section" key={i} style={{ marginTop: 8 }}>
              {typeof item === 'object' ? renderObject(item, depth + 1) : <div className="ai-list-item">{String(item)}</div>}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === 'object') {
      return <div style={{ marginTop: 4 }}>{renderObject(value, depth + 1)}</div>;
    }

    return <span>{String(value)}</span>;
  };

  const renderObject = (obj, depth = 0) => {
    if (!obj || typeof obj !== 'object') return null;

    const entries = Object.entries(obj);

    const metricEntries = entries.filter(([, v]) => isNumeric(v));
    const stringEntries = entries.filter(([, v]) => typeof v === 'string' && !isNumeric(v));
    const arrayEntries = entries.filter(([, v]) => Array.isArray(v));
    const objectEntries = entries.filter(([, v]) => typeof v === 'object' && v !== null && !Array.isArray(v));
    const boolEntries = entries.filter(([, v]) => typeof v === 'boolean');

    return (
      <div>
        {metricEntries.length > 0 && (
          <div className="ai-metrics-grid" style={{ marginBottom: 16 }}>
            {metricEntries.map(([k, v], i) => (
              <div className="ai-metric" key={k}>
                <div className="ai-metric-value" style={{ color: getColorForIndex(i) }}>
                  {String(v)}
                </div>
                <div className="ai-metric-label">{k.replace(/[_-]/g, ' ')}</div>
                {getNumericValue(v) <= 100 && getNumericValue(v) >= 0 && (
                  <div className="ai-progress-bar">
                    <div
                      className="ai-progress-fill"
                      style={{
                        width: `${Math.min(getNumericValue(v), 100)}%`,
                        background: getColorForIndex(i)
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {(stringEntries.length > 0 || boolEntries.length > 0) && (
          <div style={{ marginBottom: 16 }}>
            {[...stringEntries, ...boolEntries].map(([k, v]) => (
              <div className="ai-key-value" key={k}>
                <span className="ai-key">{k.replace(/[_-]/g, ' ')}</span>
                {renderValue(k, v, depth)}
              </div>
            ))}
          </div>
        )}

        {arrayEntries.map(([k, v]) => (
          <div key={k} style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 10, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 8 }}>
              {k.toLowerCase().includes('recommend') || k.toLowerCase().includes('suggestion') ? <CheckCircle size={18} color="#34a853" /> :
               k.toLowerCase().includes('alert') || k.toLowerCase().includes('warning') ? <AlertCircle size={18} color="#ea4335" /> :
               <BarChart3 size={18} color="#1a73e8" />}
              {k.replace(/[_-]/g, ' ')}
            </h3>
            {renderValue(k, v, depth)}
          </div>
        ))}

        {objectEntries.map(([k, v]) => (
          <div className="ai-output-section" key={k} style={{ marginTop: depth > 0 ? 8 : 0 }}>
            <h3>{k.replace(/[_-]/g, ' ')}</h3>
            {renderObject(v, depth + 1)}
          </div>
        ))}
      </div>
    );
  };

  const displayData = typeof data === 'string' ? { result: data } : data;

  return (
    <div className="ai-output">
      {title && (
        <div className="ai-output-title">
          <Sparkles size={20} color="#7c3aed" />
          {title}
        </div>
      )}
      <div className="ai-output-section">
        {renderObject(displayData)}
      </div>
    </div>
  );
}

export default AIOutput;
