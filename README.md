# BaseRate

A field guide to screening uncertainty for UnivaBio 2026. Count a fictional population, compare assumptions, predict the answer, then explain your reasoning to a small on-device AI coach.

**[Open the learning lab](https://nicholas-afk.github.io/baserate/)** · **[Demo and project materials](https://nicholas-afk.github.io/baserate/project.html)**

## Run locally

Serve `dist/` with any static HTTP server: `python3 -m http.server 8000 --directory dist`, then open http://localhost:8000. No package installation, API key, account or remote inference is needed. The application also works from a local folder; hosting and clipboard features are best used over HTTP. Optional downloadable submission materials are included on the hosted project page.

## Working features

- Three fictional test presets, live sliders and editable numeric rates.
- A 1,000-person square grid, positive-only focus and natural-frequency tree using the same underlying counts.
- Exact expected outcomes, explicit denominator and positive predictive value (PPV).
- Pin experiment A while varying B; compare outcomes and PPV changes in percentage points.
- A prevalence curve using the current test, with an equivalent accessible table.
- A conditional second-test explorer: independent identical tests, perfectly repeated results or explicit conditional rates. Assumptions are visible; a repeated result can add no information.
- Three predict/reveal/denominator cases requiring correction before progression; first numeric guesses and first/final denominator choices retained in a numeric notebook. No coach explanation enters the export.
- Local AI topic suggestions with learner override, five factual self-checks and an explanation-revision step; inspect influential features, coverage and uncalibrated votes.
- Conservative uncertainty handling, personal-health query guard and readable missing-model fallback.
- Keyboard controls, labelled inputs, patterned outcomes, responsive layout, printable worksheet and validated share links containing only fictional rates.
- Optional feature-detected WebMCP controls that operate on the same visible state.

## Reproduce and verify

Training uses only Python's standard library. `python3 model/train.py` reproduces the distributed model and evaluation. Tests use only Node's standard library:

```sh
node tests/verify.cjs
node tests/extensions.cjs
node tests/learning.cjs
node tests/display.cjs
node tests/coaching.cjs
python3 model/audit.py
```

The checks cover 336 base arithmetic/rounding combinations, 2,525 prevalence-curve points, 405 conditional second-test combinations, all three lesson equations, invalid inputs, immutable experiment snapshots, undefined denominators, count conservation, precise tiny-count display, text-free exports and missing-model feedback. Python/browser inference parity is checked on all 30 holdout examples. Manual browser checks covered lesson progression/restart, rate/link validation, comparison pinning, conditional presets, local feedback and a 390-pixel layout without horizontal overflow.

## AI, data and limitations

A Multinomial Naive Bayes model uses learned word and adjacent-word features, additive smoothing (alpha 0.7), and five educational reasoning labels. The original synthetic dataset contains 100 English training explanations and 30 separately authored synthetic holdout examples from the same project; no patient data are used.

The raw synthetic holdout result is **29/30 correct**. Uncertainty checks accept 28/30 explanations, with 27/28 correct accepted labels. One correct distinction between sensitivity and PPV is misread. See `model/evaluation.json` for complete predictions and confusion matrix. These are small synthetic development checks, not an external benchmark, clinical validation, calibrated confidence or evidence of learning or health benefit. No holdout sentences were moved into training to hide the known error.

The model's votes are uncalibrated and may fail on negation, mixed reasoning, unfamiliar language or wording. The classifier proposes a topic; it cannot verify an explanation. Feedback policy 1.1 makes all inferred topics provisional, permits override, and checks only a selected factual answer. A 24-case diagnostic audit found semantic failures and reduced explicit praise of flawed/mixed explanations from 2/10 to 0/10 through feedback wording; raw classifications are unchanged. This is not an accuracy or learning-benefit improvement. Its fixed responses are inspectable in `dist/coach.js`. Screening arithmetic runs separately from the model. Conditional second-test rates apply only among first-positive people; reusing unconditional rates requires the displayed independence assumption.

Only squares are rounded with largest remainders, preserving 1,000 squares. Mathematical expectations and PPV use unrounded values. Display precision adapts for small nonzero counts so a defined denominator never appears as 0/0.

## Privacy

No analytics, external scripts/fonts, inference requests or stored learner explanations. Text and lesson guesses stay in tab memory and disappear on reload. A notebook export contains only numeric predictions, case settings and selected denominator choices. Settings links contain only three validated fictional rates. Hosting providers may keep ordinary request logs. Reference links lead to external source sites.

All rates and cases are fictional. The app does not diagnose, estimate a person's risk, interpret personal results, select a real test or recommend treatment. The prototype is English only. No independent learner study, clinical validation or measured health impact has been completed.

See the [full model card](docs/model-card.md), [deterministic audit](model/audit.json), [competition and product review](docs/research.md), and [entrant code walkthrough](docs/code-walkthrough.md). No exact train/holdout duplicates were found, but lexical disjointness does not make their shared synthetic authorship semantically independent.

## Research and design

Natural frequencies and explicit reference groups informed the grid/tree and denominator-first teaching. Hierarchy, restrained typography, spacing, meaningful labels and progressive disclosure informed the editorial interface. Sources support the underlying content and design choices, not this prototype's effectiveness:

- [Hoffrage et al., 2015, original natural-frequency study](https://pmc.ncbi.nlm.nih.gov/articles/PMC4604268/)
- [Gigerenzer, BMJ 2011, What are natural frequencies?](https://www.bmj.com/content/343/bmj.d6386)
- [National Cancer Institute, Cancer Screening Overview](https://www.cancer.gov/about-cancer/screening/patient-screening-overview-pdq)
- [Nielsen Norman Group, visual design principles](https://www.nngroup.com/articles/principles-visual-design/)
- [GOV.UK Design System, Details component](https://design-system.service.gov.uk/components/details/)

## Authorship and next validation

Code, synthetic data, educational copy, interface and submission materials were created with extensive AI assistance at the entrant's direction. The demo uses the entrant's supplied recording over captured states of the actual app, followed by a visual feature tour. No medical expertise, personal biography, clinical research or learner-testing results are claimed. The entrant must understand the implementation and be ready to explain it to judges.

Next steps: independently collected learner explanations, health-educator review, evaluated multilingual support, accessibility testing with users and a properly designed comprehension study. These are proposed work, not completed outcomes.

## License

MIT for original application source and synthetic dataset. Linked research retains its own rights. The entrant-provided narration is used for this competition demo; the source license does not grant rights to impersonate the entrant or reuse their voice.
