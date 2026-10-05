# Architecture and explanation guide

BaseRate is a static browser application. It has no backend, database, account system, API key or app dependencies. GitHub Pages serves `dist/` at `https://nicholas-afk.github.io/baserate/`. Assets and download links are relative to this path. The model is downloaded once as ordinary JavaScript; inference then runs synchronously on the device.

## Modules and data flow

The deferred scripts in `dist/index.html` execute in this order:

| Module | Responsibility |
| --- | --- |
| `science.js` | Pure expected-count math, rounded squares, comparisons, curve and conditional repeat testing |
| `model.js` | Generated vocabulary, class priors, learned log likelihoods, thresholds and original evaluation summary |
| `coach.js` | Text features, classification, fixed provisional feedback, factual questions and answer checks |
| `learning.js` | Three fixed cases, predictions, denominator feedback and schema-2 export data |
| `app.js` | Input validation, base experiment views and visible coach state |
| `lab-tools.js` | Frequency tree, pinned comparison, curve/table, repeat explorer and settings link |
| `learning-ui.js` | Guided lesson progression and requested notebook download |

Editing a valid rate updates one unrounded calculation. The grid, counts and equation share that result. A `baserate:experiment` event supplies copies of settings/counts to the extra lab views. Pinning stores a snapshot of A; changing B cannot mutate A. Lesson cases have their own fixed settings and do not use the current sliders.

Submitting an explanation stores it in tab memory and calls the classifier. Its label suggests a topic; the learner can override it. A separate factual check calls the math module or uses a fixed scope/evidence answer. Changing rates rebuilds that check and clears any old answer status. A new explanation resets the suggested topic; loading an example clears the previous check. No generated medical facts or text-based correctness score are used.

## Screening arithmetic

For 1,000 people, convert percentages to proportions `p`, `s`, `c`:

```text
TP = 1000 * p * s             FN = 1000 * p * (1 - s)
FP = 1000 * (1 - p) * (1 - c) TN = 1000 * (1 - p) * c
PPV (%) = 100 * TP / (TP + FP)
```

A zero positive denominator yields `null` (undefined), not zero. Only the 1,000 squares are rounded, using largest remainders to conserve their total. Tables, PPV, comparisons and answers use unrounded expectations; fractional counts describe an expected population rather than literal partial people.

At 1% prevalence, 90% sensitivity and 95% specificity: TP=9, FP=49.5, FN=1, TN=940.5. Sensitivity starts with the 10 condition cases; PPV starts with the 58.5 positives. PPV is 15.3846%, displayed as 15.4%. At 20% prevalence with the same test it is 81.8182%.

The curve evaluates 101 prevalence points for the current test and offers the same information in a table. A second test is applied **only among first-positive people**: second true positives = first TP times conditional detection, second false positives = first FP times conditional false-positive rate. The independent-identical preset assumes independence within condition/non-condition groups; reusing 90%/5% gives 8.1 TP and 2.475 FP, PPV 76.5957%. Perfectly repeated results use conditional 100%/100% and leave PPV at 15.3846%. These are explicit fictional assumptions, not recommendations about actual repeat tests.

## How the text classifier learns and runs

`model/train.py` uses 100 synthetic English sentences, 20 per class. The five original labels are `balanced`, `certainty`, `sensitivity`, `base_rate`, `dismissal`. They describe predefined patterns in synthetic text, not assessed learner competence. The mapping to review topics is inspectable in `app.js`.

1. Lowercase text, normalize curly apostrophes, and find ASCII letter sequences (`[a-z]+`). Numbers are not features.
2. Keep single words except the published stop-word list. Also keep adjacent-word pairs from the original word sequence, including stop words in pairs. Repeated features are counted, rather than deduplicated.
3. Build a sorted vocabulary from training only. Count each feature within each class.
4. Store `log((feature count + 0.7) / (all feature counts in class + 0.7 * vocabulary size))`. This additive smoothing gives unseen-in-class vocabulary features a finite weight.
5. Store log class priors. With 20 examples per class, each prior is 1/5.

At inference, unknown features are ignored. Each class score is its log prior plus the learned log weights of all known feature occurrences. Subtract the maximum score, exponentiate, and normalize to produce relative votes. This softmax-like normalization is numerically stable, but its votes are **uncalibrated**: 98% vote does not mean 98% chance of correct reasoning.

The prototype withholds a topic if fewer than four known feature occurrences remain, known-feature coverage is below 18%, the top vote is below 65%, or the top-minus-second vote is below 20 percentage points. Coverage includes repeated features. The UI shows up to four unique known features whose weights favor the top class over the runner-up; these are associations, not a complete semantic explanation. Empty text, heuristic personal queries and missing-model states are handled before normal inference. Input is limited to 1,800 characters.

High votes can still be wrong. Negation, quotations and mixed claims defeat this lexical method. The current feedback policy therefore proposes a review topic rather than declaring correctness or a misconception. Selected-answer feedback is deterministic and does not verify the free-text explanation. Missing model data leaves math/practice available and permits manual topic checks.

## Reproduction and evidence

Python 3 and Node.js standard libraries suffice for training/audit/tests; the app requires neither at runtime. `python3 model/train.py` deliberately rewrites `dist/model.js` and `model/evaluation.json`. Prefer `python3 model/audit.py` for verification: it trains in a temporary directory and compares bytes without changing the release. `--write` intentionally updates the audit artifact.

The original synthetic holdout has 30 sentences: 29 raw correct labels, 28 accepted by the gates, 27 accepted labels correct. Training/holdout have no exact duplicates but share synthetic authorship and claim patterns. The 24 diagnostic probes are development regressions, not a new independent benchmark. See the [model card](model-card.md) for known failures and [README](../README.md) for the five verification commands. No independent learning benefit, clinical accuracy or real-user generalization has been demonstrated.

## Explain it to judges

Walk through the 9/58.5 denominator, pin A before raising prevalence, and show why perfect repetition adds no information. Predict before revealing a lesson answer, select a wrong denominator, then correct it. Use a known classifier failure and explain why the topic is provisional; demonstrate a manual override and factual check. Explain that math is exact within invented assumptions while language classification is limited. The [entrant walkthrough](code-walkthrough.md) has a presentation route; it is preparation material, not proof that the entrant understands the code.
