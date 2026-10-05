(function(){
  'use strict';
  const get=id=>document.getElementById(id),cases=BaseRateLearning.cases;
  let index=0,answers=[],revealed=false,denominatorDone=false;
  const fmt=value=>BaseRateScience.formatNumber(value);
  function display(){
    const item=cases[index];revealed=false;denominatorDone=false;
    get('practice-progress').textContent=`Case ${index+1} of ${cases.length}`;
    get('case-title').textContent=item.title;get('case-prompt').textContent=item.prompt;
    get('case-settings').textContent=`Prevalence ${item.settings.prevalence}% · Detection ${item.settings.sensitivity}% · Clearance ${item.settings.specificity}%`;
    get('prediction').value='';get('prediction').disabled=false;
    get('predict-button').disabled=false;get('prediction-error').textContent='';
    get('case-reveal').hidden=true;get('practice-next').disabled=true;
    get('denominator-feedback').textContent='';
    for(const input of document.querySelectorAll('[name="denominator"]')){input.checked=false;input.disabled=false;}
    get('practice-next').textContent=index===cases.length-1?'See my notebook':'Next case';
    get('practice-complete').hidden=true;get('practice-case').hidden=false;
    get('practice-steps').replaceChildren(...cases.map((c,i)=>{
      const li=document.createElement('li');li.textContent=`0${i+1} ${c.title}`;li.className=i===index?'current':i<index?'done':'';
      if(i===index)li.setAttribute('aria-current','step');return li;
    }));
  }
  get('prediction-form').addEventListener('submit',event=>{
    event.preventDefault();if(revealed)return;
    const prediction=get('prediction').valueAsNumber;
    try{
      const item=cases[index],result=BaseRateLearning.gradePrediction(item.id,prediction);
      answers[index]={caseId:item.id,prediction,denominator:null};revealed=true;
      get('prediction-error').textContent='';
      get('prediction').disabled=true;get('predict-button').disabled=true;
      get('case-reveal').hidden=false;
      get('prediction-result').textContent=`${fmt(result.actual)}% of positive results are true positives.`;
      get('prediction-difference').textContent=`Your first estimate: ${fmt(prediction)}%. Gap: ${fmt(result.error)} percentage points. ${result.close?'You were within 2 points.':'Use the denominator below to see the difference.'}`;
      get('case-equation').textContent=`${fmt(result.counts.tp)} ÷ (${fmt(result.counts.tp)} + ${fmt(result.counts.fp)}) × 100 = ${fmt(result.actual)}%`;
      get('case-explanation').textContent=item.explanation;
      get('case-reveal').focus({preventScroll:true});
    }catch{get('prediction-error').textContent='Enter a number from 0 to 100.';}
  });
  get('denominator-form').addEventListener('change',event=>{
    if(!revealed||denominatorDone||event.target.name!=='denominator')return;
    denominatorDone=true;answers[index].denominator=event.target.value;
    get('denominator-feedback').textContent=event.target.value==='positives'?'Yes. Start with everyone who tested positive, then count the true positives inside that group.':'The denominator is everyone who tested positive: true positives plus false positives. Cases alone are the denominator for sensitivity.';
    for(const input of document.querySelectorAll('[name="denominator"]'))input.disabled=true;
    get('practice-next').disabled=false;
  });
  get('practice-next').addEventListener('click',()=>{
    if(!revealed||!denominatorDone)return;
    if(index<cases.length-1){index++;display();get('case-title').focus({preventScroll:true});}
    else{
      get('practice-case').hidden=true;get('practice-complete').hidden=false;
      get('notebook-rows').replaceChildren(...answers.map(answer=>{
        const item=cases.find(c=>c.id===answer.caseId),r=BaseRateLearning.gradePrediction(item.id,answer.prediction),tr=document.createElement('tr');
        for(const value of [item.title,fmt(answer.prediction)+'%',fmt(r.actual)+'%',fmt(r.error)+' pp',answer.denominator==='positives'?'Positive group':'Review denominator']){const cell=document.createElement('td');cell.textContent=value;tr.append(cell);}return tr;
      }));
      get('practice-complete').focus({preventScroll:true});
      for(const li of get('practice-steps').children){li.className='done';li.removeAttribute('aria-current');}
    }
  });
  function restart(){index=0;answers=[];display();}
  get('restart-practice').addEventListener('click',restart);
  get('download-notebook').addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob([JSON.stringify(BaseRateLearning.notebook(answers),null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='BaseRate-Learning-Notebook.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  window.BaseRateLesson={notebook:()=>BaseRateLearning.notebook(answers),restart};
  display();
  if(new URLSearchParams(window.location.search).get('demo')==='practice'){
    get('prediction').value=90;get('prediction-form').requestSubmit();
    get('prediction-difference').textContent='Demonstration estimate: 90%. The expected answer is 15.4%. This is a fictional example, not a learner result.';
  }
})();
