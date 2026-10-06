# Entrant code walkthrough

UnivaBio requires entrants to understand and explain their code. This guide supports preparation; it does not certify that the entrant understands the implementation.

## Explain the result first

In 1,000 fictional people with 1% prevalence, 10 have the condition. A 90% sensitive test detects 9. Of 990 people without the condition, 5% test positive: 49.5 expected false positives. The relevant denominator is all positive results, 58.5, so PPV is 9/58.5 = 15.4%. Sensitivity starts with the condition group; PPV starts with the positive group.

## Find the implementation

- `dist/science.js`: validate finite rates; compute TP/FN/FP/TN; divide TP by TP+FP; return undefined for an empty denominator. Preserve fractional expectations. Largest-remainder rounding supplies exactly 1,000 illustrative squares without changing the math.
- `dist/app.js`: synchronize inputs and representations; render coach feedback. Model suggestions and mathematical questions are separate. Current experiment changes recalculate a displayed factual check and remove its previous answer status.
- `dist/lab-tools.js`: immutable pinned experiment, prevalence curve/equivalent table, and conditional second test. Independence is assumed within each condition group, not inferred from seeing two positives. Perfectly repeated results use conditional rates 100%/100%, so PPV does not change.
- `dist/learning.js` and `learning-ui.js`: three fixed cases; save the first estimate; explain wrong reference groups; require correction; export numeric/selected choices only. The lesson is separate from exploratory slider settings.
- `model/train.py`, `dist/model.js`, `dist/coach.js`: train synthetic word/bigram likelihoods; score labels using sums of log probabilities; convert relative scores to uncalibrated votes; apply coverage/separation and scope guards. Fixed feedback is chosen locally. This is not a remote language model.
- `model/audit.py`: independently rerun training in a temporary directory, compare exact bytes, measure lexical split overlap, and compare old/new responses on diagnostic probes.

## Demonstrate the limitation honestly

Enter “All positives are actual cases, without exception.” The classifier can suggest the positive-group topic even though the explanation is wrong. The UI does not endorse it. Choose the factual positive-group check: 9 of 58.5 positive results are actual cases in the default example. The learner can override the topic and revise their own sentence. Explain why the model's 76.4% vote is not a probability of correct reasoning.

Run the five Node suites and `python3 model/audit.py`. Explain what they establish (specified mathematical and interface behavior, deterministic reproduction) and what they do not (real learner benefit, clinical validity or broad semantic accuracy). Be ready to trace one input from validation through pure calculation to display, and one explanation from tokenization to provisional feedback.
