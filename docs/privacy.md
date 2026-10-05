# Data handling and privacy scope

These statements describe BaseRate's application code, not every browser extension, connected assistant, operating system or hosting provider. The application has no backend, accounts, analytics, third-party scripts/fonts, remote inference endpoint or patient dataset.

| Action/data | What the app does | Boundary |
| --- | --- | --- |
| Load the lab | Requests HTML, CSS and seven JavaScript files, including trained model weights, from GitHub Pages | Hosting requests expose ordinary connection/request information to the host; caching may reuse files |
| Load the project page | Requests its HTML/CSS and demo video metadata/media (`preload="metadata"`); playback requests more media as needed | GitHub Pages hosting requests; no external video player is embedded |
| Edit fictional rates | Calculates and renders in the current tab | No request is initiated by the rate controls |
| Submit a coach explanation | Classifies locally and retains the text in JavaScript/DOM memory for revision | No app request sends the text; reload clears it. This is transient processing, not a claim of zero memory use |
| Complete the lesson | Retains first numeric predictions and first/final denominator choices in tab memory | No app persistence; reload resets progress |
| Export notebook | Creates a JSON Blob and saves a file on explicit request | Schema 2 includes fixed case settings, predictions, answer gaps, selected denominator choices and attempt counts; coach text is excluded. The downloaded file persists wherever the user/browser saves it |
| Copy settings link | Writes a URL to the clipboard, or displays it if copying fails | Contains only validated `p`, `se`, `sp` fictional rates and `#lab`; any existing query is removed. If shared/visited, query rates reach the hosting provider |
| Follow references/source links | Navigates to the external destination | Destination privacy policies and the browser's referrer policy apply; links use `noopener`, not universal referrer suppression |
| Use optional WebMCP | Registers two local tools when the browser supports them: experiment update and explanation review | A connected assistant can supply text/rates and receive a label/count summary. Its conversation, page access and data retention are governed separately; local app inference does not imply the assistant's work is private |

The app uses no `localStorage`, `sessionStorage`, IndexedDB, cookie-writing API or service worker. It makes no `fetch`, XMLHttpRequest, WebSocket or beacon calls. Static scripts/styles and video requests still occur. This is a source-level statement, not a claim that the browser/host never uses cookies, cache or telemetry. The app does not promise offline availability, secure file deletion or protection against a malicious extension. Do not enter real personal health information; the personal-query guard is imperfect.

## Verification scope

Publication QA compares served asset/download bytes with the release, audits source data flows, inspects browser-observed resources before/after a synthetic explanation and checks an actual notebook download. Browser resource inventory is not a packet capture of every browser or extension request. Automated credential-signature and filename scans cover reachable public history and source archives; they do not prove absence of every possible secret. Specific measured release results are recorded in the entrant's continuation ledger rather than presented as a privacy certification.

## Public materials

The public repository intentionally includes the app, synthetic data, trainer, audit, tests, educational documentation, PDFs, source ZIP and final competition demo. Raw narration files, private hosting metadata, personal contact details, credentials, unrelated work and disposable QA pages are excluded. The demo uses entrant-authorized narration; the raw recording is not distributed. See [attribution](attribution.md) for media rights.
