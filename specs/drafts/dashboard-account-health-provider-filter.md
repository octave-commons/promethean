# Spec Draft: Dashboard Account Health Provider Filter

## Summary
Add a provider filter control to the web dashboard Account Health panel so operators can focus the health table on one provider without losing the existing sort options.

## Open Questions
- None.

## Risks
- Filtering only in the client must still behave cleanly with infinite-scroll slicing.
- The filter UI should remain readable in the already dense dashboard header.
- Refreshes should not leave the filter in an invalid state if provider availability changes.

## Priority
Medium — improves dashboard usability when many accounts from multiple providers are present.

## Implementation Phases
1. **Investigation**
   - Inspect the dashboard Account Health panel data flow and controls.
   - Confirm whether provider filtering can be client-side without API changes.
2. **Implementation**
   - Add a provider filter control to the Account Health header.
   - Filter the displayed account list by provider before pagination/infinite-scroll slicing.
   - Ensure provider options derive from the current account dataset and stay valid across refreshes.
3. **Verification**
   - Build the server package and web bundle to catch TypeScript/UI regressions.
   - Run the full package test suite to confirm no regressions.

## Affected Files
- `specs/drafts/dashboard-account-health-provider-filter.md`
- `receipts.log`
- `web/src/pages/DashboardPage.tsx`
- `web/src/styles.css`

## Dependencies
- Dashboard overview data from `/api/ui/dashboard/overview`
- Existing Account Health sort controls in `web/src/pages/DashboardPage.tsx`

## Existing Issues / PRs
- None referenced.

## Definition of Done
- Account Health includes a provider filter with an `All providers` option.
- Filtering happens before visible-row slicing so infinite scroll works on the filtered set.
- The selected provider resets safely if refreshed data no longer includes it.
- `pnpm run build`, `pnpm run web:build`, and `pnpm test` pass.

## Progress
- [x] Investigation: Account Health already receives all provider/account rows from `overview.accounts`, so provider filtering can stay client-side.
- [x] Implementation: added a provider select beside the existing sort control; filtering now happens before Account Health visible-row slicing and gracefully resets to `All providers` if refreshed data drops the selected provider.
- [x] Verification: `pnpm run build`, `pnpm run web:build`, and `pnpm test` all passed.
