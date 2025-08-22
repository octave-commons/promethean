## Description

We are planning to do a proper fork of sibilant for a few reasons. The repo hasn't seen any changes in 5 years, I've made signifigant changes over the 5 or so years that I've been using it. It is becoming a different language.

I want to change how some existing macros are implemented. Specifically, I think that the way naming collisions are handled is sub optimal. Most of the time you are never even going to use those variables. They get different names in the code, you don't know what their going to be when you are writing it, so you could not consistently access them from the code any way. The variable names that may have a purpose are also encapsulated by closures.

I currently intend for the new language to be a proper superset of sibilant, so if work is ever made on the original project it could be incorporated into the new one, and vise versa, if a useful feature is added to lithp that sibilant wants to incorporate.
## Related Epics

- [[devops pipeline]]
## Requirements

- All files use the new file extensions.
- Emacs layer recognizes the new extensions.
- Old extensions continue to work

## Tasks 

- [ ] rename files
- [ ] Update lithp fork to accept the new file extensions.
