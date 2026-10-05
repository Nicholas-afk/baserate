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
    return {version:1,purpose:'Fictional screening practice; not a validated learning assessment',storage:'This export was created on request. The app stores no learner data.',attempts:answers.map(answer=>{
      const item=cases.find(c=>c.id===answer.caseId),result=gradePrediction(answer.caseId,answer.prediction);
      return {caseId:item.id,settings:{...item.settings},prediction:answer.prediction,actual:result.actual,absoluteErrorPercentagePoints:result.error,denominator:['positives','cases','population'].includes(answer.denominator)?answer.denominator:null};
    })};
  }
  root.BaseRateLearning={cases,gradePrediction,notebook};
  if(typeof module!=='undefined')module.exports=root.BaseRateLearning;
})(typeof window!=='undefined'?window:globalThis);
