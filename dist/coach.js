(function(root){
  'use strict';
  const science=typeof module!=='undefined'?require('./science.js'):root.BaseRateScience;
  const content={
    unavailable:{title:'The AI model did not load.',focus:'Model unavailable',body:'The AI model is unavailable, so the coach cannot interpret your wording. Your explanation has not been judged. The mathematical simulator, comparisons and practice remain available.',question:'Reload to try loading the model, or use the three-case lesson to inspect the arithmetic.',source:'bmj'},
    balanced:{title:'Review the positive group.',focus:'Suggested angle: positives',body:'Compare true positives with everyone who tests positive. This review topic is a model suggestion, not confirmation that your explanation or arithmetic is correct.',question:'Which group belongs in the denominator?',source:'bmj'},
    certainty:{title:'Review what the experiment can establish.',focus:'Suggested angle: uncertainty',body:'False positives and missed cases can occur. A fictional model cannot establish certainty about a real person. This topic may fit your wording even if you were rejecting certainty.',question:'What can these invented rates tell us about a real personal result?',source:'nci'},
    sensitivity:{title:'Review the two starting groups.',focus:'Suggested angle: test rates',body:'Sensitivity starts with people who have the condition. Predictive value starts with people who test positive. This topic may fit both a correct distinction and a misconception; the model cannot tell them apart reliably.',question:'For sensitivity, which group is the denominator?',source:'bmj'},
    base_rate:{title:'Review the starting population.',focus:'Suggested angle: prevalence',body:'A large group without the condition can produce many false positives. Compare the same test across populations; this suggestion does not mean you ignored prevalence.',question:'Keep the test fixed. Does PPV change between 1% and 20% prevalence?',source:'bmj'},
    dismissal:{title:'Review benefits and harms.',focus:'Suggested angle: evidence',body:'Errors matter, but these counts alone cannot establish a real screening program’s benefits, harms or suitability. The model may also suggest this topic when your explanation already makes that point.',question:'What evidence is needed beyond these three rates?',source:'nci'},
    uncertain:{title:'Choose an angle to check.',focus:'No reliable topic suggestion',body:'The model has too little evidence to suggest a topic reliably. Choose a review focus below. This is not a judgement of your understanding.',question:'Use a factual self-check, then revise your explanation if useful.',source:'bmj'},
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
  function feedback(result,counts){const item=content[result.label]||content.uncertain,format=root.BaseRateScience?.formatNumber||String;return {...item,provisional:!['personal','empty','unavailable'].includes(result.label),source:sources[item.source],counts:`In the current fictional experiment: ${format(counts.tp)} true positives and ${format(counts.fp)} false positives; ${counts.ppv===null?'the positive predictive value is undefined':format(counts.ppv)+'% of positive results are expected to be true positives'}.`};}
  function exercise(topic,settings){
    if(!settings)throw new RangeError('Fictional settings are required.');
    const r=science.calculate(settings.prevalence,settings.sensitivity,settings.specificity),fmt=science.formatNumber;
    const groups=[['positives','Everyone who tests positive'],['cases','Everyone with the condition'],['population','All 1,000 people']];
    if(topic==='positives')return {question:'For true positives among positive results, which group is the denominator?',choices:groups,correctChoice:'positives',body:`The positive group contains ${fmt(r.tp)} true + ${fmt(r.fp)} false positives = ${fmt(r.positive)}. ${r.ppv===null?'It is empty, so PPV is undefined.':`${fmt(r.tp)} ÷ ${fmt(r.positive)} × 100 = ${fmt(r.ppv)}%.`} The condition group is the denominator for sensitivity.`};
    if(topic==='detection'){const cases=r.tp+r.fn;return {question:'For sensitivity, which group is the denominator?',choices:groups,correctChoice:'cases',body:`Start with all ${fmt(cases)} people with the condition: ${fmt(r.tp)} detected + ${fmt(r.fn)} missed. ${cases===0?'The group is empty, so this observed proportion is undefined.':`${fmt(r.tp)} ÷ ${fmt(cases)} × 100 = ${fmt(settings.sensitivity)}%.`} This is a different group from the ${fmt(r.positive)} positive results.`};}
    if(topic==='prevalence'){
      const a=science.calculate(1,settings.sensitivity,settings.specificity),b=science.calculate(20,settings.sensitivity,settings.specificity),pct=n=>n===null?'undefined':fmt(n)+'%';
      const correctChoice=a.ppv===null||b.ppv===null?'undefined':Math.abs(b.ppv-a.ppv)<1e-10?'same':b.ppv>a.ppv?'higher':'lower';
      return {question:'With this test fixed, how does PPV at 20% prevalence compare with PPV at 1%?',choices:[['higher','Higher'],['lower','Lower'],['same','The same'],['undefined','No defined comparison']],correctChoice,body:`The same ${fmt(settings.sensitivity)}% detection and ${fmt(settings.specificity)}% clearance give PPV ${pct(a.ppv)} at 1% and ${pct(b.ppv)} at 20%. ${correctChoice==='same'?'For these settings the proportions are equal; higher prevalence does not always change PPV.':correctChoice==='undefined'?'A missing positive group prevents a defined comparison.':'The test is unchanged; the starting groups change the positive denominator.'}`};
    }
    if(topic==='uncertainty')return {question:'Can these invented rates establish a real person’s diagnosis?',choices:[['context','No; real results need clinical context'],['diagnosis','Yes; this simulated percentage establishes it']],correctChoice:'context',body:'Even 100% in a fictional experiment is conditional on its invented assumptions. This simulator cannot interpret a real person’s result or establish a diagnosis.'};
    if(topic==='evidence')return {question:'What is needed to judge a real screening program’s overall value?',choices:[['benefits','Evidence about benefits, harms and the population'],['errors','Only whether any false result occurs']],correctChoice:'benefits',body:'The counts demonstrate errors and uncertainty. Benefits, harms, downstream actions and the population need separate evidence. An error alone does not establish that every program is worthless.'};
    throw new RangeError('Unknown review focus.');
  }
  function checkAnswer(topic,choice,settings){
    const item=exercise(topic,settings);
    if(!item.choices.some(([value])=>value===choice))throw new RangeError('Choose one of the displayed answers.');
    return {correct:choice===item.correctChoice,body:item.body};
  }
  root.BaseRateCoach={classify,feedback,tokenize,exercise,checkAnswer};
  if(typeof module!=='undefined')module.exports=root.BaseRateCoach;
})(typeof window!=='undefined'?window:globalThis);
