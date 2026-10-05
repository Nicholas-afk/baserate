(function(root){
  'use strict';
  const content={
    unavailable:{title:'The AI model did not load.',focus:'Model unavailable',body:'The AI model is unavailable, so the coach cannot interpret your wording. Your explanation has not been judged. The mathematical simulator, comparisons and practice remain available.',question:'Reload to try loading the model, or use the three-case lesson to inspect the arithmetic.',source:'bmj'},
    balanced:{title:'You are connecting the pieces.',focus:'Prevalence + uncertainty',body:'Your wording resembles the model’s examples of contextual reasoning. Check that your explanation connects false positives to the size of the group without the condition.',question:'What changes if the condition becomes more common but the test stays the same?',source:'bmj'},
    certainty:{title:'Leave room for uncertainty.',focus:'A result is not a guarantee',body:'The model detected wording that may treat a screening result as certainty. Positive results can include false positives; negative results can include missed cases. If you were rejecting certainty, the model may have misread your wording.',question:'In this experiment, which people show why a positive or negative result is not a guarantee?',source:'nci'},
    sensitivity:{title:'Check which group you are counting.',focus:'Sensitivity ≠ predictive value',body:'The model detected wording about sensitivity or specificity. Sensitivity starts with people who have the condition. Positive predictive value starts with people who test positive. Those denominators are different. If you already made that distinction, the model may have misread your wording.',question:'To interpret a positive result, should your denominator be all cases or all positive results?',source:'bmj'},
    base_rate:{title:'Give prevalence a place in the story.',focus:'The starting population matters',body:'The model detected wording that may leave out how common the condition is. A large group without the condition can produce many false positives, even at a low false-positive rate.',question:'Keep the test settings fixed and change prevalence from 1% to 20%. What changes among positives?',source:'bmj'},
    dismissal:{title:'Errors are part of the assessment.',focus:'Benefit and harm need evidence',body:'The model detected wording that may dismiss all screening because errors occur. False results matter, but this simulator alone cannot establish a real screening test’s overall benefits, harms, or suitability.',question:'What evidence would you need beyond these counts to judge a real screening program?',source:'nci'},
    uncertain:{title:'Let’s use the counts as our anchor.',focus:'The model is unsure',body:'Your explanation does not match the model’s limited examples clearly enough. Try stating how prevalence and false positives affect the group of positive results.',question:'Complete this: “Some people test positive without the condition, so…”',source:'bmj'},
    personal:{title:'Keep this experiment fictional.',focus:'Personal results need clinical context',body:'This lab cannot interpret your personal symptoms, test result, or health risk. Its numbers describe an invented population. Discuss personal results with an appropriate healthcare professional.',question:'For this exercise, explain the fictional population shown above instead.',source:'nci'},
    empty:{title:'Start with one or two sentences.',focus:'Your reasoning matters',body:'Write an explanation in your own words, then the coach can look for a reasoning pattern.',question:'Why might a positive result include a person without the condition?',source:'bmj'}
  };
  const sources={bmj:{title:'Gigerenzer · What are natural frequencies? (BMJ, 2011)',url:'https://www.bmj.com/content/343/bmj.d6386'},nci:{title:'National Cancer Institute · Cancer Screening Overview',url:'https://www.cancer.gov/about-cancer/screening/patient-screening-overview-pdq'}};
  const indexes=new WeakMap();
  function tokenize(text,model){const stop=new Set(model.stopWords),words=(text.toLowerCase().replace(/’/g,"'").match(/[a-z]+/g)||[]);return [...words.filter(w=>!stop.has(w)),...words.slice(0,-1).map((w,i)=>w+'_'+words[i+1])];}
  function classify(text,model){
    if(typeof text!=='string'||text.length>1800)throw new RangeError('Explanation must be text of at most 1800 characters.');
    if(!text.trim())return {label:'empty',method:'no inference',patterns:[]};
    if(/(?:\bmy\s+(?:test|result|symptom|diagnosis|blood|scan)|\bi\s+(?:have|had|got)\s+(?:a\s+)?(?:positive|negative|symptoms|cancer|disease|pain)|\b(?:diagnose me|should i (?:get|take|stop|start)|do i have|am i (?:sick|ill)|my chance of))/i.test(text))return {label:'personal',method:'scope guard',patterns:[]};
    if(!model)return {label:'unavailable',method:'model unavailable',patterns:[]};
    if(!indexes.has(model))indexes.set(model,new Map(model.vocabulary.map((v,i)=>[v,i])));
    const index=indexes.get(model),feats=tokenize(text,model),known=feats.filter(w=>index.has(w));
    const scores=model.labels.map(label=>({label,score:model.logPriors[label]+known.reduce((sum,w)=>sum+model.weights[label][index.get(w)],0)}));
    const max=Math.max(...scores.map(s=>s.score)),den=scores.reduce((sum,s)=>sum+Math.exp(s.score-max),0);
    for(const s of scores)s.vote=Math.exp(s.score-max)/den;
    scores.sort((a,b)=>b.vote-a.vote);
    const coverage=known.length/Math.max(1,feats.length),a=model.abstention;
    const abstain=known.length<a.minKnownFeatures||coverage<a.minCoverage||scores[0].vote<a.minVote||scores[0].vote-scores[1].vote<a.minMargin;
    const first=scores[0],second=scores[1];
    const patterns=[...new Set(known)].map(word=>({word,diff:model.weights[first.label][index.get(word)]-model.weights[second.label][index.get(word)]})).filter(x=>x.diff>0).sort((a,b)=>b.diff-a.diff).slice(0,4).map(x=>x.word.replace(/_/g,' '));
    return {label:abstain?'uncertain':first.label,rawLabel:first.label,method:'Multinomial Naive Bayes',patterns,coverage,vote:first.vote,scores:scores.map(s=>({label:s.label,vote:s.vote})),abstained:abstain};
  }
  function feedback(result,counts){const item=content[result.label]||content.uncertain,format=root.BaseRateScience?.formatNumber||String;return {...item,source:sources[item.source],counts:`In the current fictional experiment: ${format(counts.tp)} true positives and ${format(counts.fp)} false positives; ${counts.ppv===null?'the positive predictive value is undefined':format(counts.ppv)+'% of positive results are expected to be true positives'}.`};}
  root.BaseRateCoach={classify,feedback,tokenize};
  if(typeof module!=='undefined')module.exports=root.BaseRateCoach;
})(typeof window!=='undefined'?window:globalThis);
