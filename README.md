# BaseRate

A field guide to screening uncertainty for UnivaBio 2026. Count a fictional population, compare assumptions, predict the answer, then explain your reasoning to a small on-device AI coach.

**[Open the learning lab](https://nicholas-afk.github.io/baserate/)** · **[Demo and project materials](https://nicholas-afk.github.io/baserate/project.html)**

## Run locally

Clone the public repository and serve its `dist/` folder:

```sh
git clone https://github.com/Nicholas-afk/baserate.git
cd baserate
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. No app package installation, API key or account is needed. Python 3 runs the server/trainer; Node.js runs the verification suites. The app itself needs only a modern JavaScript-enabled browser. Use HTTP locally or HTTPS on Pages; clipboard support depends on browser permissions and a secure context. A displayed link provides a fallback if copying fails.

`main` contains the source, tests, documentation and four submission downloads in `dist/downloads/`. The existing `gh-pages` branch contains the contents of `dist/` at its root, with `.nojekyll`. GitHub Pages is configured for that branch and serves **`/baserate/`**, not the account root. All in-app assets, navigation and downloads use relative paths. To update this deployment, test `main`, update the source package/code PDF when source changes, commit the source, then copy the contents of `dist/` to the existing `gh-pages` branch and push it. Do not publish repository tooling, credentials or a raw voice recording. Confirm the Pages build and the actual served files and interactions after publishing; a successful build alone is insufficient. No bundler or environment-variable substitution is required.

The runnable source ZIP excludes the four submission downloads to avoid recursively packaging itself. Serve its `dist/` folder to use the app; obtain the demo and PDFs from the public materials page. The main repository includes those downloads. Raw narration and private video authoring files are excluded.

Read the [architecture and worked classifier explanation](docs/architecture.md), [data handling](docs/privacy.md) and [entrant walkthrough](docs/code-walkthrough.md) before presenting the project.

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

Loading the app downloads HTML, CSS, JavaScript and the trained model from GitHub Pages. The project page also requests the demo video's metadata/media. GitHub may retain ordinary request information. The application has no analytics, external scripts/fonts or remote inference calls.

Coach explanations and lesson answers stay in tab memory; the app does not persist them or send them to a server. Reload resets them. An explicit notebook export saves numeric predictions, case settings and first/final denominator choices to a file; it excludes coach explanations. A copied settings link contains only three validated fictional rates. External reference links contact their destination when followed. Optional WebMCP exposes experiment controls and coach review to a connected browser assistant; that assistant has its own conversation/data handling. These claims describe the app, not every browser extension or hosting provider. See the [full privacy scope](docs/privacy.md).

All rates and cases are fictional. The app does not diagnose, estimate a person's risk, interpret personal results, select a real test or recommend treatment. The prototype is English only. No independent learner study, clinical validation or measured health impact has been completed.

See the [full model card](docs/model-card.md), [deterministic audit](model/audit.json), [competition and product review](docs/research.md), and [entrant code walkthrough](docs/code-walkthrough.md). No exact train/holdout duplicates were found, but lexical disjointness does not make their shared synthetic authorship semantically independent. Publication and responsive browser checks are development QA, not a physical-device, screen-reader or learner study. The refreshed 109.4-second demo shows the final release. Its staged inputs are demonstration data, not a learner study; see [demo methods and claim qualifications](docs/demo.md).

## Research and design

Natural frequencies and explicit reference groups informed the grid/tree and denominator-first teaching. Hierarchy, restrained typography, spacing, meaningful labels and progressive disclosure informed the editorial interface. Sources support the underlying content and design choices, not this prototype's effectiveness:

- [Hoffrage et al., 2015, original natural-frequency study](https://pmc.ncbi.nlm.nih.gov/articles/PMC4604268/)
- [Gigerenzer, BMJ 2011, What are natural frequencies?](https://www.bmj.com/content/343/bmj.d6386)
- [National Cancer Institute, Cancer Screening Overview](https://www.cancer.gov/about-cancer/screening/patient-screening-overview-pdq)
- [Nielsen Norman Group, visual design principles](https://www.nngroup.com/articles/principles-visual-design/)
- [GOV.UK Design System, Details component](https://design-system.service.gov.uk/components/details/)

## Demonstration and next validation

The demo uses the entrant's supplied recording with one repetitive clause removed over edited screen-state captures of the actual final app, followed by a silent, annotated walkthrough of prediction, correction, export, comparison and repeat-test assumptions. It is not a continuous screen recording. No medical expertise, personal biography, clinical research or learner-testing results are claimed. The entrant must understand the implementation and be ready to explain it to judges.

Next steps: independently collected learner explanations, health-educator review, evaluated multilingual support, accessibility testing with users and a properly designed comprehension study. These are proposed work, not completed outcomes.

## License

MIT for original application source, documentation and synthetic dataset. Linked research retains its own rights. The entrant-provided narration is used for this competition demo; the source license does not grant rights to impersonate the entrant or reuse their voice. See [attribution and media scope](docs/attribution.md).
