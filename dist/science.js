(function(root){
  'use strict';
  function calculate(prevalence,sensitivity,specificity,population=1000){
    for(const [value,label] of [[prevalence,'prevalence'],[sensitivity,'sensitivity'],[specificity,'specificity']]) if(!Number.isFinite(value)||value<0||value>100) throw new RangeError(label+' must be a percentage from 0 to 100.');
    if(!Number.isFinite(population)||population<=0)throw new RangeError('Population must be positive.');
    const p=prevalence/100,se=sensitivity/100,sp=specificity/100;
    const tp=population*p*se,fn=population*p*(1-se),fp=population*(1-p)*(1-sp),tn=population*(1-p)*sp;
    return {tp,fp,fn,tn,positive:tp+fp,negative:tn+fn,ppv:tp+fp>0?tp/(tp+fp)*100:null,npv:tn+fn>0?tn/(tn+fn)*100:null};
  }
  function roundedCounts(counts,total=1000){
    const names=['tp','fn','fp','tn'],out={},remainders=[];
    let used=0;
    for(const name of names){out[name]=Math.floor(counts[name]);used+=out[name];remainders.push([name,counts[name]-out[name]]);}
    remainders.sort((a,b)=>b[1]-a[1]);
    for(let i=0;i<total-used;i++)out[remainders[i%names.length][0]]++;
    return out;
  }
  function fromSettings(settings,population=1000){
    if(!settings||typeof settings!=='object')throw new RangeError('An experiment needs three fictional percentage settings.');
    return calculate(settings.prevalence,settings.sensitivity,settings.specificity,population);
  }
  function compare(settingsA,settingsB){
    const a=fromSettings(settingsA),b=fromSettings(settingsB);
    return {a,b,delta:{tp:b.tp-a.tp,fp:b.fp-a.fp,fn:b.fn-a.fn,tn:b.tn-a.tn,ppv:a.ppv===null||b.ppv===null?null:b.ppv-a.ppv}};
  }
  function prevalenceCurve(sensitivity,specificity){
    return Array.from({length:101},(_,i)=>({prevalence:i/2,ppv:calculate(i/2,sensitivity,specificity).ppv}));
  }
  // These are conditional rates AMONG first-positive people. Independence is
  // only one possible way to choose them; repeated results need different rates.
  function sequential(settings,conditionalDetection,conditionalFalsePositive,population=1000){
    const first=fromSettings(settings,population);
    for(const value of [conditionalDetection,conditionalFalsePositive])if(!Number.isFinite(value)||value<0||value>100)throw new RangeError('Conditional rates must be percentages from 0 to 100.');
    const tp=first.tp*conditionalDetection/100,fp=first.fp*conditionalFalsePositive/100;
    return {first,tp,fp,positive:tp+fp,ppv:tp+fp>0?tp/(tp+fp)*100:null,rejectedTrue:first.tp-tp,rejectedFalse:first.fp-fp};
  }
  function formatNumber(value){
    if(!Number.isFinite(value))throw new RangeError('Only finite values can be displayed.');
    const absolute=Math.abs(value);
    if(absolute>0&&absolute<1e-7)return value.toExponential(2);
    const digits=absolute>0&&absolute<1?Math.min(7,Math.ceil(-Math.log10(absolute))+1):1;
    return value.toLocaleString('en-US',{maximumFractionDigits:digits});
  }
  root.BaseRateScience={calculate,roundedCounts,compare,prevalenceCurve,sequential,formatNumber};
  if(typeof module!=='undefined')module.exports=root.BaseRateScience;
})(typeof window!=='undefined'?window:globalThis);
