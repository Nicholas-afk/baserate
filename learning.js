(function(root){
  'use strict';
  const science=typeof module!=='undefined'?require('./science.js'):root.BaseRateScience;
  const cases=Object.freeze([
    {id:'rare',title:'The rare-condition puzzle',settings:{prevalence:1,sensitivity:90,specificity:95},prompt:'The test detects 90% of cases. What percentage of positive results do you expect to be true positives?',explanation:'The group without the condition is much larger. Five percent of that group produces 49.5 false positives, beside 9 true positives. Sensitivity starts with cases; predictive value starts with positives.'},
    {id:'common',title:'Same test, different population',settings:{prevalence:20,sensitivity:90,specificity:95},prompt:'Only prevalence has changed, from 1% to 20%. Predict the percentage of positive results that are true positives.',explanation:'The test has not improved. The starting population has changed: 180 true positives and 40 false positives. A percentage describing the test alone does not tell the whole story.'},
    {id:'specific',title:'Fewer false alarms',settings:{prevalence:1,sensitivity:90,specificity:99},prompt:'Prevalence is back to 1%, but specificity is now 99%. Predict the percentage of positive results that are true positives.',explanation:'The smaller false-positive rate gives 9.9 false positives, alongside the same 9 true positives. That raises predictive value, but still does not make a positive result a certainty.'}
  ].map(item=>Object.freeze({...item,settings:Object.freeze(item.settings)})));
  function gradePrediction(caseId,guess){
    const item=cases.find(c=>c.id===caseId);
    if(!item)throw new RangeError('Unknown learning case.');
    if(!Number.isFinite(guess)||guess<0||guess>100)throw new RangeError('Enter a percentage from 0 to 100.');
    const counts=science.calculate(item.settings.prevalence,item.settings.sensitivity,item.settings.specificity);
    const error=Math.abs(counts.ppv-guess);
    return {actual:counts.ppv,error,close:error<=2,counts};
  }
  function notebook(answers){
    return {version:2,purpose:'Fictional screening practice; not a validated learning assessment',storage:'This export was created on request. The app stores no learner data.',attempts:answers.map(answer=>{
      const item=cases.find(c=>c.id===answer.caseId),result=gradePrediction(answer.caseId,answer.prediction);
      const valid=value=>['positives','cases','population'].includes(value),denominator=valid(answer.denominator)?answer.denominator:null;
      return {caseId:item.id,settings:{...item.settings},prediction:answer.prediction,actual:result.actual,absoluteErrorPercentagePoints:result.error,denominator,firstDenominator:valid(answer.firstDenominator)?answer.firstDenominator:denominator,denominatorAttempts:Number.isSafeInteger(answer.denominatorAttempts)&&answer.denominatorAttempts>=0?answer.denominatorAttempts:denominator?1:0};
    })};
  }
  function checkDenominator(caseId,choice){
    if(!['positives','cases','population'].includes(choice))throw new RangeError('Choose a displayed denominator.');
    const r=gradePrediction(caseId,0).counts,fmt=science.formatNumber,cases=r.tp+r.fn;
    if(choice==='positives')return {correct:true,body:`Yes. Start with ${fmt(r.positive)} positive results: ${fmt(r.tp)} true + ${fmt(r.fp)} false. ${fmt(r.tp)} ÷ ${fmt(r.positive)} × 100 = ${fmt(r.ppv)}%.`};
    if(choice==='cases')return {correct:false,body:`That group contains ${fmt(cases)} people with the condition. ${fmt(r.tp)} ÷ ${fmt(cases)} × 100 = ${fmt(r.tp/cases*100)}% is sensitivity. This question starts with everyone who tested positive. Try that group before continuing.`};
    return {correct:false,body:`${fmt(r.tp)} ÷ 1,000 × 100 = ${fmt(r.tp/10)}% counts true positives in the whole population. This question asks about the smaller positive group. Try that group before continuing.`};
  }
  root.BaseRateLearning={cases,gradePrediction,notebook,checkDenominator};
  if(typeof module!=='undefined')module.exports=root.BaseRateLearning;
})(typeof window!=='undefined'?window:globalThis);
