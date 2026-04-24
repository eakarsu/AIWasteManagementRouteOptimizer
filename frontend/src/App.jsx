import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RouteOptimization from './pages/RouteOptimization';
import SmartBins from './pages/SmartBins';
import FleetManagement from './pages/FleetManagement';
import CollectionSchedules from './pages/CollectionSchedules';
import ZoneManagement from './pages/ZoneManagement';
import DriverManagement from './pages/DriverManagement';
import CitizenReports from './pages/CitizenReports';
import SmartAlerts from './pages/SmartAlerts';
import WastePrediction from './pages/WastePrediction';
import WasteClassification from './pages/WasteClassification';
import CostAnalysis from './pages/CostAnalysis';
import EnvironmentalImpact from './pages/EnvironmentalImpact';
import RecyclingAnalytics from './pages/RecyclingAnalytics';
import AnomalyDetection from './pages/AnomalyDetection';
import DemandForecasting from './pages/DemandForecasting';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/routes" element={<RouteOptimization />} />
          <Route path="/bins" element={<SmartBins />} />
          <Route path="/vehicles" element={<FleetManagement />} />
          <Route path="/schedules" element={<CollectionSchedules />} />
          <Route path="/zones" element={<ZoneManagement />} />
          <Route path="/drivers" element={<DriverManagement />} />
          <Route path="/reports" element={<CitizenReports />} />
          <Route path="/alerts" element={<SmartAlerts />} />
          <Route path="/ai/waste-prediction" element={<WastePrediction />} />
          <Route path="/ai/waste-classification" element={<WasteClassification />} />
          <Route path="/ai/cost-analysis" element={<CostAnalysis />} />
          <Route path="/ai/environmental-impact" element={<EnvironmentalImpact />} />
          <Route path="/ai/recycling-analytics" element={<RecyclingAnalytics />} />
          <Route path="/ai/anomaly-detection" element={<AnomalyDetection />} />
          <Route path="/ai/demand-forecasting" element={<DemandForecasting />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
