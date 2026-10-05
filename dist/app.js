'use strict';
const $=id=>document.getElementById(id);
const settings=['prevalence','sensitivity','specificity'];
const presets={rare:[1,90,95],common:[20,90,95],specific:[1,90,99]};
let positiveOnly=false,current;
let lastExplanation=null;
let coachReviewTopic=null;
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
function addCoachCheck(panel,result){
  if(['personal','empty'].includes(result.label))return;
  const suggested={balanced:'positives',sensitivity:'detection',base_rate:'prevalence',certainty:'uncertainty',dismissal:'evidence'}[result.label]||'';
  const section=node('section',undefined,'coach-check'),heading=node('h4','Check a concrete claim');
  heading.id='coach-check-heading';section.setAttribute('aria-labelledby',heading.id);
  const label=node('label','Review focus'),select=node('select');select.id='coach-topic';label.htmlFor=select.id;
  for(const [value,text] of [['','Choose a focus'],['positives','The positive group'],['detection','The detection rate'],['prevalence','Changing prevalence'],['uncertainty','Uncertainty and context'],['evidence','Benefits and harms']]){const option=node('option',text);option.value=value;select.append(option);}
  select.value=coachReviewTopic??suggested;
  const form=node('form'),question=node('fieldset'),status=node('p',undefined,'coach-check-feedback'),button=node('button','Check this answer','secondary'),revise=node('button','Revise my explanation','text-button');
  form.noValidate=true;status.setAttribute('role','status');status.id='coach-check-feedback';button.type='submit';button.id='coach-check-submit';
  function renderQuestion(){
    status.textContent='';question.replaceChildren();button.disabled=!select.value;
    if(!select.value){question.append(node('p','Choose a focus to start the self-check.'));return;}
    const item=BaseRateCoach.exercise(select.value,BaseRateApp.getExperiment().settings);question.append(node('legend',item.question));
    for(const [value,text] of item.choices){const row=node('label'),input=node('input');input.type='radio';input.name='coach-check-answer';input.value=value;row.append(input,document.createTextNode(' '+text));question.append(row);}
  }
  select.addEventListener('change',()=>{coachReviewTopic=select.value;renderQuestion();});
  form.addEventListener('change',()=>{status.textContent='';});
  form.addEventListener('submit',event=>{
    event.preventDefault();const answer=question.querySelector('input:checked');
    if(!answer){status.textContent='Choose one of the displayed answers.';question.querySelector('input')?.focus();return;}
    const check=BaseRateCoach.checkAnswer(select.value,answer.value,BaseRateApp.getExperiment().settings);
    status.textContent=(check.correct?'Correct for this question. ':'Revisit the selected answer. ')+check.body+' This checks your selected answer, not the quality of your explanation.';
  });
  revise.type='button';revise.addEventListener('click',()=>$('explanation').focus());
  form.append(question,button,status,revise);section.append(heading,node('p',result.label==='unavailable'?'This factual check works without the AI model.':suggested?'The model suggests a review topic. You can change it; a suggestion is not a verdict.':'Choose a topic yourself; the model has no reliable suggestion.','micro'),label,select,form);panel.append(section);renderQuestion();
}
function showFeedback(text){
  const result=BaseRateCoach.classify(text,window.BaseRateModel),f=BaseRateCoach.feedback(result,current),panel=$('coach-response');
  const icon=node('span','✳','coach-icon');icon.setAttribute('aria-hidden','true');
  panel.replaceChildren(icon,node('p',f.focus.toUpperCase(),'small-label'),node('h3',f.title),node('p',f.body));
  if(!['personal','empty'].includes(result.label))panel.append(node('p',f.counts,'current-counts'));
  panel.append(node('p',f.question,'coach-question'));
  if(result.patterns.length&&!result.abstained){const tags=node('div','','feedback-tags');for(const pattern of result.patterns)tags.append(node('span',pattern));panel.append(node('p','Patterns that influenced the model:','muted'),tags);}
  const source=node('div','Read the evidence: ','feedback-source'),link=node('a',f.source.title);link.href=f.source.url;link.target='_blank';link.rel='noopener';source.append(link);panel.append(source);
  panel.append(node('p','A model-selected topic does not establish a misconception or correct reasoning. Negation, quotations and mixed ideas can be misread.','muted'));
  addCoachCheck(panel,result);
  if(result.scores){
    const diagnostics=node('details'),summary=node('summary','Inspect the model’s topic suggestion');diagnostics.append(summary);
    diagnostics.append(node('p',`Feature coverage: ${number(result.coverage*100)}%. ${result.abstained?'The uncertainty gate withheld a topic suggestion.':'The leading pattern passed the prototype’s uncertainty gate; that does not verify its meaning.'}`,'muted'));
    const bars=node('div','','diagnostic-bars'),names={balanced:'Contextual',certainty:'Certainty',sensitivity:'Test rates',base_rate:'Prevalence',dismissal:'Dismissal'};
    for(const score of result.scores){const row=node('div','','diagnostic-row'),meter=node('span','','diagnostic-meter'),fill=node('span');fill.style.width=score.vote*100+'%';meter.append(fill);row.append(node('span',names[score.label]),meter,node('span',score.vote>0&&score.vote*100<.1?'<0.1%':number(score.vote*100)+'%'));bars.append(row);}
    diagnostics.append(bars,node('p','These are relative, uncalibrated model votes. They are not probabilities of correctness or health outcomes. The feature snippets above are associations, not a complete explanation.','muted'));panel.append(diagnostics);
  }
  if(!['personal','empty'].includes(result.label)){const next=node('a',result.label==='base_rate'?'Next: compare the starting populations ↗':result.label==='sensitivity'?'Next: practice choosing the denominator ↗':'Next: try a prediction before revealing the counts ↗','text-link');next.href=result.label==='base_rate'?'#compare':'#practice';panel.append(next);}
  return {label:result.label,focus:f.focus,counts:{...current},abstained:!!result.abstained};
}
$('coach-form').addEventListener('submit',e=>{e.preventDefault();coachReviewTopic=null;lastExplanation=$('explanation').value;showFeedback(lastExplanation);});
let exampleIndex=0;
const examples=['The test detects 90 percent of cases, so 90 percent of positive results must be real cases.','A positive result does not prove someone has the condition because false positives can outnumber true positives when it is rare.','How common the condition is does not matter to a positive result.'];
$('example').addEventListener('click',()=>{$('explanation').value=examples[exampleIndex++%examples.length];lastExplanation=null;coachReviewTopic=null;$('coach-response').replaceChildren(node('p','EXAMPLE LOADED','small-label'),node('h3','Review this example.'),node('p','Select Find a review focus to review this example with the current experiment. The previous self-check has been cleared.'));$('explanation').focus();});
if(window.BaseRateModel){const m=window.BaseRateModel,e=m.evaluation;
  $('model-summary').textContent=`A ${m.algorithm} classifier trained on ${m.trainingCount} synthetic English explanations suggests a review topic. You can override it and check a factual answer separately. Your text is processed on this device.`;
  const details=$('model-details');details.replaceChildren(node('p',`Model ${m.version}; feedback policy 1.1. Word and adjacent-word features; additive smoothing; five original reasoning labels mapped to review topics. Training code and dataset are included in the source package.`),node('p',`Reproduced byte for byte: ${e.correctCount}/${e.evaluatedCount} raw classifications matched the predefined synthetic labels; ${e.acceptedCount}/${e.evaluatedCount} passed uncertainty checks, ${e.acceptedCorrect} correct. The training and holdout sets have no exact duplicate sentences, but share authorship, task and familiar claim patterns.`,'model-metric'),node('p','A 24-probe author-created stress audit found negation, ambiguous and mixed explanations can receive strong votes for the wrong pattern. Two of ten flawed or mixed probes previously received contextual praise. The revised feedback gives provisional review topics and factual self-checks, never correctness endorsements based on text. These probes informed the change; they are development regressions, not a fresh benchmark.'),node('p','The original weights, data and 30-example holdout are unchanged, including the known correct sensitivity distinction misread as confusion. No improved classification accuracy is claimed. See model/audit.json and docs/model-card.md in the repository for reproduction, lexical split checks and all probes.'),node('p','Uncertainty checks use feature coverage, model vote and separation between labels. Votes are uncalibrated and cannot detect every semantic mistake. A correct selected self-check answer does not verify the explanation or demonstrate learning.'),node('p','No real learner study, clinical validation, or measured health benefit. The AI never computes the simulator’s numbers or generates medical facts. Explanations stay in tab memory; the app does not persist them or send them to a server. Reload clears them. Loading downloads static files from GitHub Pages; a connected browser assistant has separate data handling.'),node('p','Model and feedback were authored with AI assistance. The synthetic dataset contains no patient data.'));
}else{
  $('model-summary').textContent='The AI model is unavailable. The simulator, comparisons and mathematical practice still work.';
  $('model-details').replaceChildren(node('p','Model data did not load. Reload to try again, or inspect the source package. No AI feedback about your wording can be given until the model is available.'));
}
if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  for(const tool of [
    {name:'configure_fictional_experiment',title:'Configure fictional experiment',description:'Change the visible educational simulation. No diagnosis or personal risk estimate.',inputSchema:{type:'object',properties:{prevalence:{type:'number',minimum:0.1,maximum:50},sensitivity:{type:'number',minimum:1,maximum:100},specificity:{type:'number',minimum:1,maximum:100}},required:settings,additionalProperties:false},annotations:{readOnlyHint:false},execute(input){for(const id of settings){if(!Number.isFinite(input?.[id])||input[id]<Number($(id).min)||input[id]>Number($(id).max))throw new Error('Invalid fictional percentage: '+id);}for(const id of settings)$(id).value=input[id];$('scenario').value='custom';$('scenario-note').textContent='Explore your own fictional assumptions.';update();return {settings:Object.fromEntries(settings.map(id=>[id,Number($(id).value)])),expectedCounts:{...current}};}},
    {name:'check_learning_explanation',title:'Check learning explanation',description:'Put an English explanation into the visible local AI coach and display educational feedback. Inference runs locally; a connected assistant has its own conversation/data handling.',inputSchema:{type:'object',properties:{explanation:{type:'string',maxLength:1800}},required:['explanation'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute(input){if(typeof input?.explanation!=='string'||input.explanation.length>1800)throw new Error('Explanation must be text, at most 1800 characters.');$('explanation').value=input.explanation;coachReviewTopic=null;lastExplanation=input.explanation;return showFeedback(lastExplanation);}}
  ]){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
update();
// Fixed, fictional demonstration links; no arbitrary learner text is accepted in URLs.
const demo=new URLSearchParams(window.location.search).get('demo');
if(demo==='common'){$('scenario').value='common';preset('common');}
if(demo==='coach'){$('explanation').value=examples[0];lastExplanation=examples[0];showFeedback(lastExplanation);}
if(demo==='model')document.querySelector('#evidence details').open=true;
