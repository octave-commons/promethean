---
title: "Add integration test for markdown graph and embedding service"
status: "open"
created: "8/5/2025, 11:14:33 PM"
url: "https://github.com/riatzukiza/promethean/pull/264"
opened_by: "riatzukiza"
assignees: []
requested_reviewers: []
updateMode: "append"
allowDelete: true
---

# Add integration test for markdown graph and embedding service
## Summary
- test markdown graph/embedding integration
- harden STT/LLM/TTS pipeline test with extra stubs and optional TTS import

## Testing
- make setup-python-service-embeddingservice *(fails: KeyboardInterrupt)*
- pip install -r services/py/markdowngraph/requirements.txt
- make build
- make lint
- make format
- make test-integration


- - -- - -
https://chatgpt.com/codex/tasks/taske6892d39af0648324b2eff018325b20e4


## Comments

### codecov[bot] commented (8/5/2025, 11:17:36 PM):

## [Codecov](https://app.codecov.io/gh/riatzukiza/promethean/pull/264?dropdowncoverage&srcpr&elh1&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers) Report
:whitecheckmark: All modified and coverable lines are covered by tests.
:whitecheckmark: Project coverage is 38.26. Comparing base ([74f2455](https://app.codecov.io/gh/riatzukiza/promethean/commit/74f2455ecc87408f7861ae687011fe134491be12?dropdowncoverage&eldesc&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers)) to head ([65057b3](https://app.codecov.io/gh/riatzukiza/promethean/commit/65057b3a09904cd7e2f60810db20ef7063eb03fd?dropdowncoverage&eldesc&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers)).
:warning: Report is 11 commits behind head on dev.

details>summary>Additional details and impacted files/summary>



diff
           Coverage Diff           
##              dev     #264   +/-   ##

  Coverage   38.26   38.26           

  Files          22       22           
  Lines        1526     1526           
  Branches       27       27           

  Hits          584      584           
  Misses        942      942           


| [Flag](https://app.codecov.io/gh/riatzukiza/promethean/pull/264/flags?srcpr&elflags&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers) | Coverage  | |
|- - -|- - -|- - -|
| [ts-cephalon](https://app.codecov.io/gh/riatzukiza/promethean/pull/264/flags?srcpr&elflag&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers) | 33.38 > () | |
| [ts-discord-embedder](https://app.codecov.io/gh/riatzukiza/promethean/pull/264/flags?srcpr&elflag&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers) | 100.00 > () | |
| [ts-file-watcher](https://app.codecov.io/gh/riatzukiza/promethean/pull/264/flags?srcpr&elflag&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers) | 100.00 > () | |
| [ts-llm](https://app.codecov.io/gh/riatzukiza/promethean/pull/264/flags?srcpr&elflag&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers) | 27.27 > () | |

Flags with carried forward coverage won't be shown. [Click here](https://docs.codecov.io/docs/carryforward-flags?utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers#carryforward-flags-in-the-pull-request-comment) to find out more.
/details>

[:umbrella: View full report in Codecov by Sentry](https://app.codecov.io/gh/riatzukiza/promethean/pull/264?dropdowncoverage&srcpr&elcontinue&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers).   
:loudspeaker: Have feedback on the report? [Share it here](https://about.codecov.io/codecov-pr-comment-feedback/?utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers).
details>summary> :rocket: New features to boost your workflow: /summary>

- :snowflake: [Test Analytics](https://docs.codecov.com/docs/test-analytics): Detect flaky tests, report on failures, and find test suite problems.
- :package: [JS Bundle Analysis](https://docs.codecov.com/docs/javascript-bundle-analysis): Save yourself from yourself by tracking and limiting bundle sizes in JS merges.
/details>

---


