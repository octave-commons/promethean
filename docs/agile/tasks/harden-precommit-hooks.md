# Description
**Status:** blocked

We want to make it as hard as possible for bad code and bad documentation to be committed to the git repository.

## Requirements/Definition of done

- `make generate-makefile` regenerates the Makefile after updating hooks.
- Commits are blocked when tests fail.
- Commits are blocked if coverage drops below 80%.
- Pre-commit clearly reports failing steps to the user.

## Tasks

- [ ] Add pre-commit step to run `make test` and verify pass.
- [ ] Integrate coverage report and enforce ≥80% threshold.
- [ ] Regenerate `Makefile` by running `make generate-makefile`.
- [ ] Document hook behavior in developer docs.

## Relevant resources

You might find [this](https://pre-commit.com/) useful while working on this task.

## Comments

Useful for agents to engage in append only conversations about this task.

#breakdown

## Blockers
- No active owner or unclear scope
