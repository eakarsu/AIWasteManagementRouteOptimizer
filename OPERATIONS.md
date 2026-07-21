# Waste Management Route Optimizer operations

## Supported boundary

The governed path covers service areas, vehicles/bins/depots, timestamped fill and operational events, route jobs, capacity/driver-hours/restricted-road/disposal-window constraints, independent route and safety review, dispatch receipts, outcomes, and manual recovery. Telemetry, ERP/WMS/TMS, SCADA, GIS/device, weather, maintenance, notification, and municipal work-order names are typed contracts—not claims that live systems are connected.

No recommendation autonomously dispatches a vehicle or overrides safety and legal constraints. Generated routes are disabled by default and cannot be enabled in production.

## Deploy and run

Install `backend/` and `frontend/` dependencies explicitly. Configure `.env` from `.env.example` with `DATABASE_URL`, unique `GOVERNANCE_TENANT_ID`, and a random `JWT_SECRET` of at least 32 characters. Use secret-manager references for provider credentials.

Run `./start.sh check`; after SQL review and backup run `ALLOW_SCHEMA_MIGRATION=1 ./start.sh migrate`; then run `./start.sh start`. Startup never creates or seeds a database and stops only owned child processes.

## Workflow and recovery

Create a subject-scoped route job at `/api/governance` with provenance and `Idempotency-Key`, submit it, and obtain a different authorized reviewer’s decision. Connector checkpoints and leased outbox delivery make replay safe. On stale/duplicate bin events, capacity conflict, restricted-road mismatch, driver-hours violation, vehicle outage, delayed receipt, or missed collection, stop dispatch, reconcile the source and resume the same idempotent job or use the documented manual route process.

Historical fixtures measure route error, violations, latency, missed events, and realized outcomes. Run `node --test backend/governance/tests/*.test.js` and `bash -n start.sh`. Destructive fixtures require explicit opt-in and an environment-supplied password on a disposable database.
