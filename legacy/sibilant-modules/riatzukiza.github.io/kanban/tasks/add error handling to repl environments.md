
## Description

In both the original Sibilant's executable, and the REPL I built for kit, if an error is thrown the program exits. This is not the behavior you want out of a repl. It should catch and display any errors without closing, or it isn't so good as a loop. REPLs are supposed to be places where you test things out, if it crashes every time you goof up, you have to re-execute everything that did not break up to that point.
## Related Epics
- [[devops pipeline]]
## Requirements

- REPL for lithp/kit-shell catches any  errors and displays the results
- the shell does not exit under any circumstances unless the user explicitly sends an exit signal.
## Tasks 

- [ ] Implement error handling in kit-repl
- [ ] add same error handling to lithp
