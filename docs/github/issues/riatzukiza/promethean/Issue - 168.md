---
title: "feat: allow cephalon runtime config"
status: "open"
created: "8/3/2025, 1:27:51 AM"
url: "https://github.com/riatzukiza/promethean/pull/168"
opened_by: "riatzukiza"
assignees: []
updateMode: "none"
allowDelete: true
---

# feat: allow cephalon runtime config
## Summary
- add /setconfig command to update Cephalon runtime settings such as history limit and stop threshold
- add /setstate command to change agent inner state fields without restarting
- document new commands in Cephalon README and test their handlers

## Testing
- make setup-ts-service-cephalon *(fails: connect ENETUNREACH 140.82.113.4:443)*
- make format-ts
- make lint-ts-service-cephalon *(fails: ESLint: You are linting '.', but all of the files matching the glob pattern '.' are ignored)*
- make test-ts-service-cephalon *(fails: Cannot find module 'crypto' or its corresponding type declarations.)*
- make build-ts *(fails: Cannot find module 'childprocess' or its corresponding type declarations.)*

- - -- - -
https://chatgpt.com/codex/tasks/taske688efde061b88324b439f71afad6ebee


