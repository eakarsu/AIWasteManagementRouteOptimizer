import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Recycle, LayoutDashboard, Route, Trash2, Truck, Calendar,
  MapPin, Users, FileText, Bell, Brain, ChevronDown,
  LogOut, Sparkles, FlaskConical, DollarSign, Leaf,
  BarChart3, AlertTriangle, TrendingUp
} from 'lucide-react';

function Sidebar() {
  const [aiOpen, setAiOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Recycle size={28} />
        <span>WasteAI</span>
      </div>

      <ul className="sidebar-nav">
        <li className="sidebar-section-title">Main</li>
        <li className="sidebar-nav-item">
          <NavLink to="/" end><LayoutDashboard /> Dashboard</NavLink>
        </li>

        <li className="sidebar-section-title">Operations</li>
        <li className="sidebar-nav-item">
          <NavLink to="/routes"><Route /> Route Optimization</NavLink>
        </li>
        <li className="sidebar-nav-item">
          <NavLink to="/bins"><Trash2 /> Smart Bins</NavLink>
        </li>
        <li className="sidebar-nav-item">
          <NavLink to="/vehicles"><Truck /> Fleet Management</NavLink>
        </li>
        <li className="sidebar-nav-item">
          <NavLink to="/schedules"><Calendar /> Collection Schedules</NavLink>
        </li>

        <li className="sidebar-section-title">Management</li>
        <li className="sidebar-nav-item">
          <NavLink to="/zones"><MapPin /> Zone Management</NavLink>
        </li>
        <li className="sidebar-nav-item">
          <NavLink to="/drivers"><Users /> Driver Management</NavLink>
        </li>
        <li className="sidebar-nav-item">
          <NavLink to="/reports"><FileText /> Citizen Reports</NavLink>
        </li>
        <li className="sidebar-nav-item">
          <NavLink to="/alerts"><Bell /> Smart Alerts</NavLink>
        </li>

        <li className="sidebar-section-title">AI Center</li>
        <li className="sidebar-nav-item">
          <button
            className={`sidebar-submenu-toggle ${aiOpen ? 'open' : ''}`}
            onClick={() => setAiOpen(!aiOpen)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Brain /> AI Features
            </span>
            <ChevronDown className="toggle-icon" />
          </button>
        </li>

        <ul className={`sidebar-submenu ${aiOpen ? 'open' : ''}`}>
          <li className="sidebar-nav-item">
            <NavLink to="/ai/waste-prediction"><Sparkles /> Waste Prediction</NavLink>
          </li>
          <li className="sidebar-nav-item">
            <NavLink to="/ai/waste-classification"><FlaskConical /> Classification</NavLink>
          </li>
          <li className="sidebar-nav-item">
            <NavLink to="/ai/cost-analysis"><DollarSign /> Cost Analysis</NavLink>
          </li>
          <li className="sidebar-nav-item">
            <NavLink to="/ai/environmental-impact"><Leaf /> Environmental</NavLink>
          </li>
          <li className="sidebar-nav-item">
            <NavLink to="/ai/recycling-analytics"><BarChart3 /> Recycling</NavLink>
          </li>
          <li className="sidebar-nav-item">
            <NavLink to="/ai/anomaly-detection"><AlertTriangle /> Anomaly Detection</NavLink>
          </li>
          <li className="sidebar-nav-item">
            <NavLink to="/ai/demand-forecasting"><TrendingUp /> Demand Forecast</NavLink>
          </li>
        </ul>
      </ul>

      <div className="sidebar-logout">
        <div className="sidebar-nav-item">
          <button onClick={handleLogout}><LogOut /> Logout</button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
