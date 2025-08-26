---
project: Promethean
tags: [#task, #frontend, #dashboard, #grep, #smartgpt-bridge]
---

## Objective

Improve the UX of the `/grep` widget in the SmartGPT Bridge dashboard by **pre-filling sensible defaults** for common request parameters (`flags`, `maxMatches`, `context`, `paths`).

## Motivation

- Current `/grep` form renders with empty fields because the OpenAPI spec does not declare default values.
- This forces users to manually enter fields like `"flags": "g"` or `"maxMatches": 50` every time.
- By setting frontend defaults, developers can run searches immediately after typing just a `pattern`.

## Deliverables

- Update `<api-request-form>` in `sites/smartgpt-dashboard/wc/components.js`:
    - Detect when rendering `/grep` `POST` request.
    - Apply default values:
        ```json
        {
            "flags": "g",
            "maxMatches": 50,
            "context": 2,
            "paths": []
        }
        ```
    - Ensure these are only defaults (users can override).

## Steps

1. Modify `ApiRequestForm.render()`:
    - When resolving `value = this.values[name] ?? schema.default ?? ''`,
    - Inject `/grep`-specific defaults when path/method matches.
2. Test in dashboard:
    - Open `/grep` widget.
    - Verify form fields pre-filled.
    - Run search with just `pattern` set → should work without filling other fields.
3. Document:
    - Add note in `docs/services/smartgpt-bridge-dashboard.md` under "Widgets → Grep" about default behaviors.

## Acceptance Criteria

- `/grep` widget shows pre-filled defaults in the dashboard.
- Running a basic search requires only the `pattern` field.
- All defaults remain overrideable by the user.
