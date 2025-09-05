---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Bash set -euo pipefail"
conversation_id: 68b092f2-fa98-8329-9a04-a20b91327954
create_time: 08/28/2025 at 12:33 PM
update_time: 08/28/2025 at 12:34 PM
---

# Title: Bash set -euo pipefail

Created: 08/28/2025 at 12:33 PM
Last Updated: 08/28/2025 at 12:34 PM
Chat URL: https://chat.openai.com/c/68b092f2-fa98-8329-9a04-a20b91327954


>[!nexus_user] **User** - 08/28/2025 at 12:33 PM
> What's this do? `set -euo pipefail`
<!-- UID: bfbfe56f-e5e6-4094-81c3-580e1115f7c4 -->




>[!nexus_agent] **Assistant** - 08/28/2025 at 12:33 PM
> That line is a **bash safety setting** often used at the top of shell scripts: 
> 
> ```bash
> set -euo pipefail
> ```
> 
> It’s actually three separate options combined:
> 
> 1. **`-e` (errexit)** 
>  The script will immediately exit if any command returns a non-zero exit status (an error), instead of continuing. 
>  *Without this, bash just keeps running even if a command fails, which can hide bugs.*
> 
> 2. **`-u` (nounset)** 
>  Treats use of *unset* (undefined) variables as an error. 
>  *Example: `echo $FOO` will cause the script to exit if `FOO` hasn’t been defined.*
> 
> 3. **`-o pipefail`** 
>  Changes how bash handles errors in pipelines. Normally, only the exit code of the **last command in a pipeline** matters. With `pipefail`, the pipeline fails if **any command in it** fails. 
>  *Example:* 
>  ```bash
>  false | true
>  ``` 
>  - Without `pipefail`: exit status = 0 (success, because `true` is last). 
>  - With `pipefail`: exit status = 1 (failure, because `false` failed).
> 
> ---
> 
> ### Why people use it
> Together, these settings make bash scripts **fail fast and fail loudly**:
> - If something breaks, the script stops instead of producing bad data. 
> - If you mistype a variable, it errors instead of silently substituting an empty string. 
> - Pipelines don’t silently swallow errors in the middle. 
> 
> It’s basically a **defensive programming mode** for bash.
> 
> ---
> 
> Want me to show you some quick one-liners you can run that demonstrate the difference with and without `set -euo pipefail`?
<!-- UID: 990292d7-2bd3-4210-b623-a294aaa486b9 -->

---


