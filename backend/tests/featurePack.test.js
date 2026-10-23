// No-provider guard: keys removed before importing the app pack; pack never calls a provider.
delete process.env.OPENROUTER_API_KEY; delete process.env.OPENAI_API_KEY;
import test from 'node:test'; import assert from 'node:assert/strict'; import express from 'express';
import * as pack from '../routes/featurePack.js';
const auth=(req,res,next)=>{ req.user={id:'user-1',tenantId:'t1',role:'operator',subjectIds:['account:user-1']}; next(); };
const J={ 'Content-Type':'application/json' };
test('tasks auth, CRUD, search/filter, export, AI fallback', async ()=>{
  pack._reset(); const app=express(); app.use(express.json()); app.use('/api/feature-pack', pack.createRouter(auth)); const s=app.listen(0); await new Promise(r=>s.once('listening',r)); const base='http://127.0.0.1:'+s.address().port+'/api/feature-pack';
  let r=await fetch(base+'/tasks',{method:'POST',headers:J,body:JSON.stringify({title:'Alpha bin',priority:'high',estimateHours:0,flagged:false})}); assert.equal(r.status,201); const a=await r.json(); assert.equal(a.estimateHours,0); assert.equal(a.flagged,false);
  r=await fetch(base+'/tasks',{method:'POST',headers:J,body:JSON.stringify({title:'Beta route',status:'done'})}); assert.equal(r.status,201);
  r=await fetch(base+'/tasks?search=alpha'); let body=await r.json(); assert.equal(body.total,1);
  r=await fetch(base+'/tasks/'+a.id,{method:'PUT',headers:J,body:JSON.stringify({status:'done',estimateHours:0,flagged:false,description:''})}); const upd=await r.json(); assert.equal(upd.estimateHours,0); assert.equal(upd.flagged,false); assert.equal(upd.description,'');
  r=await fetch(base+'/tasks/export?format=csv'); assert.match(r.headers.get('content-type'),/text\/csv/); assert.match(await r.text(),/Alpha bin/);
  r=await fetch(base+'/tasks/export?format=json'); body=await r.json(); assert.equal(body.total,2);
  for(const f of ["overflow-risk","route-efficiency","collection-priority"]){ r=await fetch(base+'/ai/'+f,{method:'POST',headers:J,body:'{}'}); body=await r.json(); assert.equal(body.aiGenerated,false); assert.equal(body.source,'deterministic-fallback'); assert.ok(body.sections.length>0); }
  s.close();
});
test('unauthenticated request is rejected', async ()=>{ pack._reset(); const app=express(); app.use(express.json()); app.use('/api/feature-pack', pack.createRouter()); const s=app.listen(0); await new Promise(r=>s.once('listening',r)); const r=await fetch('http://127.0.0.1:'+s.address().port+'/api/feature-pack/tasks'); assert.equal(r.status,401); s.close(); });
