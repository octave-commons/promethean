---
title: "feat: add markdown graph service"
status: "open"
created: "8/5/2025, 8:07:33 PM"
url: "https://github.com/riatzukiza/promethean/pull/243"
opened_by: "riatzukiza"
assignees: []
updateMode: "none"
allowDelete: true
---

# feat: add markdown graph service
## Summary
- add markdown graph service with cold-start repository scan
- expose REST API for updating and querying markdown links and hashtags
- document service usage

## Testing
- make test-python-service-markdowngraph
- flake8 services/py/markdowngraph
- black services/py/markdowngraph
- make build SERVICEmarkdowngraph

- - -- - -
https://chatgpt.com/codex/tasks/taske68928f9e01fc8324a6f473f6e9f8c086


## Comments

### codecov[bot] commented (8/5/2025, 8:08:38 PM):

## [Codecov](https://app.codecov.io/gh/riatzukiza/promethean/pull/243?dropdowncoverage&srcpr&elh1&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers) Report
:whitecheckmark: All modified and coverable lines are covered by tests.
:whitecheckmark: Project coverage is 32.39. Comparing base ([0013b94](https://app.codecov.io/gh/riatzukiza/promethean/commit/0013b94ee2cf4e9846b27cb99e230a7b3e1ac61f?dropdowncoverage&eldesc&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers)) to head ([40c6cb1](https://app.codecov.io/gh/riatzukiza/promethean/commit/40c6cb1dba0d467582add1e1b3bcad9b2555e7c3?dropdowncoverage&eldesc&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers)).
:warning: Report is 19 commits behind head on dev.
> :exclamation:  There is a different number of reports uploaded between BASE (0013b94) and HEAD (40c6cb1). Click for more details.
> 
> details>summary>HEAD has 1 upload less than BASE/summary>
>
>| Flag | BASE (0013b94) | HEAD (40c6cb1) |
>|- - -- - -|- - -- - -|- - -- - -|
>|ts-cephalon|1|0|
>/details>

details>summary>Additional details and impacted files/summary>



diff
             Coverage Diff             
##              dev     #243       +/-   ##

- Coverage   44.92   32.39   -12.54     

  Files          20        2       -18     
  Lines        1803       71     -1732     
  Branches       34        1       -33     

- Hits          810       23      -787     
+ Misses        993       48      -945     


| [Flag](https://app.codecov.io/gh/riatzukiza/promethean/pull/243/flags?srcpr&elflags&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers) | Coverage  | |
|- - -|- - -|- - -|
| [ts-cephalon](https://app.codecov.io/gh/riatzukiza/promethean/pull/243/flags?srcpr&elflag&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers) | ? | |
| [ts-discord-embedder](https://app.codecov.io/gh/riatzukiza/promethean/pull/243/flags?srcpr&elflag&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers) | 100.00 > (?) | |
| [ts-llm](https://app.codecov.io/gh/riatzukiza/promethean/pull/243/flags?srcpr&elflag&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers) | 27.27 > () | |

Flags with carried forward coverage won't be shown. [Click here](https://docs.codecov.io/docs/carryforward-flags?utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers#carryforward-flags-in-the-pull-request-comment) to find out more.
/details>

[:umbrella: View full report in Codecov by Sentry](https://app.codecov.io/gh/riatzukiza/promethean/pull/243?dropdowncoverage&srcpr&elcontinue&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers).   
:loudspeaker: Have feedback on the report? [Share it here](https://about.codecov.io/codecov-pr-comment-feedback/?utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers).
details>summary> :rocket: New features to boost your workflow: /summary>

- :snowflake: [Test Analytics](https://docs.codecov.com/docs/test-analytics): Detect flaky tests, report on failures, and find test suite problems.
- :package: [JS Bundle Analysis](https://docs.codecov.com/docs/javascript-bundle-analysis): Save yourself from yourself by tracking and limiting bundle sizes in JS merges.
/details>

---


