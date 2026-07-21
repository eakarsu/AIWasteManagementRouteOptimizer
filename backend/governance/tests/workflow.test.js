import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate } from '../domain.js';

function fixture() {
  return {
  serviceArea:{id:'area1',tenantId:'t1',sitePermissionVersion:'site1',safetyLimitVersion:'safe1',routeConstraintVersion:'rc1',retentionDays:30},
  assets:[{id:'truck1',kind:'vehicle',version:'v1',status:'available',capacityVersion:'cap1',locationVersion:'loc1',provenanceRef:'fleet:1'}],
  events:[{id:'e1',assetId:'truck1',observedAt:'2026-07-18T00:00:00Z',receivedAt:'2026-07-18T00:00:01Z',sourceVersion:'s1',unit:'percent',value:75,duplicate:false,stale:false}],
  routeJob:{id:'r1',ownerId:'owner',serviceDate:'2026-07-19',status:'approved'},
  decision:{id:'d1',jobId:'r1',modelVersion:'m1',constraintVersion:'rc1',eventIds:['e1'],uncertaintyNote:'traffic may change',autonomousDispatch:false,operatorApproved:true,approvedBy:'reviewer',capacityPassed:true,driverHoursPassed:true,restrictedRoadsPassed:true,disposalWindowsPassed:true},
  execution:{status:'receipt_recorded',feedbackAt:'2026-07-18T00:00:02Z',receiptRef:'fleet:1'},
  validation:{datasetVersion:'ds1',forecastError:0.04,latencyMs:40,missedEvents:0,realizedOutcomeRecorded:true,constraintViolations:0}
};
}

test('accepts governed waste route', () => {
  const result = evaluate(fixture(), { tenant: 't1', actor: 'owner' });
  assert.deepEqual(result.errors, []);
});

test('blocks unsafe or ungoverned waste route', () => {
  const input = fixture();
  input.decision.autonomousDispatch = true;
  assert.ok(evaluate(input, { tenant: 't1', actor: 'owner' }).errors.length > 0);
  assert.ok(evaluate(fixture(), { tenant: 'other', actor: 'owner' }).errors.length > 0);
});
