"""Reproducible, dependency-free educational text-model training. No clinical data."""
import collections, hashlib, json, math, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'model/dataset.json').read_text())
STOP = {'a','an','the','is','are','am','be','being','been','of','to','in','and','or','it','its','if','for','as','at','i','we','you','they','their','there','this','that','these','those','with','by','from','on','us','our','my','has','have','had','was','were','can','could','would','should'}
def features(text):
    words = re.findall(r"[a-z]+", text.lower().replace('’', "'"))
    return [w for w in words if w not in STOP] + [words[i]+'_'+words[i+1] for i in range(len(words)-1)]
labels = list(data['train'])
counts = {label: collections.Counter() for label in labels}
vocabulary = set()
for label, examples in data['train'].items():
    for example in examples:
        counts[label].update(features(example))
        vocabulary.update(features(example))
vocabulary = sorted(vocabulary)
alpha = 0.7
weights = {label: [math.log((counts[label][word]+alpha)/(sum(counts[label].values())+alpha*len(vocabulary))) for word in vocabulary] for label in labels}
model = {'version':'1.0.0','algorithm':'Multinomial Naive Bayes','labels':labels,'vocabulary':vocabulary,'weights':weights,'logPriors':{l:math.log(len(data['train'][l])/sum(map(len,data['train'].values()))) for l in labels},'stopWords':sorted(STOP),'trainingCount':sum(map(len,data['train'].values())),'holdoutCount':sum(map(len,data['holdout'].values())),'datasetSha256':hashlib.sha256((ROOT/'model/dataset.json').read_bytes()).hexdigest(),'abstention':{'minKnownFeatures':4,'minCoverage':0.18,'minVote':0.65,'minMargin':0.2},'warning':'Scores are uncalibrated model votes, not probabilities of correctness. Synthetic English evaluation is not evidence of clinical or learner benefit.'}
index = {word:i for i,word in enumerate(vocabulary)}
def predict(text):
    feats=features(text)
    known=[index[w] for w in feats if w in index]
    scores={label:model['logPriors'][label]+sum(weights[label][i] for i in known) for label in labels}
    maximum=max(scores.values())
    exp={k:math.exp(v-maximum) for k,v in scores.items()}
    votes={k:v/sum(exp.values()) for k,v in exp.items()}
    ordered=sorted(votes,key=votes.get,reverse=True)
    a=model['abstention']
    abstain=len(known)<a['minKnownFeatures'] or len(known)/max(1,len(feats))<a['minCoverage'] or votes[ordered[0]]<a['minVote'] or votes[ordered[0]]-votes[ordered[1]]<a['minMargin']
    return ordered[0],votes[ordered[0]],abstain
confusion={l:{p:0 for p in labels} for l in labels}
rows=[]
for actual,examples in data['holdout'].items():
    for text in examples:
        predicted,vote,abstain=predict(text)
        confusion[actual][predicted]+=1
        rows.append({'text':text,'actual':actual,'predicted':predicted,'vote':round(vote,4),'abstained':abstain})
correct=sum(r['actual']==r['predicted'] for r in rows)
accepted=[r for r in rows if not r['abstained']]
metrics={'evaluatedCount':len(rows),'correctCount':correct,'rawAccuracy':correct/len(rows),'acceptedCount':len(accepted),'acceptedCorrect':sum(r['actual']==r['predicted'] for r in accepted),'coverage':len(accepted)/len(rows),'confusionMatrix':confusion,'limits':'Small, author-created English holdout. Training and holdout share a fictional task; no external, multilingual, clinical, or educational-outcome validation.'}
model['evaluation']=metrics
(ROOT/'dist/model.js').write_text('window.BaseRateModel = '+json.dumps(model,separators=(',',':'))+';\n')
(ROOT/'model/evaluation.json').write_text(json.dumps({'metrics':metrics,'predictions':rows},indent=2)+'\n')
print(json.dumps(metrics,indent=2))
