// Breaks caught: unsupported model praise; wrong conditional question arithmetic;
// invalid choices accepted as correct; lost first denominator after correction.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const science=require('../dist/science.js'),coach=require('../dist/coach.js'),learning=require('../dist/learning.js');
const context={window:{}};vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../dist/model.js'),'utf8'),context);
const settings={prevalence:1,sensitivity:90,specificity:95};
const bad='All positives are actual cases, without exception.';
const inferred=coach.classify(bad,context.window.BaseRateModel),feedback=coach.feedback(inferred,science.calculate(1,90,95));
assert.doesNotMatch(feedback.title,/you are connecting/i,'An incorrect explanation must not receive a correctness endorsement');
assert.equal(feedback.provisional,true,'A model-selected topic must remain a suggestion, even for a high vote');
for(const [topic,choice,correct] of [
 ['positives','positives',true],['positives','cases',false],['detection','cases',true],['detection','positives',false],
 ['prevalence','higher',true],['prevalence','same',false],['uncertainty','context',true],['uncertainty','diagnosis',false],
 ['evidence','benefits',true],['evidence','errors',false]
]) assert.equal(coach.checkAnswer(topic,choice,settings).correct,correct,topic+' '+choice);
assert.equal(coach.exercise('prevalence',settings).correctChoice,'higher');
assert.equal(coach.exercise('prevalence',{prevalence:1,sensitivity:90,specificity:100}).correctChoice,'same','Perfect clearance keeps PPV100% at both positive prevalences');
assert.match(coach.checkAnswer('positives','cases',settings).body,/58\.5/);
assert.match(coach.checkAnswer('detection','positives',settings).body,/10/);
assert.throws(()=>coach.checkAnswer('positives','invented',settings),RangeError);
assert.throws(()=>coach.exercise('invented',settings),RangeError);
assert.throws(()=>coach.exercise('positives',{...settings,prevalence:NaN}),RangeError);
assert.equal(learning.checkDenominator('rare','positives').correct,true);
assert.equal(learning.checkDenominator('rare','cases').correct,false);
assert.match(learning.checkDenominator('rare','cases').body,/90%/);
assert.match(learning.checkDenominator('rare','population').body,/0\.9%/);
assert.throws(()=>learning.checkDenominator('rare','invented'),RangeError);
assert.throws(()=>learning.checkDenominator('missing','positives'),RangeError);
const answers=[{caseId:'rare',prediction:90,denominator:'positives',firstDenominator:'cases',denominatorAttempts:2,explanation:'never export this'}];
const notebook=learning.notebook(answers);
assert.equal(notebook.version,2);assert.equal(notebook.attempts[0].firstDenominator,'cases');
assert.equal(notebook.attempts[0].denominator,'positives');assert.equal(notebook.attempts[0].denominatorAttempts,2);
assert.ok(!JSON.stringify(notebook).includes('never export this'));
console.log(JSON.stringify({result:'PASS',checks:['provisional coach feedback','five factual self-checks','perfect-clearance edge','specific denominator correction','first and corrected choices exported without text']}));
// Reproduce a review finding through the actual application event handlers.
// An unsubmitted example must not retain an answered check for old lab counts.
{
 const elements=[];
 class Element {
  constructor(tag='div'){this.tag=tag;this.children=[];this.listeners={};this.style={};this.classList={toggle(){}};this.attrs={};this._text='';this.value='';elements.push(this);}
  set textContent(value){this._text=value??'';this.children=[];}
  get textContent(){return this._text+this.children.map(e=>e.textContent).join('');}
  append(...children){this.children.push(...children);for(const child of children)child.parent=this;}
  replaceChildren(...children){this.children=[];this._text='';this.append(...children);}
  setAttribute(key,value){this.attrs[key]=value;}
  removeAttribute(key){delete this.attrs[key];}
  addEventListener(type,handler){this.listeners[type]=handler;}
  focus(){}
  all(){return this.children.flatMap(e=>[e,...e.all()]);}
  querySelector(selector){return this.all().find(e=>e.tag==='input'&&(selector!=='input:checked'||e.checked))||null;}
  emit(type){this.listeners[type]?.({preventDefault(){},target:this});}
 }
 const byId={},document={
  getElementById:id=>elements.findLast(e=>e.id===id)||(byId[id]??=Object.assign(new Element(),{id})),
  createElement:tag=>new Element(tag),createDocumentFragment:()=>new Element('fragment'),
  createTextNode:text=>Object.assign(new Element('text'),{textContent:text})
 };
 for(const [id,value,min,max] of [['prevalence',1,.1,50],['sensitivity',90,1,100],['specificity',95,1,100]])Object.assign(document.getElementById(id),{value,min,max});
 const appContext={document,URLSearchParams,CustomEvent:class{},location:{search:''},dispatchEvent(){},addEventListener(){},BaseRateScience:science,BaseRateCoach:coach};
 appContext.window=appContext;
 vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../dist/app.js'),'utf8'),appContext);
 document.getElementById('explanation').value='A fictional explanation';document.getElementById('coach-form').emit('submit');
 const select=document.getElementById('coach-topic');select.value='positives';select.emit('change');
 const form=document.getElementById('coach-check-submit').parent;form.querySelector('input').checked=true;form.emit('submit');
 assert.match(document.getElementById('coach-response').textContent,/58\.5/);
 document.getElementById('example').emit('click');
 appContext.BaseRateApp.setExperiment({prevalence:20,sensitivity:90,specificity:95});
 assert.match(document.getElementById('result-explanation').textContent,/180 of 220/);
 assert.doesNotMatch(document.getElementById('coach-response').textContent,/58\.5|Correct for this question/,'Loading an unsubmitted example must clear stale answered checks');
 console.log(JSON.stringify({result:'PASS',check:'example loading clears answered coach state'}));
}
