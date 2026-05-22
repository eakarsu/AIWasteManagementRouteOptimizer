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
import PredictVehicleMaintenance from './pages/PredictVehicleMaintenance';
import DriverCoaching from './pages/DriverCoaching';
import CustomViewsPage from './pages/CustomViewsPage';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

// // === Batch 09 Gaps & Frontend Mounts ===
const RealTimeAnomalyDetectionOnCollectionCompletionCfs = React.lazy(() => import('./pages/Batch09/RealTimeAnomalyDetectionOnCollectionCompletionCfs'));
const DynamicPricingByNeighborhoodDemandAndWasteStreamCfs = React.lazy(() => import('./pages/Batch09/DynamicPricingByNeighborhoodDemandAndWasteStreamCfs'));
const DriverPerformanceLeaderboardWithAiCoachingCfs = React.lazy(() => import('./pages/Batch09/DriverPerformanceLeaderboardWithAiCoachingCfs'));
const SmartContaminationDetectionInRecyclingStreamsVisionIoCfs = React.lazy(() => import('./pages/Batch09/SmartContaminationDetectionInRecyclingStreamsVisionIoCfs'));
const PredictiveBinOverflowWithProactiveSchedulingCfs = React.lazy(() => import('./pages/Batch09/PredictiveBinOverflowWithProactiveSchedulingCfs'));
const MunicipalRegulationComplianceAutomationCfs = React.lazy(() => import('./pages/Batch09/MunicipalRegulationComplianceAutomationCfs'));
const CarbonCreditMarketplaceIntegrationCfs = React.lazy(() => import('./pages/Batch09/CarbonCreditMarketplaceIntegrationCfs'));
const PredictiveVehicleMaintenanceFromTelemetryGapAi = React.lazy(() => import('./pages/Batch09/PredictiveVehicleMaintenanceFromTelemetryGapAi'));
const AiPoweredDriverRouteCoachingAndFuelEfficiencyFeedbacGapAi = React.lazy(() => import('./pages/Batch09/AiPoweredDriverRouteCoachingAndFuelEfficiencyFeedbacGapAi'));
const ComputerVisionBinConditionAssessmentGapAi = React.lazy(() => import('./pages/Batch09/ComputerVisionBinConditionAssessmentGapAi'));
const CustomerresidentPortalForServiceRequestsGapNon = React.lazy(() => import('./pages/Batch09/CustomerresidentPortalForServiceRequestsGapNon'));
const BillinginvoicingForCommercialAccountsGapNon = React.lazy(() => import('./pages/Batch09/BillinginvoicingForCommercialAccountsGapNon'));
const ComplaintAndMissedPickupTicketingGapNon = React.lazy(() => import('./pages/Batch09/ComplaintAndMissedPickupTicketingGapNon'));
const RealTimeGpsTrackingDashboardWithLiveEtasGapNon = React.lazy(() => import('./pages/Batch09/RealTimeGpsTrackingDashboardWithLiveEtasGapNon'));
const HazardousWasteManifestTrackingGapNon = React.lazy(() => import('./pages/Batch09/HazardousWasteManifestTrackingGapNon'));
const DriverMobileAppEndpointsGapNon = React.lazy(() => import('./pages/Batch09/DriverMobileAppEndpointsGapNon'));

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
        <Route path="/insights/timeline" element={<ProtectedRoute><TimelineView /></ProtectedRoute>} />
        <Route path="/codex/custom-viz" element={<ProtectedRoute><CodexCustomVizFeature /></ProtectedRoute>} />
        <Route path="/codex/operations" element={<ProtectedRoute><CodexOperationsFeature /></ProtectedRoute>} />

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
          <Route path="/ai/predict-vehicle-maintenance" element={<PredictVehicleMaintenance />} />
          <Route path="/ai/driver-coaching" element={<DriverCoaching />} />
          <Route path="/custom-views" element={<CustomViewsPage />} />
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
    
      {/* // === Batch 09 Gaps & Frontend Mounts === */}
        <Route path="/batch09/cfs/real-time-anomaly-detection-on-collection-completion" element={<React.Suspense fallback={<div>Loading...</div>}><RealTimeAnomalyDetectionOnCollectionCompletionCfs /></React.Suspense>} />
        <Route path="/batch09/cfs/dynamic-pricing-by-neighborhood-demand-and-waste-stream" element={<React.Suspense fallback={<div>Loading...</div>}><DynamicPricingByNeighborhoodDemandAndWasteStreamCfs /></React.Suspense>} />
        <Route path="/batch09/cfs/driver-performance-leaderboard-with-ai-coaching" element={<React.Suspense fallback={<div>Loading...</div>}><DriverPerformanceLeaderboardWithAiCoachingCfs /></React.Suspense>} />
        <Route path="/batch09/cfs/smart-contamination-detection-in-recycling-streams-vision-io" element={<React.Suspense fallback={<div>Loading...</div>}><SmartContaminationDetectionInRecyclingStreamsVisionIoCfs /></React.Suspense>} />
        <Route path="/batch09/cfs/predictive-bin-overflow-with-proactive-scheduling" element={<React.Suspense fallback={<div>Loading...</div>}><PredictiveBinOverflowWithProactiveSchedulingCfs /></React.Suspense>} />
        <Route path="/batch09/cfs/municipal-regulation-compliance-automation" element={<React.Suspense fallback={<div>Loading...</div>}><MunicipalRegulationComplianceAutomationCfs /></React.Suspense>} />
        <Route path="/batch09/cfs/carbon-credit-marketplace-integration" element={<React.Suspense fallback={<div>Loading...</div>}><CarbonCreditMarketplaceIntegrationCfs /></React.Suspense>} />
        <Route path="/batch09/gap-ai/predictive-vehicle-maintenance-from-telemetry" element={<React.Suspense fallback={<div>Loading...</div>}><PredictiveVehicleMaintenanceFromTelemetryGapAi /></React.Suspense>} />
        <Route path="/batch09/gap-ai/ai-powered-driver-route-coaching-and-fuel-efficiency-feedbac" element={<React.Suspense fallback={<div>Loading...</div>}><AiPoweredDriverRouteCoachingAndFuelEfficiencyFeedbacGapAi /></React.Suspense>} />
        <Route path="/batch09/gap-ai/computer-vision-bin-condition-assessment" element={<React.Suspense fallback={<div>Loading...</div>}><ComputerVisionBinConditionAssessmentGapAi /></React.Suspense>} />
        <Route path="/batch09/gap-nonai/customerresident-portal-for-service-requests" element={<React.Suspense fallback={<div>Loading...</div>}><CustomerresidentPortalForServiceRequestsGapNon /></React.Suspense>} />
        <Route path="/batch09/gap-nonai/billinginvoicing-for-commercial-accounts" element={<React.Suspense fallback={<div>Loading...</div>}><BillinginvoicingForCommercialAccountsGapNon /></React.Suspense>} />
        <Route path="/batch09/gap-nonai/complaint-and-missed-pickup-ticketing" element={<React.Suspense fallback={<div>Loading...</div>}><ComplaintAndMissedPickupTicketingGapNon /></React.Suspense>} />
        <Route path="/batch09/gap-nonai/real-time-gps-tracking-dashboard-with-live-etas" element={<React.Suspense fallback={<div>Loading...</div>}><RealTimeGpsTrackingDashboardWithLiveEtasGapNon /></React.Suspense>} />
        <Route path="/batch09/gap-nonai/hazardous-waste-manifest-tracking" element={<React.Suspense fallback={<div>Loading...</div>}><HazardousWasteManifestTrackingGapNon /></React.Suspense>} />
        <Route path="/batch09/gap-nonai/driver-mobile-app-endpoints" element={<React.Suspense fallback={<div>Loading...</div>}><DriverMobileAppEndpointsGapNon /></React.Suspense>} />

      </Routes>
  );
}

export default App;
