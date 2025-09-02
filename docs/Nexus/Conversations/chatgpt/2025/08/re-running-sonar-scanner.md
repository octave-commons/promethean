---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Re-running sonar scanner"
conversation_id: 68b237ec-a208-8322-87f9-9cd36d005583
create_time: 08/29/2025 at 6:30 PM
update_time: 08/29/2025 at 6:38 PM
---

# Title: Re-running sonar scanner

Created: 08/29/2025 at 6:30 PM
Last Updated: 08/29/2025 at 6:38 PM
Chat URL: https://chat.openai.com/c/68b237ec-a208-8322-87f9-9cd36d005583


>[!nexus_user] **User** - 08/29/2025 at 6:30 PM
> sonar qube gave me a simple command and I ran it to get a snap shot... now I don't know how to get it again...how do I run it again?
<!-- UID: 6db51407-e427-4c69-bd39-ccf36c3e2818 -->




>[!nexus_agent] **Assistant** - 08/29/2025 at 6:30 PM
> Got it—this is just re-running the scanner. If you lost the exact snippet SonarQube showed you: you don’t need it. You only need the token + a couple settings. Here’s the practical way to do it again (and make it easy next time).
> 
> # Fast path (CLI)
> 1) In your repo root, create `sonar-project.properties` once:
> ```
> sonar.projectKey=your_project_key
> sonar.projectName=Your Project
> sonar.sources=.
> sonar.host.url=http://localhost:9000
> # optional, if you have coverage
> sonar.javascript.lcov.reportPaths=coverage/lcov.info
> ```
> 
> 2) Get (or regenerate) a token:
> - SonarQube UI → your avatar (top-right) → **My Account → Security → Generate Tokens**. 
>  Note: you **cannot view** an old token; you must create a new one if you lost it.
> 
> 3) Run it:
> ```bash
> export SONAR_TOKEN=YOUR_NEW_TOKEN
> sonar-scanner
> ```
> That’s it. Re-run the same `sonar-scanner` anytime.
> 
> # Alternative one-liners
> - **Docker (no local install):**
> ```bash
> docker run --rm \
>  -e SONAR_HOST_URL="http://localhost:9000" \
>  -e SONAR_LOGIN="YOUR_NEW_TOKEN" \
>  -v "$PWD:/usr/src" sonarsource/sonar-scanner-cli
> ```
> - **Maven projects:** `mvn sonar:sonar -Dsonar.host.url=http://localhost:9000 -Dsonar.login=YOUR_NEW_TOKEN`
> - **Gradle projects:** `./gradlew sonarqube -Dsonar.host.url=http://localhost:9000 -Dsonar.login=YOUR_NEW_TOKEN`
> 
> # Verify it landed
> - Project → **Activity** (or **Background Tasks**) in SonarQube. If it doesn’t show up, you used the wrong `sonar.projectKey` or server URL.
> 
> # Common gotchas (save time)
> - **401/unauthorized**: token wrong or expired; generate a new one.
> - **Project not found**: `sonar.projectKey` mismatch with what’s in SonarQube.
> - **Server unreachable**: wrong `sonar.host.url` or SonarQube isn’t running.
> - **Coverage is 0%**: your coverage file path/format isn’t wired (`lcov.info` etc.).
> 
> # Make it muscle memory
> - Put `SONAR_TOKEN` in your shell rc or a `.env` you source.
> - Add an npm/yarn/pnpm script: `"sonar": "sonar-scanner"` so you can just run `pnpm sonar`.
> 
> If you tell me what stack you ran it with the first time (CLI vs Maven/Gradle/Docker), I’ll give you the exact command tailored to your repo structure.
> 
> #sonarqube #sonarscanner #dev-tools #quality #ci/cd
<!-- UID: 3982ac7a-1c24-46fb-9d7a-f0bb93419ca3 -->

---


