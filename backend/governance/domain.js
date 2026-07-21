function evaluate(input = {}, context = {}) {
  const errors = [];
  const service = input.serviceArea || {};
  const assets = input.assets || [];
  const events = input.events || [];
  const job = input.routeJob || {};
  const decision = input.decision || {};
  const execution = input.execution || {};
  const validation = input.validation || {};
  if (!service.id || !service.tenantId || service.tenantId !== context.tenant || !service.sitePermissionVersion || !service.safetyLimitVersion
      || !service.routeConstraintVersion || !service.retentionDays) errors.push('scoped waste service area required');
  const assetIds = new Set();
  for (const asset of assets) {
    if (!asset.id || assetIds.has(String(asset.id)) || !['vehicle','bin','transfer-station','landfill'].includes(asset.kind)
        || !asset.version || !asset.status || !asset.capacityVersion || !asset.locationVersion || !asset.provenanceRef) errors.push('versioned route asset invalid');
    assetIds.add(String(asset.id));
  }
  const eventIds = new Set();
  for (const event of events) {
    if (!event.id || eventIds.has(String(event.id)) || !assetIds.has(String(event.assetId)) || !event.observedAt
        || !event.receivedAt || !event.sourceVersion || !event.unit || !Number.isFinite(event.value)
        || event.duplicate || event.stale) errors.push('timestamped route event invalid');
    eventIds.add(String(event.id));
  }
  if (!job.id || !job.ownerId || job.ownerId !== context.actor || !job.serviceDate || !['planned','submitted','approved','dispatched','completed','failed','manual_recovery'].includes(job.status)) errors.push('route job state invalid');
  if (!decision.id || decision.jobId !== job.id || !decision.modelVersion || !decision.constraintVersion
      || !decision.eventIds?.every((id) => eventIds.has(String(id))) || !decision.uncertaintyNote
      || decision.autonomousDispatch || decision.operatorApproved !== true || !decision.approvedBy
      || decision.approvedBy === job.ownerId || decision.capacityPassed !== true || decision.driverHoursPassed !== true
      || decision.restrictedRoadsPassed !== true || decision.disposalWindowsPassed !== true) errors.push('independent constrained route decision required');
  if (!['queued','receipt_recorded','failed','manual_recovery'].includes(execution.status) || !execution.feedbackAt
      || (execution.status === 'receipt_recorded' && !execution.receiptRef)) errors.push('dispatch feedback or recovery invalid');
  for (const key of ['datasetVersion','forecastError','latencyMs','missedEvents','realizedOutcomeRecorded']) {
    if (validation[key] === undefined) errors.push(`validation ${key} required`);
  }
  if (validation.constraintViolations !== 0) errors.push('historical route constraint validation failed');
  return { errors, result: { routeJobId: job.id, assetCount: assets.length, disposition: errors.length ? 'revise' : 'operator-reviewed' },
    assumptions: ['No vehicle dispatch occurs without operator approval and provider receipt'],
    uncertainty: { fleetSystemsConnected: false, manualFallbackRequired: true } };
}
export { evaluate };
