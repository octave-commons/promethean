---
uuid: "1b93f3eb-202f-4d47-b4d0-b69286b8c2a3"
title: "Replace <SHA> with the commit from step 1"
slug: "recover broker code"
status: "document"
priority: "P3"
labels: ["commit", "replace", "sha", "you"]
<<<<<<< HEAD
created_at: "2025-10-12T22:46:41.458Z"
=======
created_at: "2025-10-12T21:40:23.579Z"
>>>>>>> bug/kanban-duplication-issues
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---









































































































































































































































































<<<<<<< HEAD



















































































































=======
>>>>>>> bug/kanban-duplication-issues
## 0) Safety first

Make sure you don’t have local changes you care about:

```bash
git status
```

If it’s not clean, commit or stash before proceeding.

---

## 1) Find the commit you want

### Case A — you know the folder path e.g. `src/assets/icons`

- See _all_ commits that touched that path (even if it’s gone now):


```bash
git log --all -- src/assets/icons
```

This shows commits that affected that path on any branch. ([Stack Overflow](https://stackoverflow.com/questions/6839398/find-when-a-file-was-deleted-in-git?utm_source=chatgpt.com "Find when a file was deleted in Git"))

- Get the **last commit where the folder existed**:


```bash
git rev-list -n 1 HEAD -- src/assets/icons
```

That prints a commit SHA you can use below. General `rev-list` behavior reference. ([Scaler](https://www.scaler.com/topics/git/git-rev-list/?utm_source=chatgpt.com "Git rev-list - Scaler Topics"))

- If you want to detect _when it was deleted_ (useful to pick the parent):


```bash
git log --diff-filter=D --summary | grep src/assets/icons
```

This filters for deletions and shows the commit(s) that removed it. ([Stack Overflow](https://stackoverflow.com/questions/6017987/how-can-i-list-all-the-deleted-files-in-a-git-repository?utm_source=chatgpt.com "How can I list all the deleted files in a Git repository?"))

> Note: `--follow` is only reliable for a **single file**, not a directory. Don’t expect it to “follow” a whole folder rename well. ([man7.org](https://man7.org/linux/man-pages/man1/git-log.1.html?utm_source=chatgpt.com "git-log(1) - Linux manual page"))

### Case B — you don’t remember the exact path, just the name

If the folder name is `icons`, try a glob:

```bash
git log --all -- "**/icons/*"
```

Then proceed as in Case A with the discovered path. This uses pathspec globs supported by Git’s log path limiter. ([Git](https://git-scm.com/docs/git-log?utm_source=chatgpt.com```
"Git - git-log Documentation"))
```
---

## 2) Restore the folder’s contents

You have two good, widely-used options. Pick one.

### Option 1 — modern `git restore` Git ≥ 2.23

```bash
# Replace <SHA> with the commit from step 1
git restore --source <SHA> -- src/assets/icons
```

This writes the directory from that commit into your working tree and, if you add `--staged`, into the index. Then commit. ([Git](https://git-scm.com/docs/git-restore?utm_source=chatgpt.com```
"Git - git-restore Documentation"))
```
### Option 2 — classic `git checkout` (works on older Git)

```bash
git checkout <SHA> -- src/assets/icons
```

Same effect for restoring paths from a specific commit; then `git add` and commit. ([Atlassian](https://www.atlassian.com/git/tutorials/resetting-checking-out-and-reverting?utm_source=chatgpt.com "Resetting, Checking Out & Reverting | Atlassian Git Tutorial"))

> Quick one-liner to “just bring back the last version of that folder”:
> 
> ```bash
> git checkout (git rev-list -n 1 HEAD -- src/assets/icons) -- src/assets/icons
> ```
> 
> Use PowerShell `()`/backticks equivalent on Windows if needed. ([Scaler](https://www.scaler.com/topics/git/git-rev-list/?utm_source=chatgpt.com "Git rev-list - Scaler Topics"))

---

## 3) Commit the restore

```bash
git add src/assets/icons
git commit -m "Restore src/assets/icons from <SHA>"
```

---

## 4) Push (if needed)

```bash
git push
```

---

## Troubleshooting / edge cases

- **Folder was renamed**: You may need to search both names. Directory-level rename tracking is heuristic; rely on history inspection rather than `--follow` for dirs. ([man7.org](https://man7.org/linux/man-pages/man1/git-log.1.html?utm_source=chatgpt.com "git-log(1) - Linux manual page"))

- **You want the state _before_ the deletion commit**: use the **parent** of the deletion commit:

    ```bash
    git checkout <DELETION_SHA>^ -- src/assets/icons
    ```
    
    - **You want to restore from another branch**:
    
    ```bash
    git checkout origin/main -- src/assets/icons
    ```
    
    - **Prefer `restore` semantics** (clearer separation of concerns than the overloaded `checkout`): use `git restore` with `--source`. ([Git](https://git-scm.com/docs/git-restore?utm_source=chatgpt.com```
"Git - git-restore Documentation"))
```

If you paste your exact folder path and (if you know it) a commit range/branch, I’ll tailor the exact command so you can copy-paste once and be done.
err:~/devel/promethean git rev-list -n 1 HEAD -- services/js
b896106e365083f968942c969570627e29e86a92
err:~/devel/promethean git restore --source b896106e365083f968942c969570627e29e86a92  -- services/js
error: pathspec 'services/js' did not match any file(s) known to git
err:~/devel/promethean 

That “pathspec … did not match any file(s) known to git” means Git doesn’t see anything by that name in that commit (or working tree) — so restoring `services/js` from that commit fails because Git believes that folder didn’t exist _in that commit’s tree_ or you have the wrong path/name/case.

To fix this, we need to verify some stuff and then get the correct path (or correct commit). Let’s walk through diagnosing + restoring.

---

## Step 1 — Verify folder existed in that commit

Run:

```bash
git ls-tree --name-only -r b896106e365083f968942c969570627e29e86a92 | grep "services/js"
```

- This lists **all** paths in that commit.

- You're looking for something like `services/js/...` could be under another subfolder, or maybe its name is different / capital-case, etc..

- If nothing matches, the folder either didn’t exist in that commit, or the name/casing is different.


Also, try:

```bash
git ls-tree --name-only -r b896106e365083f968942c969570627e29e86a92 | grep "services"
```

to see all things under `services/`, to help locate.

---

## Step 2 — Check for case sensitivity, path changes, or that the folder might have moved or been renamed

Possibilities include:

- The folder was renamed e.g. `Services/js` vs `services/js`

- It used a different path e.g. maybe “/service/js”, or “lib/js”, etc.

- The folder was deleted before that commit, so you may need an _earlier_ commit


You can search history for the folder name:

```bash
git log --all --pretty=oneline -- services/js
```

or a wildcard if unsure:

```bash
git log --all --pretty=oneline -- "**/js"
```

to find any commit that mentions `js` under some folder. Then use that commit for `git ls-tree`.

---

## Step 3 — Once you find the commit that definitely has it, restore

Suppose you find that in commit `abcdef1234567890` there is a folder `Services/js` or exactly path `services/js`.

Then:

```bash
# Using restore
git restore --source abcdef1234567890 -- services/js

# Or using checkout:
git checkout abcdef1234567890 -- services/js
```

Then:

```bash
git add services/js
git commit -m "Restore services/js folder from commit abcdef1234567890"
```

---

If you like, I can help you find that commit and the correct folder path, given your repo. If you tell me:

1. The top-level directory listing around `services` (what you see under `services`)

2. Whether you know approximate time (date) or commit when the folder was last present


I’ll help figure the exact commit and path so you can restore.
## 0) Safety first

Make sure you don’t have local changes you care about:

```bash
git status
```

If it’s not clean, commit or stash before proceeding.

---

## 1) Find the commit you want

### Case A — You know the folder path e.g., `src/assets/icons`

- See _all_ commits that touched that path (even if it's gone now):

```bash
git log --all -- src/assets/icons
```

This shows commits that affected that path on any branch. ([Stack
Overflow](https://stackoverflow.com/questions/6839398/find-when-a-file-was-deleted-in-git?utm_source=chatgpt.com
"Find when a file was deleted in Git"))

- Get the **last commit where the folder existed**:

```bash
git rev-list -n 1 HEAD -- src/assets/icons
```

That prints a commit SHA you can use below. General `rev-list` behavior
reference.
([Scaler](https://www.scaler.com/topics/git/git-rev-list/?utm_source=chatgpt.com
"Git rev-list - Scaler Topics"))

- If you want to detect _when it was deleted_ (useful for picking the parent):

```bash
git log --diff-filter=D --summary | grep src/assets/icons
```

This filters for deletions and shows the commit(s) that removed it. ([Stack
Overflow](https://stackoverflow.com/questions/6017987/how-can-i-list-all-the-deleted-files-in-a-git-repository?utm_source=chatgpt.com
"How can I list all the deleted files in a Git repository?"))

> Note: `--follow` is only reliable for a **single file**, not a directory.
> Don’t expect it to “follow” a whole folder rename well.
> ([man7.org](https://man7.org/linux/man-pages/man1/git-log.1.html?utm_source=chatgpt.com
> "git-log(1) - Linux manual page"))

### Case B — You don't remember the exact path, just the name

If the folder name is `icons`, try a glob:

```bash
git log --all -- "**/icons/*"
```

Then proceed as in Case A with the discovered path. This uses pathspec globs
supported by Git’s log path limiter.
([Git](https://git-scm.com/docs/git-log?utm_source=chatgpt.com```
"Git - git-log
```
Documentation"))

---

## 2) Restore the folder's contents

You have two good, widely-used options. Pick one.

### Option 1 — Modern `git restore` Git ≥ 2.23

```bash
# Replace <SHA> with the commit from step 1
git restore --source <SHA> -- src/assets/icons
```

This writes the directory from that commit into your working tree and, if you
add `--staged`, into the index. Then commit.
([Git](https://git-scm.com/docs/git-restore?utm_source=chatgpt.com```
"Git -
```
```
git-restore Documentation"))
```
### Option 2 — Classic `git checkout` (works on older Git)

```bash
git checkout <SHA> -- src/assets/icons
```

Same effect for restoring paths from a specific commit; then `git add` and
commit.
([Atlassian](https://www.atlassian.com/git/tutorials/resetting-checking-out-and-reverting?utm_source=chatgpt.com
"Resetting, Checking Out & Reverting | Atlassian Git Tutorial"))

> Quick one-liner to “just bring back the last version of that folder”:

```bash
git checkout (git rev-list -n 1 HEAD -- src/assets/icons) -- src/assets/icons
```

$Use PowerShell `()`/backticks equivalent on Windows if needed.
([Scaler](https://www.scaler.com/topics/git/git-rev-list/?utm_source=chatgpt.com
"Git rev-list - Scaler Topics"))

---

## 3) Commit the restore

```bash
git add src/assets/icons
git commit -m "Restore src/assets/icons from <SHA>"
```

---

## 4) Push (if needed)

```bash
git push
```

---

## Troubleshooting / edge cases

- **Folder was renamed**: You may need to search both names. Directory-level
  rename tracking is heuristic; rely on history inspection rather than
```
`--follow` for dirs.
```
  ([man7.org](https://man7.org/linux/man-pages/man1/git-log.1.html?utm_source=chatgpt.com
  "git-log(1) - Linux manual page"))

- **You want the state _before_ the deletion commit**: use the **parent** of the
  deletion commit:

```bash
git checkout <DELETION_SHA>^ -- src/assets/icons
```

- **You want to restore from another branch**:

```bash
git checkout origin/main -- src/assets/icons
```

- **Prefer `restore` semantics** (clearer separation of concerns than the
  overloaded `checkout`): use `git restore` with `--source`.
  ([Git](https://git-scm.com/docs/git-restore?utm_source=chatgpt.com```
"Git -
```
```
git-restore Documentation"))
```
---

If you paste your exact folder path and (if you know it) a commit range/branch,
I’ll tailor the exact command so you can copy-paste once and be done.

### Example Output

```bash
err:~/devel/promethean git rev-list -n 1 HEAD -- services/js
b896106e365083f968942c969570627e29e86a92
err:~/devel/promethean git restore --source
b896106e365083f968942c969570627e29e86a92 -- services/js
error: pathspec 'services/js' did not match any file(s) known to git
err:~/devel/promethean 

That “pathspec … did not match any file(s) known to git” means Git doesn’t see
anything by that name in that commit (or working tree)—so restoring
`services/js` from that commit fails because Git believes that folder didn't
exist _in that commit's tree_ (or you have the wrong path/name/case).

To fix this, we need to verify some stuff and then get the correct path (or
correct commit). Let’s walk through diagnosing + restoring.

---

## Step 1 — Verify folder existed in that commit

Run:

```bash
git ls-tree --name-only -r b896106e365083f968942c969570627e29e86a92 | grep
```
"services/js"
```
```

- This lists **all** paths in that commit.
  
- You're looking for something like `services/js/...` (could be under another
  subfolder, or maybe its name is different/capital-case, etc.).
  
- If nothing matches, the folder either didn’t exist in that commit, or the
  name/casing is different.

Also, try:

```bash
git ls-tree --name-only -r b896106e365083f968942c969570627e29e86a92 | grep
"services"
```

to see all things under `services/`, to help locate.

---

## Step 2 — Check for case sensitivity, path changes, or that the folder might have moved or been renamed

Possibilities include:

- The folder was renamed (e.g., `Services/js` vs `services/js`)
  
- It used a different path (e.g., maybe “/service/js,” or “lib/js,” etc.)
  
- The folder was deleted before that commit, so you may need an _earlier_ commit

You can search history for the folder name:

```bash
git log --all --pretty=oneline -- services/js
```

or a wildcard if unsure:

```bash
git log --all --pretty=oneline -- "**/js"
```

to find any commit that mentions `js` under some folder. Then use that commit
for `git ls-tree`.

---

## Step 3 — Once you find the commit that definitely has it, restore

Suppose you find that in commit `abcdef1234567890` there is a folder
`Services/js` (or exactly path `services/js`).

Then:

```bash
# Using restore
git restore --source abcdef1234567890 -- services/js

# Or using checkout:
```
git checkout abcdef1234567890 -- services/js
```
```

Then:

```bash
```
git add services/js
```
git commit -m "Restore services/js folder from commit abcdef1234567890"
```

---

If you like, I can help you find that commit and the correct folder path, given
your repo. If you tell me:

1. The top-level directory listing around `services` (what you see under
   `services`)
  
2. Whether you know approximate time (date) or commit when the folder was last
   present

I’ll help figure the exact commit and path so you can restore.








































































































































































































































































<<<<<<< HEAD



















































































































=======
>>>>>>> bug/kanban-duplication-issues
