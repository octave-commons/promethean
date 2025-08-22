# Description

Use ollama to generate commit messages automaticly and automaticly commit the work that is being [[done.md]]
## Related Epics
- [[devops pipeline.md]]
## Requirements

- Whenever a source file is changed, extract the diff and use an LLM to write a commit message
- Commit the new code
- Push to current branch

## Tasks 

- [ ] Write a module for getting file diffs from git
- [ ] Write a module that accepts diffs and outputs commit messages
- [ ] Write a module that stages the change for commit 
- [ ] Write a module that accepts a commit message and commits currently staged code with that message
- [ ] Write code to push committed code
- [ ] Write an event handler for src file change events and executes [[each.md]] of the above
