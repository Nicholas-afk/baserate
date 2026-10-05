const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const science=require('../dist/science.js');
const coach=require('../dist/coach.js');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'dist/model.js'),'utf8'),context);
const model=context.window.BaseRateModel;
function close(a,b){assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);}
const rare=science.calculate(1,90,95);
close(rare.tp,9);close(rare.fp,49.5);close(rare.fn,1);close(rare.tn,940.5);close(rare.ppv,100*9/58.5);
close(science.calculate(20,90,95).ppv,100*180/220);
close(science.calculate(1,90,99).ppv,100*9/18.9);
assert.equal(science.calculate(0,90,100).ppv,null);
assert.equal(science.calculate(100,100,0).npv,null);
assert.equal(science.calculate(1,100,100).ppv,100);
assert.throws(()=>science.calculate(NaN,90,95),RangeError);
assert.throws(()=>science.calculate(101,90,95),RangeError);
assert.throws(()=>science.calculate(1,90,95,0),RangeError);
let combinations=0;
for(const p of [0,.1,1,7.3,20,50,99.9,100])for(const se of [0,1,10,63,90,99.9,100])for(const sp of [0,1,50,95,99.9,100]){
  const r=science.calculate(p,se,sp),rounded=science.roundedCounts(r);
  close(r.tp+r.fp+r.fn+r.tn,1000);
  assert.equal(Object.values(rounded).reduce((a,b)=>a+b,0),1000);
  for(const key of ['tp','fn','fp','tn']){assert.ok(r[key]>=0);assert.ok(Math.abs(rounded[key]-r[key])<=1.0000001);}
  for(const value of [r.ppv,r.npv])assert.ok(value===null||(value>=0&&value<=100));
  close(r.ppv??0,science.calculate(p,se,sp,10000).ppv??0);
  combinations++;
}
assert.equal(coach.classify('',model).label,'empty');
assert.equal(coach.classify('My test result came back positive, do I have cancer?',model).label,'personal');
assert.equal(coach.classify('你好世界',model).label,'uncertain');
assert.equal(coach.classify('banana bicycle orchestra',model).label,'uncertain');
assert.throws(()=>coach.classify('x'.repeat(1801),model),RangeError);
assert.equal(coach.classify('A positive result does not prove the condition because false positives happen.',model).label,'balanced');
assert.equal(coach.classify('A positive result proves you have the condition.',model).label,'certainty');
const expected=JSON.parse(fs.readFileSync(path.join(root,'model/evaluation.json'),'utf8'));
for(const row of expected.predictions){const actual=coach.classify(row.text,model);assert.equal(actual.rawLabel,row.predicted);assert.equal(actual.abstained,row.abstained);}
const dataset=JSON.parse(fs.readFileSync(path.join(root,'model/dataset.json'),'utf8'));
const train=new Set(Object.values(dataset.train).flat());
for(const text of Object.values(dataset.holdout).flat())assert.ok(!train.has(text),'Holdout sentence occurs in training');
const sourceFiles=['index.html','style.css','science.js','model.js','coach.js','app.js'];
for(const file of sourceFiles)assert.ok(fs.statSync(path.join(root,'dist',file)).size>0);
console.log(JSON.stringify({result:'PASS',scienceCombinations:combinations,modelParityCases:expected.predictions.length,checks:['Bayes examples','edge denominators','count conservation','rounding','invalid inputs','scope guard','out of vocabulary abstention','negation example','train/holdout disjointness','browser/Python model parity']}));
