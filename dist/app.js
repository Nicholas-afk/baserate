'use strict';
const $=id=>document.getElementById(id);
const settings=['prevalence','sensitivity','specificity'];
const presets={rare:[1,90,95],common:[20,90,95],specific:[1,90,99]};
let positiveOnly=false,current;
let lastExplanation=null;
function number(n){return BaseRateScience.formatNumber(n);}
function update(preserveInput=null){
  const values=settings.map(id=>Number($(id).value));
  current=BaseRateScience.calculate(...values);
  settings.forEach((id,i)=>{$(id+'-label').textContent=number(values[i])+'%';$(id).setAttribute('aria-valuetext',number(values[i])+' percent');});
  settings.forEach((id,i)=>{const input=$(id+'-number');if(id!==preserveInput)input.value=values[i];input.removeAttribute('aria-invalid');});
  $('settings-error').textContent='';
  for(const id of ['tp','fp','fn','tn'])$(id+'-count').textContent=number(current[id]);
  $('ppv').textContent=current.ppv===null?'—':number(current.ppv);
  $('result-explanation').textContent=current.ppv===null?'There are no expected positive results, so this percentage is undefined.':`About ${number(current.tp)} of ${number(current.positive)} expected positive results are true positives.`;
  $('ratio-fill').style.width=(current.ppv??0)+'%';
  $('formula').textContent=`${number(current.tp)} ÷ (${number(current.tp)} + ${number(current.fp)})`;
  $('insight').textContent=current.ppv===null?'A proportion needs a denominator. With no positive results, there is no positive group to compare.':current.fp>current.tp?'Even a capable test can produce many false positives when a condition is rare.':'As prevalence rises or false positives fall, a larger share of positive results can be true positives.';
  const counts=BaseRateScience.roundedCounts(current),fragment=document.createDocumentFragment();
  for(const key of ['tp','fn','fp','tn'])for(let i=0;i<counts[key];i++){const square=document.createElement('span');square.className='person '+key+(positiveOnly&&['fn','tn'].includes(key)?' hidden':'');square.setAttribute('aria-hidden','true');fragment.append(square);}
  $('population').replaceChildren(fragment);
  $('population').setAttribute('aria-label',`Rounded illustration of 1000 people: ${counts.tp} true positives, ${counts.fp} false positives, ${counts.fn} false negatives, ${counts.tn} true negatives. ${positiveOnly?'Negative results are dimmed.':''}`);
  if(lastExplanation!==null)showFeedback(lastExplanation);
  window.dispatchEvent(new CustomEvent('baserate:experiment',{detail:{settings:Object.fromEntries(settings.map((id,i)=>[id,values[i]])),counts:{...current}}}));
}
function setExperiment(values,preserveInput=null){
  for(const id of settings)if(!Number.isFinite(values?.[id])||values[id]<Number($(id).min)||values[id]>Number($(id).max))throw new RangeError('Fictional '+id+' is outside the available range.');
  for(const id of settings)$(id).value=values[id];
  $('scenario').value='custom';$('scenario-note').textContent='Explore your own fictional assumptions.';update(preserveInput);
}
window.BaseRateApp={getExperiment:()=>({settings:Object.fromEntries(settings.map(id=>[id,Number($(id).value)])),counts:{...current}}),setExperiment};
function preset(name){if(!presets[name])return;settings.forEach((id,i)=>$(id).value=presets[name][i]);$('scenario-note').textContent={rare:'A fictional condition affects 1 in 100 people.',common:'The same fictional test, but the condition affects 1 in 5 people.',specific:'A fictional test produces fewer false positives.'}[name];update();}
settings.forEach(id=>$(id).addEventListener('input',()=>{$('scenario').value='custom';$('scenario-note').textContent='Explore your own fictional assumptions.';update();}));
settings.forEach(id=>$(id+'-number').addEventListener('input',()=>{
  const input=$(id+'-number');
  if(!input.checkValidity()||!Number.isFinite(input.valueAsNumber)){input.setAttribute('aria-invalid','true');$('settings-error').textContent='Enter a value within the labeled range, using the available step.';return;}
  input.removeAttribute('aria-invalid');$('settings-error').textContent='';setExperiment({...BaseRateApp.getExperiment().settings,[id]:input.valueAsNumber},id);
}));
$('scenario').addEventListener('change',e=>preset(e.target.value));
$('reset').addEventListener('click',()=>{$('scenario').value='rare';preset('rare');});
for(const [id,flag] of [['all-view',false],['positive-view',true],['tree-view',false]])$(id).addEventListener('click',()=>{positiveOnly=flag;for(const button of ['all-view','positive-view','tree-view']){$(button).classList.toggle('active',button===id);$(button).setAttribute('aria-pressed',String(button===id));}$('population-wrap').hidden=id==='tree-view';$('frequency-tree').hidden=id!=='tree-view';update();});
$('print').addEventListener('click',()=>window.print());
function node(tag,text,className){const element=document.createElement(tag);element.textContent=text;if(className)element.className=className;return element;}
function showFeedback(text){
  const result=BaseRateCoach.classify(text,window.BaseRateModel),f=BaseRateCoach.feedback(result,current),panel=$('coach-response');
  const icon=node('span','✳','coach-icon');icon.setAttribute('aria-hidden','true');
  panel.replaceChildren(icon,node('p',f.focus.toUpperCase(),'small-label'),node('h3',f.title),node('p',f.body));
  if(!['personal','empty'].includes(result.label))panel.append(node('p',f.counts,'current-counts'));
  panel.append(node('p',f.question,'coach-question'));
  if(result.patterns.length&&!result.abstained){const tags=node('div','','feedback-tags');for(const pattern of result.patterns)tags.append(node('span',pattern));panel.append(node('p','Patterns that influenced the model:','muted'),tags);}
  const source=node('div','Read the evidence: ','feedback-source'),link=node('a',f.source.title);link.href=f.source.url;link.target='_blank';link.rel='noopener';source.append(link);panel.append(source);
  panel.append(node('p','Model feedback is a suggestion, not a grade. A small English classifier can misread negation or mixed ideas.','muted'));
  if(result.scores){
    const diagnostics=node('details'),summary=node('summary','Inspect why the model suggested this');diagnostics.append(summary);
    diagnostics.append(node('p',`Feature coverage: ${number(result.coverage*100)}%. ${result.abstained?'The uncertainty gate withheld the leading label.':'The leading label passed the prototype’s uncertainty gate.'}`,'muted'));
    const bars=node('div','','diagnostic-bars'),names={balanced:'Contextual',certainty:'Certainty',sensitivity:'Test rates',base_rate:'Prevalence',dismissal:'Dismissal'};
    for(const score of result.scores){const row=node('div','','diagnostic-row'),meter=node('span','','diagnostic-meter'),fill=node('span');fill.style.width=score.vote*100+'%';meter.append(fill);row.append(node('span',names[score.label]),meter,node('span',score.vote>0&&score.vote*100<.1?'<0.1%':number(score.vote*100)+'%'));bars.append(row);}
    diagnostics.append(bars,node('p','These are relative, uncalibrated model votes. They are not probabilities of correctness or health outcomes. The feature snippets above are associations, not a complete explanation.','muted'));panel.append(diagnostics);
  }
  if(!['personal','empty'].includes(result.label)){const next=node('a',result.label==='base_rate'?'Next: compare the starting populations ↗':result.label==='sensitivity'?'Next: practice choosing the denominator ↗':'Next: try a prediction before revealing the counts ↗','text-link');next.href=result.label==='base_rate'?'#compare':'#practice';panel.append(next);}
  return {label:result.label,focus:f.focus,counts:{...current},abstained:!!result.abstained};
}
$('coach-form').addEventListener('submit',e=>{e.preventDefault();lastExplanation=$('explanation').value;showFeedback(lastExplanation);});
let exampleIndex=0;
const examples=['The test detects 90 percent of cases, so 90 percent of positive results must be real cases.','A positive result does not prove someone has the condition because false positives can outnumber true positives when it is rare.','How common the condition is does not matter to a positive result.'];
$('example').addEventListener('click',()=>{$('explanation').value=examples[exampleIndex++%examples.length];lastExplanation=null;$('explanation').focus();});
if(window.BaseRateModel){const m=window.BaseRateModel,e=m.evaluation;
  $('model-summary').textContent=`A ${m.algorithm} classifier trained on ${m.trainingCount} synthetic English explanations selects fixed, source-linked educational feedback. Your text is processed on this device.`;
  const details=$('model-details');details.replaceChildren(node('p',`Version ${m.version}. Word and adjacent-word features; additive smoothing; five reasoning labels. Training code and dataset are included in the source package.`),node('p',`Development check: ${e.correctCount}/${e.evaluatedCount} held-out synthetic examples classified correctly; ${e.acceptedCount}/${e.evaluatedCount} received a label after uncertainty checks. ${e.acceptedCorrect}/${e.acceptedCount} of those labels were correct.`,'model-metric'),node('p','Known error: one explanation that correctly distinguished sensitivity from predictive value was misread as confusion. Negation, mixed ideas, unfamiliar wording, and other languages can fail.'),node('p','Uncertainty checks use feature coverage, model vote and separation between labels. Votes are uncalibrated and are not a probability that the feedback is correct.'),node('p','No real learner study, clinical validation, or measured health benefit. The AI never computes the simulator’s numbers or generates medical facts. No text is saved or sent by the app.'),node('p','Model and feedback were authored with AI assistance. The synthetic dataset contains no patient data.'));
}else{
  $('model-summary').textContent='The AI model is unavailable. The simulator, comparisons and mathematical practice still work.';
  $('model-details').replaceChildren(node('p','Model data did not load. Reload to try again, or inspect the source package. No AI feedback about your wording can be given until the model is available.'));
}
if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  for(const tool of [
    {name:'configure_fictional_experiment',title:'Configure fictional experiment',description:'Change the visible educational simulation. No diagnosis or personal risk estimate.',inputSchema:{type:'object',properties:{prevalence:{type:'number',minimum:0.1,maximum:50},sensitivity:{type:'number',minimum:1,maximum:100},specificity:{type:'number',minimum:1,maximum:100}},required:settings,additionalProperties:false},annotations:{readOnlyHint:false},execute(input){for(const id of settings){if(!Number.isFinite(input?.[id])||input[id]<Number($(id).min)||input[id]>Number($(id).max))throw new Error('Invalid fictional percentage: '+id);}for(const id of settings)$(id).value=input[id];$('scenario').value='custom';$('scenario-note').textContent='Explore your own fictional assumptions.';update();return {settings:Object.fromEntries(settings.map(id=>[id,Number($(id).value)])),expectedCounts:{...current}};}},
    {name:'check_learning_explanation',title:'Check learning explanation',description:'Put an English explanation into the visible local AI coach and display educational feedback. Text stays on this device.',inputSchema:{type:'object',properties:{explanation:{type:'string',maxLength:1800}},required:['explanation'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute(input){if(typeof input?.explanation!=='string'||input.explanation.length>1800)throw new Error('Explanation must be text, at most 1800 characters.');$('explanation').value=input.explanation;lastExplanation=input.explanation;return showFeedback(lastExplanation);}}
  ]){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
update();
// Fixed, fictional demonstration links; no arbitrary learner text is accepted in URLs.
const demo=new URLSearchParams(window.location.search).get('demo');
if(demo==='common'){$('scenario').value='common';preset('common');}
if(demo==='coach'){$('explanation').value=examples[0];lastExplanation=examples[0];showFeedback(lastExplanation);}
if(demo==='model')document.querySelector('#evidence details').open=true;
