I have implemented many macros that in some cases have been copied, or implemented differently, that share the same name. Some times this causes issues at run time. For instance, the `remember` macro was implemented in a way that did not maintain the same `this` as the surrounding closure and broke my code in a few cases where I depended on that behavior at random when that version got read in after or instead of the version that does maintain the "this" binding of the surrounding closure.

This issue is related to [[Move all outside work into the portfolio git.md|kanban/tasks/Move all outside work into the portfolio git]] and [[Remove duplicate code included in headers..md]]

#subtask #consolidation #kitframework 

## Blocked by

- [[move kit core.md]]
- [[move kit fs.md]]
- [[move kit repl.md]]
- [[move kit html.md]]
- [[move kit shell.md]]
- [[move kit http.md]]



Here are the tags for the selected text in the format #hashtag:

#duplicate
#rejected
#[[Epic.md]]
#kanban
#tasks
#portfolio
#git
#rewrite
#andylib
#lisp
#macros
#codeduplication
#refactoring
#refactor
#move
#outsidework
#workinprogress
