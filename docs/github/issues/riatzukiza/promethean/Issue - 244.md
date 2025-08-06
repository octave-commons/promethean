---
title: "Add integration test target"
status: "open"
created: "8/5/2025, 8:08:20 PM"
url: "https://github.com/riatzukiza/promethean/pull/244"
opened_by: "riatzukiza"
assignees: []
updateMode: "none"
allowDelete: true
---

# Add integration test target
## Summary
- add test-integration command
- include target in generated Makefile

## Testing
- hy Makefile.hy format-python
- hy Makefile.hy lint-python
- hy Makefile.hy build-python
- hy Makefile.hy test-python *(fails: CalledProcessError during pipenv tests)*
- hy Makefile.hy test-integration *(fails: ModuleNotFoundError: No module named 'numpy')*


- - -- - -
https://chatgpt.com/codex/tasks/taske68928efb8c9883249ca8f08c6a0b1cb9


## Comments

### codecov[bot] commented (8/5/2025, 8:10:48 PM):

## [Codecov](https://app.codecov.io/gh/riatzukiza/promethean/pull/244?dropdowncoverage&srcpr&elh1&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers) Report
:whitecheckmark: All modified and coverable lines are covered by tests.
:whitecheckmark: Project coverage is 32.39. Comparing base ([d74f4cf](https://app.codecov.io/gh/riatzukiza/promethean/commit/d74f4cf890c381bb2467a2839fee38d7addb58b0?dropdowncoverage&eldesc&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers)) to head ([8d535db](https://app.codecov.io/gh/riatzukiza/promethean/commit/8d535db7c3a4040c6e7e279d23e006f21eeea640?dropdowncoverage&eldesc&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers)).
:warning: Report is 21 commits behind head on dev.
> :exclamation:  There is a different number of reports uploaded between BASE (d74f4cf) and HEAD (8d535db). Click for more details.
> 
> details>summary>HEAD has 1 upload less than BASE/summary>
>
>| Flag | BASE (d74f4cf) | HEAD (8d535db) |
>|- - -- - -|- - -- - -|- - -- - -|
>|ts-cephalon|1|0|
>/details>

details>summary>Additional details and impacted files/summary>



diff
             Coverage Diff             
##              dev     #244       +/-   ##

- Coverage   44.92   32.39   -12.54     

  Files          20        2       -18     
  Lines        1803       71     -1732     
  Branches       34        1       -33     

- Hits          810       23      -787     
+ Misses        993       48      -945     


| [Flag](https://app.codecov.io/gh/riatzukiza/promethean/pull/244/flags?srcpr&elflags&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers) | Coverage  | |
|- - -|- - -|- - -|
| [ts-cephalon](https://app.codecov.io/gh/riatzukiza/promethean/pull/244/flags?srcpr&elflag&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers) | ? | |
| [ts-discord-embedder](https://app.codecov.io/gh/riatzukiza/promethean/pull/244/flags?srcpr&elflag&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers) | 100.00 > (?) | |
| [ts-llm](https://app.codecov.io/gh/riatzukiza/promethean/pull/244/flags?srcpr&elflag&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers) | 27.27 > () | |

Flags with carried forward coverage won't be shown. [Click here](https://docs.codecov.io/docs/carryforward-flags?utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers#carryforward-flags-in-the-pull-request-comment) to find out more.
/details>

[:umbrella: View full report in Codecov by Sentry](https://app.codecov.io/gh/riatzukiza/promethean/pull/244?dropdowncoverage&srcpr&elcontinue&utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers).   
:loudspeaker: Have feedback on the report? [Share it here](https://about.codecov.io/codecov-pr-comment-feedback/?utmmediumreferral&utmsourcegithub&utmcontentcomment&utmcampaignpr+comments&utmtermAaron+Beavers).
details>summary> :rocket: New features to boost your workflow: /summary>

- :snowflake: [Test Analytics](https://docs.codecov.com/docs/test-analytics): Detect flaky tests, report on failures, and find test suite problems.
- :package: [JS Bundle Analysis](https://docs.codecov.com/docs/javascript-bundle-analysis): Save yourself from yourself by tracking and limiting bundle sizes in JS merges.
/details>

---


