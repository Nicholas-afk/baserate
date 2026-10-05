# BaseRate Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Deepen the educational prototype, redesign its interface, use the entrant's voice and publish on the requested GitHub account.

**Architecture:** Static, dependency-free browser application. Pure arithmetic and learning modules feed separate UI controllers, with a visible experiment-change event.

**Tech Stack:** HTML/CSS/JavaScript, Node assertions, standard-library Python trainer, HyperFrames, local WhisperX, ReportLab, GitHub Pages.

**Spec:** docs/design.md

## Global Constraints

- All rates and scenarios are fictional; no personal risk or test recommendation.
- Learner text is transient and local, excluded from links and notebook export.
- Preserve the existing 100/30 synthetic model evaluation and disclose limitations.
- Handle undefined denominators, finite rate validation, keyboard access and 390px screens.
- Public hosting and source on Nicholas-afk are explicitly requested; final prize entry requires handoff.

## Review Focus

- Empty/invalid URL rates must not reset or corrupt the app.
- Pinning A must remain immutable while B changes.
- Repeat testing must use conditional rates rather than silently assume independence.
- Changing cases and restarting must clear stale results and guesses.
- Missing model, undefined proportions, and imported links must have readable fallback behavior.

### Task 1: Mathematical extensions

**Files:** Modify dist/science.js; create tests/extensions.cjs.
**Interfaces:** compare(a,b) consumes three-rate objects and returns both counts and deltas; prevalenceCurve(sensitivity,specificity) returns 101 {prevalence,ppv} points from 0 to 50; sequential(first,conditionalDetection,conditionalFalsePositive,population=1000) returns first counts, both-positive counts, PPV and rejected true/false positives.

- [x] Write tests for rare/common deltas, curve monotonicity, undefined denominators, independent and repeated outcomes, invalid rates and conservation.
- [x] Run tests and verify failure on missing exports.
- [x] Implement pure functions and run old plus new tests to PASS.
- [x] Commit and record evidence.

### Task 2: Guided practice

**Files:** Create dist/learning.js, dist/learning-ui.js, tests/learning.cjs.
**Interfaces:** BaseRateLearning.cases contains three settings/prompt/explanation entries; gradePrediction(caseId,guess) returns numeric error and counts; notebook(answers) returns only settings, numeric guesses/results and denominator answers.

- [x] Test exact case calculations, 0/100 and invalid guesses, no learner-text export, and unknown cases.
- [x] Verify failure, implement pure module, then PASS.
- [x] Implement predict/reveal/denominator/next/restart flow in session memory.
- [x] Commit and record evidence after the core tests pass.

### Task 3: Interface and connected lab tools

**Files:** Replace dist/index.html and dist/style.css; modify dist/app.js; create dist/lab-tools.js; update project.html.
**Interfaces:** app.js dispatches baserate:experiment with {settings,counts}; lab-tools consumes it and science; BaseRateLesson exposes notebook()/restart().

- [x] Implement the notebook visual system, numeric controls, accessible tree/table, pin/compare, curve, conditional second test, settings links and model diagnostics.
- [x] Run old/new suites, browser-check controls, practice transitions, link validation, snapshot pinning, undefined sequence and mobile overflow.
- [x] Inspect desktop and mobile screenshots; commit and record evidence.

### Task 4: Publication and truthful competition package

**Files:** README/SUBMISSION, PDFs/ZIP, video composition and voice assets, clean public repository, competition-state.json.

- [x] Transcribe the provided voice, verify spoken claims and synchronize actual captures to it.
- [x] Run video validation, inspect midpoint/cut snapshots, render and verify duration/audio.
- [x] Regenerate the complete source package and one-page PDF, inspect both.
- [x] Create/push requested public GitHub repository, enable Pages and verify live resources.
- [x] Update saved Devpost links, story and preview using browser UI; preserve final submission handoff.
- [x] Complete fresh code review under executing-plans, fix material findings with regression tests, and record final results.

Historical publication receipts (before feedback policy 1.1): GitHub main 200bc13; Pages gh-pages 04b81c7e237d0d097cb9f2af339c8d0780a8b642. Live app, project page and four downloads return HTTP 200 and match source bytes. Four test suites pass on the clean public source. 84-second H264/AAC demo uses supplied voice; integrated loudness -16.7 LUFS, true peak -1.54 dBTP. Description 1 page, complete code 101 pages, source ZIP 21 files, visually inspected. Devpost was already Submitted (5/5) when opened; upgraded story, links, cover, tags and gallery saved without invoking final Submit. Embedded-video field remains empty pending action-time YouTube terms approval.

Current revision: provisional and overridable coach topics, five factual self-checks, explanation revision, denominator correction before progression, notebook schema 2, and a reproducible semantic/split audit. Original classifier weights and evaluation are preserved. See docs/research.md and docs/model-card.md for the current evidence and deadline policy. Five test suites pass; the subsequent AI review finding about stale example feedback is fixed with an actual-handler regression.
