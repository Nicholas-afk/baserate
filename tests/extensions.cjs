const assert=require('node:assert/strict');
const science=require('../dist/science.js');
const rare={prevalence:1,sensitivity:90,specificity:95};
const common={...rare,prevalence:20};
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const pair=science.compare(rare,common);
close(pair.a.ppv,9/58.5*100);
close(pair.b.ppv,180/220*100);
close(pair.delta.ppv,180/220*100-9/58.5*100);
close(pair.delta.fp,-9.5);close(pair.delta.tp,171);
assert.deepEqual(rare,{prevalence:1,sensitivity:90,specificity:95});
assert.equal(science.compare({prevalence:0,sensitivity:90,specificity:100},rare).delta.ppv,null);
let curvePoints=0;
for(const se of [0,1,50,90,100])for(const sp of [0,1,50,95,100]){
  const curve=science.prevalenceCurve(se,sp);
  assert.equal(curve.length,101);assert.equal(curve[0].prevalence,0);assert.equal(curve[100].prevalence,50);
  let previous=0;
  for(const point of curve){
    close(point.prevalence*2,Math.round(point.prevalence*2));
    assert.equal(point.ppv,science.calculate(point.prevalence,se,sp).ppv);
    if(point.ppv!==null){assert.ok(point.ppv+1e-8>=previous);previous=point.ppv;}
    curvePoints++;
  }
}
const independent=science.sequential(rare,90,5);
close(independent.tp,8.1);close(independent.fp,2.475);
close(independent.ppv,8.1/(8.1+2.475)*100);
close(independent.rejectedTrue,.9);close(independent.rejectedFalse,47.025);
const repeated=science.sequential(rare,100,100);
close(repeated.ppv,science.calculate(1,90,95).ppv);
close(repeated.tp,9);close(repeated.fp,49.5);
assert.equal(science.sequential(rare,0,0).ppv,null);
assert.equal(science.sequential(rare,100,0).ppv,100);
let sequenceCases=0;
for(const p of [0,.1,1,20,100])for(const se of [0,90,100])for(const sp of [0,95,100])for(const d of [0,90,100])for(const f of [0,5,100]){
  const r=science.sequential({prevalence:p,sensitivity:se,specificity:sp},d,f);
  close(r.tp+r.rejectedTrue,r.first.tp);close(r.fp+r.rejectedFalse,r.first.fp);
  assert.ok(r.tp>=0&&r.fp>=0&&r.rejectedTrue>=-1e-10&&r.rejectedFalse>=-1e-10);
  assert.ok(r.ppv===null||(r.ppv>=0&&r.ppv<=100));sequenceCases++;
}
for(const bad of [NaN,Infinity,-1,101]){
  assert.throws(()=>science.prevalenceCurve(bad,90),RangeError);
  assert.throws(()=>science.sequential(rare,bad,5),RangeError);
  assert.throws(()=>science.sequential(rare,90,bad),RangeError);
  assert.throws(()=>science.compare({...rare,prevalence:bad},common),RangeError);
}
console.log(JSON.stringify({result:'PASS',curvePoints,sequenceCases,checks:['comparison units','immutable inputs','monotonic prevalence curve','conditional repeated tests','undefined proportions','conservation','invalid rates']}));
