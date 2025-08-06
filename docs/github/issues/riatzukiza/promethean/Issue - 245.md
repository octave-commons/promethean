---
title: "feat: watch kanban board and sync"
status: "open"
created: "8/5/2025, 8:08:59 PM"
url: "https://github.com/riatzukiza/promethean/pull/245"
opened_by: "riatzukiza"
assignees: []
updateMode: "none"
allowDelete: true
---

# feat: watch kanban board and sync
## Summary
- extend file watcher to parse kanban board, upsert card data to MongoDB, create tasks and emit socket.io updates
- add basic kanban watcher test
- wire lint/format scripts and dependencies

## Testing
- make format SERVICEfile-watcher
- npm run lint (fails: ignored files)
- npm run build
- npm test (fails: timed out while running tests)


- - -- - -
https://chatgpt.com/codex/tasks/taske68928ce0f1f48324ac7ed1752c89984b


## Comments

### codecov[bot] commented (8/5/2025, 8:11:26 PM):

## [Codecov](https://app.codecov.io/gh/riatzukiza/promethean/pull/245?dropdowncoverage&srcpr&elh1&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers) Report
:whitecheckmark: All modified and coverable lines are covered by tests.
:whitecheckmark: Project coverage is 32.39. Comparing base ([d74f4cf](https://app.codecov.io/gh/riatzukiza/promethean/commit/d74f4cf890c381bb2467a2839fee38d7addb58b0?dropdowncoverage&eldesc&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers)) to head ([11907c6](https://app.codecov.io/gh/riatzukiza/promethean/commit/11907c6dd3954094991ce25109c5afc5917725ea?dropdowncoverage&eldesc&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers)).
:warning: Report is 21 commits behind head on dev.
> :exclamation:  There is a different number of reports uploaded between BASE (d74f4cf) and HEAD (11907c6). Click for more details.
> 
> details>summary>HEAD has 1 upload less than BASE/summary>
>
>| Flag | BASE (d74f4cf) | HEAD (11907c6) |
>|- - -- - -|- - -- - -|- - -- - -|
>|ts-cephalon|1|0|
>/details>

details>summary>Additional details and impacted files/summary>



diff
             Coverage Diff             
##              dev     #245       +/-   ##

- Coverage   44.92   32.39   -12.54     

  Files          20        2       -18     
  Lines        1803       71     -1732     
  Branches       34        1       -33     

- Hits          810       23      -787     
+ Misses        993       48      -945     


| [Flag](https://app.codecov.io/gh/riatzukiza/promethean/pull/245/flags?srcpr&elflags&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers) | Coverage  | |
|- - -|- - -|- - -|
| [ts-cephalon](https://app.codecov.io/gh/riatzukiza/promethean/pull/245/flags?srcpr&elflag&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers) | ? | |
| [ts-discord-embedder](https://app.codecov.io/gh/riatzukiza/promethean/pull/245/flags?srcpr&elflag&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers) | 100.00 > (?) | |
| [ts-llm](https://app.codecov.io/gh/riatzukiza/promethean/pull/245/flags?srcpr&elflag&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers) | 27.27 > () | |

Flags with carried forward coverage won't be shown. [Click here](https://docs.codecov.io/docs/carryforward-flags?utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers#carryforward-flags-in-the-pull-request-comment) to find out more.
/details>

[:umbrella: View full report in Codecov by Sentry](https://app.codecov.io/gh/riatzukiza/promethean/pull/245?dropdowncoverage&srcpr&elcontinue&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers).   
:loudspeaker: Have feedback on the report? [Share it here](https://about.codecov.io/codecov-pr-comment-feedback/?utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers).
details>summary> :rocket: New features to boost your workflow: /summary>

- :snowflake: [Test Analytics](https://docs.codecov.com/docs/test-analytics): Detect flaky tests, report on failures, and find test suite problems.
- :package: [JS Bundle Analysis](https://docs.codecov.com/docs/javascript-bundle-analysis): Save yourself from yourself by tracking and limiting bundle sizes in JS merges.
/details>

---


