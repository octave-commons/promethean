# Sentinel GitHub Actions (GH API + CI runner)

## Intent

Provide a top-level `:github-actions` block to model CI-style workflows (push/PR/tag/cron), set check-runs/statuses, comment/label/release, and run jobs/steps locally or via `act` for parity. No `.github/workflows` needed. Token-based, opt-in.

## Triggers

- `:on-push` with `:branches` and/or `:tags` patterns.
- `:on-pr` with `:events` (e.g., [:opened :synchronize :reopened]); PR resolved from ref/SHA or explicit `:match`.
- `:on-tag` pattern.
- `:cron` (client-side scheduler).
- Optional `:on-event` for custom sentinel synthetic events.

## Jobs

- `:jobs` vector `{ :name "..." :runs-on :local|:act :steps [...] :env {...} :timeout "600s" :fail-fast? true }`.
- Steps: `{:run "shell command" :name <opt> :env <opt> :working-directory <opt>}` or `{:run-nx {...}}` helper.
- Matrix (minimal): `{:matrix {:node ["20" "22"]} :steps [...]}` expands per axis.
- Runner modes: `:local` executes shell directly (requires tools installed); `:act` delegates to `act` with a generated stub workflow (requires `act`).
- Defaults: `:timeout` 900s per job if not set; `:runs-on` defaults to `:local`; `:fail-fast?` default true per workflow.

## Reporting (`:report` or post-jobs)

- `:check-run` { :name :conclusion :summary :details? } on target SHA.
- `:status` { :context :state :description :target-url? } legacy status.
- `:comment` { :match {:pr true}|{:issue-number ...} :body }.
- `:label` { :match {:pr true}|{:issue-number ...} :add [...] :remove [...] }.
- `:issue` open/close { :title :body :state }.
- `:release` { :tag? :name? :draft? :prerelease? :notes-file|:notes }.
- `:review` { :match {:pr true} :state :approve|:request_changes|:comment :body } (optional).
- `:assign` { :match {:pr true} :users [...] } (optional).

## Target selection rules

- Push: target SHA is current ref; PR match by branch/ref if `:match {:pr true}`.
- PR events: use PR number/SHA from event payload.
- Tag: use tag ref; release uses tag unless overridden.
- Overrides: allow explicit `:sha`, `:pr-number`, `:issue-number`.

## Auth & safety

- Require `GITHUB_TOKEN` (env); no tokens in EDN. Opt-in `SENTINEL_ENABLE_GH_ACTIONS`. Dry-run mode skips API writes. Backoff on rate limits.

## Runner model

- Dedicated GH client process (can be an `:app`) that listens for triggers (webhook/poll/cron), runs jobs (local or `act`), then applies reports.
- Collect per-job logs; optionally attach summary to check-run details.
- Fail-fast honored per workflow.
- Artifacts: out-of-scope v1 (add later if needed).

## Acceptance criteria

- Parse `:github-actions` and execute jobs on push/PR/tag/cron triggers.
- Check-runs/status set on correct SHA; PR matching works from branch/ref.
- Comments/labels/releases/reviews/assigns apply as specified.
- Runner works in local mode and `act` mode; dry-run and error reporting functional.
- Tests: DSL validation, mocked GH API, runner job exec (local), `act` invocation stubbed.

## Touchpoints

- GH client module (Node) using octokit or REST; mockable.
- Runner for jobs (local shell executor, optional `act` adapter).
- Docs: token setup, enabling runner, authoring CI jobs and reporting actions.

## Implementation files (planned)

- `services/sentinel/src/promethean/sentinel/gh/client.cljs`
- `services/sentinel/src/promethean/sentinel/gh/runner.cljs`
- `services/sentinel/src/promethean/sentinel/gh/model.cljs`
