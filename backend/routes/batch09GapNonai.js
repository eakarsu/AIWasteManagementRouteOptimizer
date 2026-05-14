// // === Batch 09 Gaps & Frontend Mounts ===
// Auto-generated gap-nonai endpoints for AIWasteManagementRouteOptimizer.
// Calls OpenRouter via native fetch (no SDK); lazily creates gap_features table.
const express = require('express');
const router = express.Router();

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function runAI(system, user) {
  if (!process.env.OPENROUTER_API_KEY) {
    const e = new Error('OPENROUTER_API_KEY missing'); e.statusCode = 503; throw e;
  }
  const r = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
    body: JSON.stringify({ model: OPENROUTER_MODEL, messages: [
      { role: 'system', content: system }, { role: 'user', content: user }
    ], max_tokens: 1500, temperature: 0.4 })
  });
  if (!r.ok) { const e = new Error(`AI ${r.status}`); e.statusCode = 502; throw e; }
  const data = await r.json();
  const content = data?.choices?.[0]?.message?.content || '';
  let parsed = null;
  try { const m = content.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); } catch {}
  return { raw: content, parsed, model: data?.model };
}

let _persistInit = false;
async function persist(feature, input, output) {
  // Lazy gap_features table — best-effort, swallow errors so AI still works.
  try {
    const { PrismaClient } = require('@prisma/client');
    const p = new PrismaClient();
    if (!_persistInit) {
      await p.$executeRawUnsafe('CREATE TABLE IF NOT EXISTS gap_features (id SERIAL PRIMARY KEY, feature TEXT, input JSONB, output JSONB, created_at TIMESTAMPTZ DEFAULT NOW())');
      _persistInit = true;
    }
    await p.$executeRawUnsafe('INSERT INTO gap_features(feature, input, output) VALUES ($1, $2::jsonb, $3::jsonb)', feature, JSON.stringify(input || {}), JSON.stringify(output || {}));
  } catch { /* swallow */ }
}

// POST /api/gap-nonai-aiwastemanagementrouteoptimizer/customerresident-portal-for-service-requests
// Customer/resident portal for service requests
router.post('/customerresident-portal-for-service-requests', async (req, res) => {
  try {
    const ai = await runAI('You are an expert assistant. Reply concisely in JSON.',
      `Feature: Customer/resident portal for service requests\nContext: ${JSON.stringify(req.body || {})}\nReturn JSON {"summary":"","key_points":[""],"recommendations":[""]}`);
    await persist('customerresident-portal-for-service-requests', req.body, ai);
    res.json({ feature: 'customerresident-portal-for-service-requests', title: 'Customer/resident portal for service requests', result: ai });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'error' });
  }
});

// POST /api/gap-nonai-aiwastemanagementrouteoptimizer/billinginvoicing-for-commercial-accounts
// Billing/invoicing for commercial accounts
router.post('/billinginvoicing-for-commercial-accounts', async (req, res) => {
  try {
    const ai = await runAI('You are an expert assistant. Reply concisely in JSON.',
      `Feature: Billing/invoicing for commercial accounts\nContext: ${JSON.stringify(req.body || {})}\nReturn JSON {"summary":"","key_points":[""],"recommendations":[""]}`);
    await persist('billinginvoicing-for-commercial-accounts', req.body, ai);
    res.json({ feature: 'billinginvoicing-for-commercial-accounts', title: 'Billing/invoicing for commercial accounts', result: ai });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'error' });
  }
});

// POST /api/gap-nonai-aiwastemanagementrouteoptimizer/complaint-and-missed-pickup-ticketing
// Complaint and missed-pickup ticketing
router.post('/complaint-and-missed-pickup-ticketing', async (req, res) => {
  try {
    const ai = await runAI('You are an expert assistant. Reply concisely in JSON.',
      `Feature: Complaint and missed-pickup ticketing\nContext: ${JSON.stringify(req.body || {})}\nReturn JSON {"summary":"","key_points":[""],"recommendations":[""]}`);
    await persist('complaint-and-missed-pickup-ticketing', req.body, ai);
    res.json({ feature: 'complaint-and-missed-pickup-ticketing', title: 'Complaint and missed-pickup ticketing', result: ai });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'error' });
  }
});

// POST /api/gap-nonai-aiwastemanagementrouteoptimizer/real-time-gps-tracking-dashboard-with-live-etas
// Real-time GPS tracking dashboard with live ETAs
router.post('/real-time-gps-tracking-dashboard-with-live-etas', async (req, res) => {
  try {
    const ai = await runAI('You are an expert assistant. Reply concisely in JSON.',
      `Feature: Real-time GPS tracking dashboard with live ETAs\nContext: ${JSON.stringify(req.body || {})}\nReturn JSON {"summary":"","key_points":[""],"recommendations":[""]}`);
    await persist('real-time-gps-tracking-dashboard-with-live-etas', req.body, ai);
    res.json({ feature: 'real-time-gps-tracking-dashboard-with-live-etas', title: 'Real-time GPS tracking dashboard with live ETAs', result: ai });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'error' });
  }
});

// POST /api/gap-nonai-aiwastemanagementrouteoptimizer/hazardous-waste-manifest-tracking
// Hazardous waste manifest tracking
router.post('/hazardous-waste-manifest-tracking', async (req, res) => {
  try {
    const ai = await runAI('You are an expert assistant. Reply concisely in JSON.',
      `Feature: Hazardous waste manifest tracking\nContext: ${JSON.stringify(req.body || {})}\nReturn JSON {"summary":"","key_points":[""],"recommendations":[""]}`);
    await persist('hazardous-waste-manifest-tracking', req.body, ai);
    res.json({ feature: 'hazardous-waste-manifest-tracking', title: 'Hazardous waste manifest tracking', result: ai });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'error' });
  }
});

// POST /api/gap-nonai-aiwastemanagementrouteoptimizer/driver-mobile-app-endpoints
// Driver mobile app endpoints
router.post('/driver-mobile-app-endpoints', async (req, res) => {
  try {
    const ai = await runAI('You are an expert assistant. Reply concisely in JSON.',
      `Feature: Driver mobile app endpoints\nContext: ${JSON.stringify(req.body || {})}\nReturn JSON {"summary":"","key_points":[""],"recommendations":[""]}`);
    await persist('driver-mobile-app-endpoints', req.body, ai);
    res.json({ feature: 'driver-mobile-app-endpoints', title: 'Driver mobile app endpoints', result: ai });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'error' });
  }
});

module.exports = router;
