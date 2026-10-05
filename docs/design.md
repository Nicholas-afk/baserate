# BaseRate learning-lab upgrade — 5 October 2026

The entrant has delegated design, execution, public GitHub hosting, and continued improvement. The audience is students and general readers learning to interpret fictional screening statistics. Success means a usable learning journey, inspectable mathematical reasoning, useful AI feedback, and credible competition evidence. No claim about winning, clinical accuracy, or measured learning benefit is supported.

## Design direction

Use the visual language of a field notebook: paper-colored canvas, ink text, Georgia headings, compact system sans-serif controls, ruled divisions and tabular numbers. Avoid gradients, decorative badges, shadowed card grids, and stock medical illustrations. Color encodes outcomes consistently; labels and patterns also distinguish outcomes. The primary task starts near the top. Preserve keyboard use, narrow-screen reflow, visible focus, and reduced-motion preferences.

The direction draws on NN/g's scale, hierarchy, contrast and proximity principles (https://www.nngroup.com/articles/principles-visual-design/) and GOV.UK's advice to disclose optional detail without hiding essential information (https://design-system.service.gov.uk/components/details/). These are design guidance, not evidence that a specific aesthetic is less AI-generated.

## Product

1. **Explore:** preserve the accurate 1,000-person simulation, add number inputs alongside sliders, population and frequency-tree views, a visible denominator equation, and links containing only fictional rate settings.
2. **Compare:** pin an immutable experiment A and manipulate experiment B. Show both denominators, expected counts and percentage-point differences. A continuous SVG prevalence curve uses the current test's sensitivity/specificity; a table provides equivalent values.
3. **Repeat testing:** demonstrate a second test among first-positive people using explicitly conditional detection and false-positive rates. An independent-test preset uses 90% and 5%; a perfectly repeated-result preset uses 100% and 100%, yielding no new information. Keep assumptions and the statement that this is not a real testing recommendation beside the controls.
4. **Practice:** three fictional cases (1/90/95, 20/90/95, 1/90/99). Predict a percentage before revealing counts, then identify the denominator. Retain first guesses and arithmetic error in memory for this tab only, offer a JSON learning-notebook export, and provide deterministic explanations. This is practice, not a validated assessment.
5. **Teach back:** preserve the trained 100-example NB model and its unchanged 30-example evaluation. Expose model alternatives, coverage, influential features and uncalibrated votes on demand. Connect model feedback to a relevant next exercise. Text remains transient and local. Never silently reinterpret the synthetic evaluation as learner outcomes.

## Interfaces and safety

`science.js` owns all arithmetic: calculate, roundedCounts, compare, prevalenceCurve, sequential. `learning.js` owns immutable case content and numeric grading; `learning-ui.js` owns the practice state. `lab-tools.js` owns comparisons, curve, sequence, settings links and notebook export. Existing `app.js` owns the base experiment and AI coach and dispatches `baserate:experiment` with validated settings/counts.

Rates passed to math are finite percentages 0–100; population must be positive. UI prevalence is 0.1–50%, detection/clearance 1–100%. Sequence conditional rates permit 0–100%. Null proportions are shown as undefined. Diagrams round only for display, all calculations use raw expected counts. Learner explanations are never included in links or exported notebooks. No analytics, remote inference or data storage is added.

## Deliverables

Publish a clean public source repository `Nicholas-afk/baserate`, deploy `dist` on a `gh-pages` branch, and verify the resulting live URL. Replace the prior synthetic voice with the supplied recording without cloning the voice or inventing spoken content. Capture the new working interface and retime the video to the actual recording. Update the one-page description, complete-code PDF, source ZIP and Devpost draft. Leave final prize submission for the required user handoff.
