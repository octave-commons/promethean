
## Description

To prevent noise in the github commits, we should track shasums of the lisp files.
The shasum we keep will be of a version of the program with all newlines, trailing whitespace, and multiple consecutive whitepsaces, deleted, to prevent new versions of the program from being compiled for identical programs
## Related Epics

- [[devops pipeline]]
## Requirements

- Only functionally different versions of code are compiled
## Tasks 

- [ ] Write a parser to remove all surperfluous whitespace from lithp code.
- [ ] Track the shasums of these parsed lisp files.
- [ ] Prevent recompiling of code with identical shasums

## Relavent links

- [[DevOps Sibilant transpiler should create less noise in pull requests when acting on unchanged files.]]

