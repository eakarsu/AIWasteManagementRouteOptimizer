import React from 'react';
import RouteEfficiencyChart from '../components/RouteEfficiencyChart';
import BinFillHeatmap from '../components/BinFillHeatmap';
import RoutePlanPdf from '../components/RoutePlanPdf';
import CollectionRulesEditor from '../components/CollectionRulesEditor';

export default function CustomViewsPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginTop: 0 }}>Waste Views</h1>
      <p style={{ color: '#555', marginTop: 4 }}>
        Custom operational views: route efficiency, bin fill-level heatmap, printable route plans, and collection rule management.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <RouteEfficiencyChart />
        <BinFillHeatmap />
        <RoutePlanPdf />
        <CollectionRulesEditor />
      </div>
    </div>
  );
}
