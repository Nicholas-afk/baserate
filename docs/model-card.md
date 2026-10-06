# BaseRate local coach: model 1.0.0, feedback policy 1.1

## Intended use and behavior

English educational explanations of fictional screening examples. A Multinomial Naive Bayes classifier proposes a review topic. It does not verify the explanation, grade understanding or interpret a person's test result. Arithmetic is calculated separately in `dist/science.js`.

The five original labels are `balanced`, `base_rate`, `sensitivity`, `certainty`, and `dismissal`. The UI maps them to a positive-group, starting-population, condition-group, uncertainty, or benefits/harms topic. Labels, votes, features and coverage remain inspectable as model diagnostics. Learners can choose another topic, answer a fixed factual question, inspect counts/reference groups, and revise their explanation. Correctness feedback applies only to the selected answer.

Personal-query and unfamiliar/empty/missing-model guards remain. These are imperfect scope heuristics, not a guarantee of detecting every personal question. Missing model data still permits manual topic selection and model-independent questions. The app makes no remote inference or analytics calls. Explanations are processed and retained in tab memory, without persistent app storage or server transmission; notebook exports omit them. Static app/model downloads still contact GitHub Pages, which may log requests. Optional connected browser assistants have separate data handling. See [privacy scope](privacy.md) and [architecture](architecture.md) for exact data flow and classifier equations.

## Training and original evaluation

`model/dataset.json` contains 100 synthetic English training sentences and 30 separately authored synthetic holdout sentences. Both subsets were authored within the same project. They are not independently collected learner data. Word and adjacent-word counts, additive smoothing alpha 0.7, class priors and learned likelihoods are implemented by the standard-library Python trainer and browser inference.

Run `python3 model/train.py` to reproduce the distributed artifacts. Run `python3 model/audit.py` to reproduce and compare them in a temporary directory, check the split, and rerun the archived/current feedback probes. The audit does not modify the model or evaluation. `--write` regenerates the deterministic audit artifact after an intentional change. Node and Python standard libraries suffice.

Reproduction verified byte-identical `dist/model.js` and `model/evaluation.json`. Original holdout: 29/30 raw labels correct; uncertainty gates accept 28, of which 27 are correct. These are synthetic development results, not clinical accuracy, calibrated confidence or a broad language benchmark. Weights, thresholds, data and holdout are unchanged by feedback policy 1.1. All 24 diagnostic probe classifications are unchanged. There is no claim of improved classifier accuracy.

## Split distinctness and known errors

The deterministic split audit found zero exact sentence duplicates. Mean nearest-training token Jaccard similarity is 0.333; none reaches 0.5. The nearest training sentence has the same expected label for 23/30 holdout sentences. These lexical checks do not establish meaningful semantic independence: the subsets share authorship, task, claim types and vocabulary. They test phrasing variation within a small synthetic task. No holdout example was moved into training, removed or relabeled to hide an error.

The known holdout error is a correct sentence distinguishing sensitivity from probability among positives. It receives the sensitivity-confusion label with an uncalibrated vote of about 98.1%. The model cannot reliably resolve negation, reported speech, qualifiers or conflicting ideas from lexical counts.

`model/probes.json` adds 24 developer-authored diagnostic cases: 8 correct explanations, 6 mixed claims, 6 ambiguous statements and 4 clear misconceptions. They were used to choose this feedback change and are development regressions, not a pristine new test set. `model/audit.json` preserves each sentence, intent, classification and old/new response.

Examples of failures:

- “All positives are actual cases, without exception.” receives `balanced` (76.4% vote), despite its false certainty.
- A mixed explanation that notes numerous false positives and concludes that the test is completely useless receives `balanced` (approximately 100% vote).
- A correct sensitivity/PPV distinction, a correct denial of certainty, and reported speech can receive misconception labels with high votes.
- Neutral short observations such as sensitivity being 90% or the existence of false positives cannot establish the learner's reasoning, yet can pass the model's gates.

Five of eight correct diagnostic explanations were accepted as a misconception-pattern label. This small targeted set deliberately stresses known weaknesses; its ratio is not an estimate of real-world error frequency. Uncalibrated model votes measure the model's relative fit, not probability that a learner is wrong.

## Why feedback changed instead of retraining

The evidence points to semantic limitations and unsafe endorsement, not an arithmetic defect. Adding these same diagnostic sentences to training would invalidate a later claim of generalization on them. Independently collected new data and a genuinely separate evaluation are unavailable. Deadline-conscious policy 1.1 therefore preserves the auditable model and changes the educational contract:

1. All classified/uncertain responses are explicitly provisional. No inferred label confirms correctness or declares a misconception.
2. Learners confirm or override a topic through a visible selection control.
3. A factual multiple-choice check uses current fictional counts or a fixed evidence/scope distinction. It tells the learner exactly what the selected answer establishes.
4. Changing the experiment clears an answered check and recalculates its question; manually chosen topics persist. New explanation submissions reset the topic suggestion.
5. Learners can return directly to revise their unchanged explanation. There is no fabricated generative critique or score.

Among the 10 flawed/mixed diagnostic cases, the archived response used an explicit praise title for 2; current feedback does so for 0. Every current classified diagnostic response is provisional. This measures feedback wording, not model improvement, comprehension or health benefit. The model can still suggest an irrelevant topic; override and factual checking reduce the consequence without solving the classification limitation.

## Learning evidence and remaining limits

The guided lesson now explains the actual ratio implied by each wrong denominator and requires a corrected positive-group choice before progression. Notebook schema 2 retains first and final denominator choices and number of selections, alongside first numeric predictions. This makes observed correction visible. Selection counts are not equivalent to effort, mastery or learning gain.

Automated tests cover all five topic questions, correct/wrong answers, unknown choices, invalid rates, no-condition and perfect-specificity edges, case feedback and text-free exports. Actual browser checks assess rendering and interaction. development code review and synthetic critiques are development QA. No real learner study, educator review, clinical validation, multilingual evaluation or assistive-technology user study has occurred.

Future claims should use independently collected explanations, adjudicated ambiguous/mixed cases, untouched evaluation sets, calibrated abstention analysis and transfer/delayed learning measures. The current prototype is intentionally limited to fictional educational use.


## Demo interpretation

The refreshed demo shows feedback policy 1.1 and the unchanged 1.0.0 classifier. The narrated 29/30 result is a raw same-project synthetic holdout result; it does not include abstention or establish independent generalization. Accepted-label results are 27 correct of 28 accepted. Selected factual answers are checked separately from inferred topics. See [the demo claim qualifications](demo.md).
