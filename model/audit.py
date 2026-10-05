"""Reproduce the model, inspect lexical split proximity, and compare feedback policies.

Python and Node standard libraries only. Probes are development cases used to
improve feedback, NOT an independent benchmark or evidence of learning benefit.
"""
import argparse
import difflib
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]


def audit():
    with tempfile.TemporaryDirectory(prefix='baserate-audit-') as directory:
        temporary = Path(directory)
        (temporary / 'model').mkdir()
        (temporary / 'dist').mkdir()
        for name in ['train.py', 'dataset.json']:
            shutil.copy2(ROOT / 'model' / name, temporary / 'model' / name)
        subprocess.run([sys.executable, str(temporary / 'model/train.py')],
                       check=True, capture_output=True, text=True)
        reproduction = {name: (ROOT / name).read_bytes() == (temporary / name).read_bytes()
                        for name in ['dist/model.js', 'model/evaluation.json']}
    data = json.loads((ROOT / 'model/dataset.json').read_text())
    training = [(label, text) for label, texts in data['train'].items() for text in texts]
    holdout = [(label, text) for label, texts in data['holdout'].items() for text in texts]

    def tokens(text):
        return set(re.findall(r'[a-z]+', text.lower()))

    def similarity(left, right):
        a, b = tokens(left), tokens(right)
        return len(a & b) / max(1, len(a | b))

    neighbors = []
    for label, text in holdout:
        nearest_label, nearest = max(training, key=lambda pair: similarity(text, pair[1]))
        neighbors.append({'holdout': text, 'label': label, 'nearestTrain': nearest,
                          'nearestLabel': nearest_label,
                          'tokenJaccard': round(similarity(text, nearest), 3),
                          'sequenceRatio': round(difflib.SequenceMatcher(None, text.lower(), nearest.lower()).ratio(), 3)})
    javascript = r'''
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=process.argv[1],science=require(path.join(root,'dist/science.js'));
const before=require(path.join(root,'model/feedback-v1.cjs')),after=require(path.join(root,'dist/coach.js'));
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'dist/model.js'),'utf8'),context);
const model=context.window.BaseRateModel,counts=science.calculate(1,90,95);
const rows=JSON.parse(fs.readFileSync(path.join(root,'model/probes.json'),'utf8')).probes.map(probe=>{
 const original=before.classify(probe.text,model),current=after.classify(probe.text,model);
 const oldFeedback=before.feedback(original,counts),feedback=after.feedback(current,counts);
 return {...probe,rawLabel:current.rawLabel,label:current.label,vote:current.vote,coverage:current.coverage,
  abstained:current.abstained,classificationUnchanged:JSON.stringify(original)===JSON.stringify(current),
  originalTitle:oldFeedback.title,currentTitle:feedback.title,provisional:feedback.provisional,
  originalPraise:oldFeedback.title==='You are connecting the pieces.',currentPraise:feedback.title==='You are connecting the pieces.'};
});
process.stdout.write(JSON.stringify(rows));
'''
    rows = json.loads(subprocess.run(['node', '-e', javascript, str(ROOT)],
                                     check=True, capture_output=True, text=True).stdout)
    flawed = [row for row in rows if row['group'] in ['mixed', 'misconception']]
    correct = [row for row in rows if row['group'] == 'correct']
    metrics = json.loads((ROOT / 'model/evaluation.json').read_text())['metrics']
    return {
        'purpose': 'Reproducible internal audit. Same-author synthetic splits and development probes; no independent learner, clinical or learning-outcome evidence.',
        'modelReproduction': reproduction,
        'sha256': {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest()
                   for name in ['model/train.py', 'model/dataset.json', 'dist/model.js', 'model/evaluation.json', 'model/probes.json']},
        'reportedMetricsReproduced': metrics,
        'split': {'trainingCount': len(training), 'holdoutCount': len(holdout),
                  'exactSentenceOverlap': len(set(t for _, t in training) & set(t for _, t in holdout)),
                  'meanNearestTokenJaccard': round(sum(r['tokenJaccard'] for r in neighbors) / len(neighbors), 6),
                  'nearestTokenJaccardAtLeastHalf': sum(r['tokenJaccard'] >= .5 for r in neighbors),
                  'sameLabelNearest': sum(r['label'] == r['nearestLabel'] for r in neighbors),
                  'limitations': 'Token/sequence similarity cannot establish semantic independence. Both splits reuse familiar claim types and authoring style.',
                  'nearestNeighbors': neighbors},
        'developmentProbes': {'count': len(rows), 'classificationUnchanged': all(r['classificationUnchanged'] for r in rows),
                              'flawedOrMixedCount': len(flawed),
                              'originalPraisedFlawedOrMixed': sum(r['originalPraise'] for r in flawed),
                              'currentPraisedFlawedOrMixed': sum(r['currentPraise'] for r in flawed),
                              'correctProbesAcceptedAsMisconceptionPattern': sum(r['label'] in ['sensitivity', 'certainty', 'base_rate', 'dismissal'] for r in correct),
                              'correctProbeCount': len(correct),
                              'allCurrentResponsesProvisional': all(r['provisional'] for r in rows),
                              'limitations': 'These author-labeled probes informed this feedback revision. Fewer praising titles measures response wording, not classification accuracy, misconception detection or learning gain.',
                              'rows': rows},
        'feedbackPolicy': '1.1: provisional, overridable review topics; separate factual self-checks. Model/data/holdout unchanged.'
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true', help='write the deterministic audit artifact')
    args = parser.parse_args()
    result = audit()
    serialized = json.dumps(result, indent=2, ensure_ascii=False) + '\n'
    artifact = ROOT / 'model/audit.json'
    if args.write:
        artifact.write_text(serialized)
    elif not artifact.exists() or artifact.read_text() != serialized:
        raise SystemExit('Audit artifact is absent or stale. Inspect changes, then run with --write.')
    if not all(result['modelReproduction'].values()):
        raise SystemExit('Distributed model/evaluation did not reproduce byte for byte.')
    print(json.dumps({'result': 'PASS', 'reproduction': result['modelReproduction'],
                      'split': {k: v for k, v in result['split'].items() if k != 'nearestNeighbors'},
                      'probes': {k: v for k, v in result['developmentProbes'].items() if k != 'rows'}}, indent=2))
