import { Router } from 'express';
import fetch from 'node-fetch';
import pool from '../db.js';

const router = Router();

async function callOpenRouter(prompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    })
  });

  const data = await response.json();
  if (!data.choices || !data.choices[0]) {
    throw new Error('Invalid response from AI service');
  }

  const content = data.choices[0].message.content;
  try {
    return JSON.parse(content);
  } catch {
    return { response: content };
  }
}

// 1. Optimize Route
router.post('/optimize-route', async (req, res) => {
  try {
    const { zone_id } = req.body;
    const bins = await pool.query('SELECT * FROM bins WHERE zone_id = $1 ORDER BY fill_level DESC', [zone_id]);
    const routes = await pool.query('SELECT * FROM collection_routes WHERE zone_id = $1', [zone_id]);
    const zone = await pool.query('SELECT * FROM zones WHERE id = $1', [zone_id]);

    const prompt = `You are a waste management route optimization AI. Analyze the following data and provide an optimized collection route.

Zone: ${JSON.stringify(zone.rows[0])}
Current Routes: ${JSON.stringify(routes.rows)}
Bins in Zone: ${JSON.stringify(bins.rows)}

Provide a JSON response with:
- optimized_order: array of bin IDs in optimal collection order (prioritize high fill levels)
- estimated_distance_km: optimized total distance
- estimated_time: estimated completion time
- fuel_savings_percent: estimated fuel savings vs current route
- co2_reduction_kg: estimated CO2 reduction
- recommendations: array of specific improvement suggestions
- priority_bins: array of bin IDs that need immediate collection (fill > 80%)`;

    const result = await callOpenRouter(prompt);
    res.json(result);
  } catch (err) {
    console.error('Optimize route error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Predict Waste
router.post('/predict-waste', async (req, res) => {
  try {
    const { zone_id, period } = req.body;
    const bins = await pool.query('SELECT * FROM bins WHERE zone_id = $1', [zone_id]);
    const zone = await pool.query('SELECT * FROM zones WHERE id = $1', [zone_id]);
    const reports = await pool.query('SELECT * FROM citizen_reports ORDER BY created_at DESC LIMIT 20');

    const prompt = `You are a waste volume prediction AI. Analyze the following data and predict waste volumes for the next ${period || 'week'}.

Zone: ${JSON.stringify(zone.rows[0])}
Current Bins: ${JSON.stringify(bins.rows)}
Recent Reports: ${JSON.stringify(reports.rows)}

Provide a JSON response with:
- predicted_volume_tons: total predicted waste volume
- daily_breakdown: object with day names and predicted tons
- peak_day: day with highest expected volume
- waste_type_distribution: object with waste types and percentages
- confidence_level: prediction confidence (0-100)
- factors: array of factors influencing the prediction
- recommendations: array of preparation suggestions`;

    const result = await callOpenRouter(prompt);
    res.json(result);
  } catch (err) {
    console.error('Predict waste error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Classify Waste
router.post('/classify-waste', async (req, res) => {
  try {
    const { description } = req.body;

    const prompt = `You are a waste classification AI. Classify the following waste description into the appropriate category.

Waste Description: "${description}"

Provide a JSON response with:
- category: primary waste category (recyclable, organic, hazardous, general, electronic, medical, construction, industrial)
- sub_category: specific sub-category
- disposal_method: recommended disposal method
- recyclable: boolean whether it can be recycled
- special_handling: boolean whether special handling is needed
- environmental_impact: low/medium/high
- bin_type: recommended bin type for disposal
- instructions: specific disposal instructions
- warnings: any safety warnings (array of strings)`;

    const result = await callOpenRouter(prompt);
    res.json(result);
  } catch (err) {
    console.error('Classify waste error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Analyze Cost
router.post('/analyze-cost', async (req, res) => {
  try {
    const { zone_id } = req.body;
    const routes = await pool.query('SELECT * FROM collection_routes WHERE zone_id = $1', [zone_id]);
    const vehicles = await pool.query('SELECT * FROM vehicles WHERE status = $1', ['active']);
    const zone = await pool.query('SELECT * FROM zones WHERE id = $1', [zone_id]);
    const schedules = await pool.query(`SELECT s.* FROM schedules s JOIN collection_routes r ON s.route_id = r.id WHERE r.zone_id = $1`, [zone_id]);

    const prompt = `You are a waste management cost analysis AI. Analyze the following data and provide cost optimization suggestions.

Zone: ${JSON.stringify(zone.rows[0])}
Routes: ${JSON.stringify(routes.rows)}
Active Vehicles: ${JSON.stringify(vehicles.rows)}
Schedules: ${JSON.stringify(schedules.rows)}

Provide a JSON response with:
- current_estimated_monthly_cost: estimated current monthly cost in dollars
- optimized_monthly_cost: projected cost after optimization
- savings_potential_percent: percentage savings possible
- cost_breakdown: object with categories (fuel, labor, maintenance, overhead) and amounts
- optimization_suggestions: array of specific cost-saving measures with estimated savings each
- roi_timeline_months: estimated months to see return on optimization investment
- risk_factors: array of potential cost increase risks`;

    const result = await callOpenRouter(prompt);
    res.json(result);
  } catch (err) {
    console.error('Analyze cost error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Environmental Impact
router.post('/environmental-impact', async (req, res) => {
  try {
    const { zone_id } = req.body;
    const bins = await pool.query('SELECT * FROM bins WHERE zone_id = $1', [zone_id]);
    const routes = await pool.query('SELECT * FROM collection_routes WHERE zone_id = $1', [zone_id]);
    const zone = await pool.query('SELECT * FROM zones WHERE id = $1', [zone_id]);
    const vehicles = await pool.query('SELECT * FROM vehicles WHERE status = $1', ['active']);

    const prompt = `You are an environmental impact analysis AI for waste management. Analyze the following data and calculate environmental metrics.

Zone: ${JSON.stringify(zone.rows[0])}
Bins: ${JSON.stringify(bins.rows)}
Routes: ${JSON.stringify(routes.rows)}
Vehicles: ${JSON.stringify(vehicles.rows)}

Provide a JSON response with:
- carbon_footprint_monthly_kg: estimated monthly CO2 emissions
- carbon_footprint_breakdown: object with sources (vehicles, processing, landfill) and kg
- recycling_rate_percent: current estimated recycling rate
- landfill_diversion_rate: percentage of waste diverted from landfill
- air_quality_impact: low/medium/high
- water_impact: assessment of impact on water systems
- sustainability_score: score out of 100
- improvement_actions: array of actions with estimated environmental benefit
- trees_equivalent: CO2 offset equivalent in trees`;

    const result = await callOpenRouter(prompt);
    res.json(result);
  } catch (err) {
    console.error('Environmental impact error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 6. Recycling Analytics
router.post('/recycling-analytics', async (req, res) => {
  try {
    const { zone_id } = req.body;
    const bins = await pool.query('SELECT * FROM bins WHERE zone_id = $1', [zone_id]);
    const zone = await pool.query('SELECT * FROM zones WHERE id = $1', [zone_id]);
    const reports = await pool.query('SELECT * FROM citizen_reports ORDER BY created_at DESC LIMIT 15');

    const prompt = `You are a recycling analytics AI. Analyze waste collection data and provide recycling insights.

Zone: ${JSON.stringify(zone.rows[0])}
Bins: ${JSON.stringify(bins.rows)}
Recent Reports: ${JSON.stringify(reports.rows)}

Provide a JSON response with:
- current_recycling_rate: estimated percentage
- target_recycling_rate: recommended target
- contamination_rate: estimated contamination percentage
- top_recyclable_materials: array of materials and their percentages
- improvement_opportunities: array of specific suggestions
- community_engagement_score: score out of 100
- education_recommendations: array of public education suggestions
- estimated_revenue_from_recyclables: monthly revenue potential in dollars
- comparison_to_national_average: above/below/at national average`;

    const result = await callOpenRouter(prompt);
    res.json(result);
  } catch (err) {
    console.error('Recycling analytics error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 7. Detect Anomaly
router.post('/detect-anomaly', async (req, res) => {
  try {
    const { zone_id } = req.body;
    const bins = await pool.query('SELECT * FROM bins WHERE zone_id = $1', [zone_id]);
    const alerts = await pool.query('SELECT * FROM alerts WHERE zone_id = $1 ORDER BY created_at DESC', [zone_id]);
    const reports = await pool.query('SELECT * FROM citizen_reports ORDER BY created_at DESC LIMIT 20');
    const zone = await pool.query('SELECT * FROM zones WHERE id = $1', [zone_id]);

    const prompt = `You are an anomaly detection AI for waste management. Analyze the following data and detect unusual patterns.

Zone: ${JSON.stringify(zone.rows[0])}
Bins: ${JSON.stringify(bins.rows)}
Recent Alerts: ${JSON.stringify(alerts.rows)}
Recent Reports: ${JSON.stringify(reports.rows)}

Provide a JSON response with:
- anomalies_detected: array of anomalies, each with type, severity, description, and affected_area
- risk_level: overall risk level (low/medium/high/critical)
- unusual_patterns: array of patterns that deviate from normal
- potential_causes: array of possible explanations
- recommended_actions: array of immediate actions to take
- monitoring_suggestions: array of things to watch going forward
- confidence_score: confidence in detection (0-100)`;

    const result = await callOpenRouter(prompt);
    res.json(result);
  } catch (err) {
    console.error('Detect anomaly error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 8. Forecast Demand
router.post('/forecast-demand', async (req, res) => {
  try {
    const { zone_id, period } = req.body;
    const bins = await pool.query('SELECT * FROM bins WHERE zone_id = $1', [zone_id]);
    const zone = await pool.query('SELECT * FROM zones WHERE id = $1', [zone_id]);
    const routes = await pool.query('SELECT * FROM collection_routes WHERE zone_id = $1', [zone_id]);
    const schedules = await pool.query(`SELECT s.* FROM schedules s JOIN collection_routes r ON s.route_id = r.id WHERE r.zone_id = $1`, [zone_id]);

    const prompt = `You are a waste collection demand forecasting AI. Predict future collection needs based on the data.

Zone: ${JSON.stringify(zone.rows[0])}
Bins: ${JSON.stringify(bins.rows)}
Routes: ${JSON.stringify(routes.rows)}
Schedules: ${JSON.stringify(schedules.rows)}
Forecast Period: ${period || '30 days'}

Provide a JSON response with:
- forecast_period: the period being forecasted
- predicted_collections: total number of collections needed
- peak_demand_days: array of dates/days with highest demand
- resource_requirements: object with vehicles_needed, drivers_needed, estimated_hours
- capacity_utilization_percent: predicted capacity usage
- growth_trend: increasing/stable/decreasing
- seasonal_factors: array of seasonal influences
- recommendations: array of preparation suggestions
- confidence_interval: low and high bounds for predictions`;

    const result = await callOpenRouter(prompt);
    res.json(result);
  } catch (err) {
    console.error('Forecast demand error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 9. Generate Alert
router.post('/generate-alert', async (req, res) => {
  try {
    const { zone_id, alert_type, parameters } = req.body;
    const bins = await pool.query('SELECT * FROM bins WHERE zone_id = $1', [zone_id]);
    const existingAlerts = await pool.query('SELECT * FROM alerts WHERE zone_id = $1 ORDER BY created_at DESC LIMIT 10', [zone_id]);
    const zone = await pool.query('SELECT * FROM zones WHERE id = $1', [zone_id]);

    const prompt = `You are a smart alert generation AI for waste management. Generate an appropriate alert based on the data.

Zone: ${JSON.stringify(zone.rows[0])}
Bins: ${JSON.stringify(bins.rows)}
Existing Alerts: ${JSON.stringify(existingAlerts.rows)}
Alert Type Requested: ${alert_type || 'auto-detect'}
Additional Parameters: ${JSON.stringify(parameters || {})}

Provide a JSON response with:
- alert_type: type of alert (overflow, maintenance, route-delay, illegal-dump, weather, capacity, performance)
- severity: critical/warning/info
- title: short alert title
- message: detailed alert message
- affected_bins: array of affected bin codes
- recommended_action: immediate action to take
- estimated_response_time: how quickly this should be addressed
- escalation_needed: boolean
- notification_targets: array of roles that should be notified`;

    const result = await callOpenRouter(prompt);
    res.json(result);
  } catch (err) {
    console.error('Generate alert error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 10. Schedule Optimizer
router.post('/schedule-optimizer', async (req, res) => {
  try {
    const { zone_id } = req.body;
    const routes = await pool.query('SELECT * FROM collection_routes WHERE zone_id = $1', [zone_id]);
    const schedules = await pool.query(`SELECT s.* FROM schedules s JOIN collection_routes r ON s.route_id = r.id WHERE r.zone_id = $1`, [zone_id]);
    const drivers = await pool.query('SELECT * FROM drivers WHERE status = $1', ['active']);
    const vehicles = await pool.query('SELECT * FROM vehicles WHERE status = $1', ['active']);
    const bins = await pool.query('SELECT * FROM bins WHERE zone_id = $1', [zone_id]);
    const zone = await pool.query('SELECT * FROM zones WHERE id = $1', [zone_id]);

    const prompt = `You are a collection schedule optimization AI. Optimize the waste collection schedule for maximum efficiency.

Zone: ${JSON.stringify(zone.rows[0])}
Current Routes: ${JSON.stringify(routes.rows)}
Current Schedules: ${JSON.stringify(schedules.rows)}
Available Drivers: ${JSON.stringify(drivers.rows)}
Available Vehicles: ${JSON.stringify(vehicles.rows)}
Bins: ${JSON.stringify(bins.rows)}

Provide a JSON response with:
- optimized_schedule: array of schedule entries with route_id, vehicle_id, driver_id, day, start_time, end_time
- efficiency_improvement_percent: expected improvement
- driver_utilization: object mapping driver IDs to utilization percentages
- vehicle_utilization: object mapping vehicle IDs to utilization percentages
- time_savings_hours_weekly: weekly hours saved
- coverage_gaps: array of any coverage gaps identified
- recommendations: array of scheduling improvements
- workload_balance_score: score out of 100 for driver workload balance`;

    const result = await callOpenRouter(prompt);
    res.json(result);
  } catch (err) {
    console.error('Schedule optimizer error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
