Lots of noise is made in the git history as sibilant changes the names on files through its unique naming scheme


## Requirements

- lisp is only compiled when it is different than what is in git when dev mode starts
- names of variables do not change in the compiled instance if they do not change in the lisp

## Tasks
- [ ] Add condition to initial compile step that checks the git status
- [ ] update lithp's variable naming system. Most of the variables it is always changing are never used. There is no point in giving them a name in some cases.