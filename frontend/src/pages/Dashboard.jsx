import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Route, Trash2, Truck, Users, Bell, FileText,
  TrendingUp, TrendingDown, ArrowRight, AlertTriangle
} from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState({
    routes: 0, bins: 0, vehicles: 0, drivers: 0, alerts: 0, reports: 0
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const endpoints = ['routes', 'bins', 'vehicles', 'drivers', 'alerts', 'reports'];
      const results = await Promise.all(
        endpoints.map((e) => fetch(`/api/${e}`, { headers }).then((r) => r.json()).catch(() => []))
      );
      setStats({
        routes: Array.isArray(results[0]) ? results[0].length : 0,
        bins: Array.isArray(results[1]) ? results[1].length : 0,
        vehicles: Array.isArray(results[2]) ? results[2].length : 0,
        drivers: Array.isArray(results[3]) ? results[3].length : 0,
        alerts: Array.isArray(results[4]) ? results[4].length : 0,
        reports: Array.isArray(results[5]) ? results[5].length : 0,
      });
      if (Array.isArray(results[4])) {
        setRecentAlerts(results[4].slice(0, 5));
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { label: 'Total Routes', value: stats.routes, icon: Route, color: 'blue', trend: '+12%', trendDir: 'up', path: '/routes' },
    { label: 'Smart Bins', value: stats.bins, icon: Trash2, color: 'green', trend: '+5%', trendDir: 'up', path: '/bins' },
    { label: 'Vehicles', value: stats.vehicles, icon: Truck, color: 'yellow', trend: '0%', trendDir: 'up', path: '/vehicles' },
    { label: 'Drivers', value: stats.drivers, icon: Users, color: 'blue', trend: '+2%', trendDir: 'up', path: '/drivers' },
    { label: 'Active Alerts', value: stats.alerts, icon: Bell, color: 'red', trend: '-8%', trendDir: 'down', path: '/alerts' },
    { label: 'Citizen Reports', value: stats.reports, icon: FileText, color: 'green', trend: '+15%', trendDir: 'up', path: '/reports' },
  ];

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1>Dashboard</h1></div>
        <div className="cards-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div className="card" key={i} style={{ height: 140 }}>
              <div className="ai-skeleton"><div className="ai-skeleton-line" /><div className="ai-skeleton-line" /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/routes')}>
            <Route size={16} /> Optimize Routes
          </button>
        </div>
      </div>

      <div className="cards-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              className="card card-clickable"
              key={card.label}
              onClick={() => navigate(card.path)}
            >
              <div className="card-header">
                <div className={`card-icon ${card.color}`}>
                  <Icon size={24} />
                </div>
                <span className={`card-trend ${card.trendDir}`}>
                  {card.trendDir === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {card.trend}
                </span>
              </div>
              <div className="card-value">{card.value}</div>
              <div className="card-label">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="section">
        <div className="section-title">Recent Alerts</div>
        {recentAlerts.length > 0 ? (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Message</th>
                  <th>Severity</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentAlerts.map((alert) => (
                  <tr key={alert.id || alert._id} onClick={() => navigate('/alerts')}>
                    <td>{alert.type || '-'}</td>
                    <td>{alert.message || '-'}</td>
                    <td>
                      <span className={`status-badge ${(alert.severity || 'info').toLowerCase()}`}>
                        {alert.severity || 'info'}
                      </span>
                    </td>
                    <td>{alert.created_at ? new Date(alert.created_at).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card">
            <div className="empty-state">
              <AlertTriangle />
              <h3>No recent alerts</h3>
              <p>Everything is running smoothly.</p>
            </div>
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-title">Quick Actions</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-ai" onClick={() => navigate('/ai/waste-prediction')}>AI Waste Prediction</button>
          <button className="btn btn-success" onClick={() => navigate('/ai/recycling-analytics')}>Recycling Analytics</button>
          <button className="btn btn-primary" onClick={() => navigate('/ai/cost-analysis')}>Cost Analysis</button>
          <button className="btn btn-secondary" onClick={() => navigate('/ai/environmental-impact')}>Environmental Impact</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
