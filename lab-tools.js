(function(){
  'use strict';
  const get=id=>document.getElementById(id),science=BaseRateScience;
  const fmt=n=>n===null?'undefined':science.formatNumber(n);
  const pct=n=>n===null?'Undefined':fmt(n)+'%';
  const element=(tag,text,css)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(css)e.className=css;return e;};
  let pinned={prevalence:1,sensitivity:90,specificity:95};
  function tree(settings,counts){
    const root=element('div','1,000 people','tree-root'),branches=element('div',undefined,'tree-branches');
    for(const [heading,total,positive,negative,positiveClass,negativeClass] of [
      ['With the condition',1000*settings.prevalence/100,counts.tp,counts.fn,'tp-text','fn-text'],
      ['Without the condition',1000*(1-settings.prevalence/100),counts.fp,counts.tn,'fp-text','']
    ]){
      const branch=element('div',undefined,'tree-branch'),parent=element('div',heading,'tree-parent');parent.append(element('strong',fmt(total)));branch.append(parent);
      for(const [label,n,css] of [['Positive',positive,positiveClass],['Negative',negative,negativeClass]]){const leaf=element('div',undefined,'tree-leaf '+css);leaf.append(element('span',label),element('b',fmt(n)));branch.append(leaf);}branches.append(branch);
    }
    get('frequency-tree').replaceChildren(root,branches);
  }
  function comparison(settings){
    const pair=science.compare(pinned,settings),rows=[['Prevalence',pct(pinned.prevalence),pct(settings.prevalence)],['Detection / clearance',pct(pinned.sensitivity)+' / '+pct(pinned.specificity),pct(settings.sensitivity)+' / '+pct(settings.specificity)],['True positives',fmt(pair.a.tp),fmt(pair.b.tp)],['False positives',fmt(pair.a.fp),fmt(pair.b.fp)],['All positive results',fmt(pair.a.positive),fmt(pair.b.positive)],['True among positives',pct(pair.a.ppv),pct(pair.b.ppv)]];
    get('compare-rows').replaceChildren(...rows.map(row=>{const tr=element('tr');row.forEach((value,i)=>{const cell=element(i===0?'th':'td',value);if(i===0)cell.scope='row';tr.append(cell);});return tr;}));
    const sameTest=pinned.sensitivity===settings.sensitivity&&pinned.specificity===settings.specificity;
    get('compare-insight').textContent=pair.delta.ppv===null?'One experiment has no positive group, so a percentage-point difference is undefined.':`B differs by ${pair.delta.ppv>=0?'+':''}${fmt(pair.delta.ppv)} percentage points. ${sameTest?(pinned.prevalence===settings.prevalence?'Both experiments have identical settings.':'The test settings are identical; only prevalence differs.'):'Prevalence or test settings differ. This comparison does not isolate a single cause.'}`;
  }
  const ns='http://www.w3.org/2000/svg';
  function svgNode(tag,attrs,text){const n=document.createElementNS(ns,tag);for(const [key,value] of Object.entries(attrs))n.setAttribute(key,value);if(text!==undefined)n.textContent=text;return n;}
  function curve(settings,counts){
    const svg=get('prevalence-curve'),parts=[svgNode('title',{id:'curve-title'},'How prevalence changes positive predictive value'),svgNode('desc',{id:'curve-description'},`Detection ${fmt(settings.sensitivity)} percent, clearance ${fmt(settings.specificity)} percent. Current prevalence ${fmt(settings.prevalence)} percent gives ${pct(counts.ppv)} true positives among positives. Equivalent values are in the table.`)];
    const x=p=>60+p/50*540,y=p=>245-p/100*210;
    for(const value of [0,25,50,75,100])parts.push(svgNode('line',{x1:60,x2:600,y1:y(value),y2:y(value),class:'curve-grid'}),svgNode('text',{x:47,y:y(value)+4,'text-anchor':'end',class:'curve-axis-label'},value+'%'));
    for(const value of [0,10,20,30,40,50])parts.push(svgNode('text',{x:x(value),y:269,'text-anchor':'middle',class:'curve-axis-label'},value+'%'));
    parts.push(svgNode('text',{x:60,y:17,class:'curve-axis-label'},'True among positive results'),svgNode('text',{x:330,y:305,'text-anchor':'middle',class:'curve-axis-label'},'Prevalence in the starting population'));
    const points=science.prevalenceCurve(settings.sensitivity,settings.specificity);let path='',connected=false;
    for(const p of points){if(p.ppv===null){connected=false;continue;}path+=(connected?'L':'M')+x(p.prevalence).toFixed(2)+','+y(p.ppv).toFixed(2)+' ';connected=true;}
    parts.push(svgNode('path',{d:path,class:'curve-line'}));
    if(counts.ppv!==null){const px=x(settings.prevalence),py=y(counts.ppv);parts.push(svgNode('line',{x1:px,x2:px,y1:py,y2:245,class:'curve-guide'}),svgNode('circle',{cx:px,cy:py,r:6,class:'curve-dot'}),svgNode('text',{x:Math.min(530,Math.max(80,px+13)),y:Math.max(33,py-12),class:'curve-marker-label'},pct(counts.ppv)));}
    svg.replaceChildren(...parts);
    get('curve-test-label').textContent=`Detection ${fmt(settings.sensitivity)}% · Clearance ${fmt(settings.specificity)}%`;
    get('curve-prevalence').value=settings.prevalence;get('curve-value').textContent=pct(settings.prevalence);
    get('curve-table').replaceChildren(...[0,.1,1,5,10,20,50].map(p=>{const tr=element('tr'),th=element('th',pct(p));th.scope='row';tr.append(th,element('td',pct(science.calculate(p,settings.sensitivity,settings.specificity).ppv)));return tr;}));
  }
  function sequence(settings){
    const mode=get('sequence-mode').value;
    if(mode==='independent'){get('conditional-detection').value=settings.sensitivity;get('conditional-false').value=Number((100-settings.specificity).toFixed(1));}
    if(mode==='repeat'){get('conditional-detection').value=100;get('conditional-false').value=100;}
    const d=Number(get('conditional-detection').value),f=Number(get('conditional-false').value),r=science.sequential(settings,d,f);
    get('conditional-detection-label').textContent=pct(d);get('conditional-false-label').textContent=pct(f);
    get('sequence-assumption').textContent={independent:'Assumption: the two results are independent within each condition group. Real tests can share errors. Independence is invented here, not evidence about a real test.',repeat:'Assumption: every first-positive result is repeated, including every false positive. The second result adds no new information.',custom:'These conditional rates apply only among people positive on the first test. Their values need separate evidence in a real setting.'}[mode];
    get('sequence-ppv').textContent=pct(r.ppv);
    get('sequence-counts').textContent=r.ppv===null?'No one is expected to be positive twice. The proportion is undefined.':`${fmt(r.tp)} true and ${fmt(r.fp)} false positives remain: ${fmt(r.tp)} ÷ ${fmt(r.positive)} × 100.`;
    get('sequence-steps').replaceChildren(element('p',`First positives: ${fmt(r.first.tp)} true + ${fmt(r.first.fp)} false`),element('p',`Both positive: ${fmt(r.tp)} true + ${fmt(r.fp)} false`),element('p',`Second step rejects: ${fmt(r.rejectedTrue)} true + ${fmt(r.rejectedFalse)} false first-positives`));
  }
  function render(detail){tree(detail.settings,detail.counts);comparison(detail.settings);curve(detail.settings,detail.counts);sequence(detail.settings);}
  get('pin-experiment').addEventListener('click',()=>{pinned={...BaseRateApp.getExperiment().settings};get('pin-status').textContent=`A pinned: ${pct(pinned.prevalence)} prevalence, ${pct(pinned.sensitivity)} detection, ${pct(pinned.specificity)} clearance. Changes now affect B only.`;render(BaseRateApp.getExperiment());});
  get('compare-common').addEventListener('click',()=>{pinned={prevalence:1,sensitivity:90,specificity:95};get('pin-status').textContent='A: rare condition at 1%. B: same test at 20% prevalence.';BaseRateApp.setExperiment({prevalence:20,sensitivity:90,specificity:95});});
  get('curve-prevalence').addEventListener('input',()=>BaseRateApp.setExperiment({...BaseRateApp.getExperiment().settings,prevalence:Number(get('curve-prevalence').value)}));
  get('sequence-mode').addEventListener('change',()=>sequence(BaseRateApp.getExperiment().settings));
  for(const id of ['conditional-detection','conditional-false'])get(id).addEventListener('input',()=>{get('sequence-mode').value='custom';sequence(BaseRateApp.getExperiment().settings);});
  get('share-experiment').addEventListener('click',async()=>{
    const url=new URL(window.location.href);url.search='';url.hash='lab';
    const s=BaseRateApp.getExperiment().settings;url.searchParams.set('p',s.prevalence);url.searchParams.set('se',s.sensitivity);url.searchParams.set('sp',s.specificity);
    try{await navigator.clipboard.writeText(url.href);get('link-message').textContent='Copied. This link contains only fictional rate settings.';}catch{get('link-message').textContent=`Copy this settings link: ${url.href}`;}
  });
  window.addEventListener('baserate:experiment',event=>render(event.detail));
  const params=new URLSearchParams(window.location.search),keys=['p','se','sp'];
  if(keys.some(key=>params.has(key))){
    const valid=keys.every(key=>params.getAll(key).length===1&&/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(params.get(key)));
    try{if(!valid)throw new Error('Invalid settings');BaseRateApp.setExperiment({prevalence:Number(params.get('p')),sensitivity:Number(params.get('se')),specificity:Number(params.get('sp'))});get('link-message').textContent='Loaded fictional settings from this link.';}catch{get('link-message').textContent='This settings link is incomplete or outside the available ranges. The default experiment is shown.';}
  }
  render(BaseRateApp.getExperiment());
  const demo=new URLSearchParams(window.location.search).get('demo');
  if(demo==='compare')BaseRateApp.setExperiment({prevalence:20,sensitivity:90,specificity:95});
  if(demo==='sequence')get('sequence').open=true;
})();
