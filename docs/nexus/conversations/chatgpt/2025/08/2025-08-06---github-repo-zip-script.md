---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "GitHub repo zip script"
conversation_id: 689385f5-b21c-832b-83be-77dadeb9bfff
create_time: 08/06/2025 at 11:42 AM
update_time: 08/06/2025 at 11:43 AM
---

# Title: GitHub repo zip script

Created: 08/06/2025 at 11:42 AM
Last Updated: 08/06/2025 at 11:43 AM
Chat URL: https://chat.openai.com/c/689385f5-b21c-832b-83be-77dadeb9bfff


>[!nexus_user] **User** - 08/06/2025 at 11:42 AM
> Can you write me a script that crawls my github and generates zip archives for each of my repos?
<!-- UID: 10c73f92-bf84-4a50-8748-a2fcc2dc4875 -->




>[!nexus_agent] **Assistant** - 08/06/2025 at 11:42 AM
> Sure. Here's a script that:
> 
> 1. Uses the GitHub API to list all your repositories.
> 2. Downloads a ZIP archive of the default branch of each repository.
> 3. Saves them to a local directory.
> 
> You’ll need:
> - A GitHub [personal access token](https://github.com/settings/tokens) (classic or fine-grained).
> - Python 3 and the `requests` library.
> 
> ---
> 
> ### ✅ Python Script: `download_github_repos.py`
> 
> ```python
> import os
> import requests
> from pathlib import Path
> 
> # === CONFIGURATION ===
> GITHUB_USERNAME = "your-username"
> GITHUB_TOKEN = "your-token" # generate from GitHub: https://github.com/settings/tokens
> OUTPUT_DIR = "github_backups"
> 
> # === SETUP ===
> Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
> headers = {
>  "Authorization": f"token {GITHUB_TOKEN}",
>  "Accept": "application/vnd.github+json",
>  "User-Agent": "GitHubBackupScript"
> }
> 
> def get_repos(username):
>  repos = []
>  page = 1
>  while True:
>  url = f"https://api.github.com/users/{username}/repos?per_page=100&page={page}"
>  resp = requests.get(url, headers=headers)
>  if resp.status_code != 200:
>  raise Exception(f"Failed to fetch repos: {resp.text}")
>  data = resp.json()
>  if not data:
>  break
>  repos.extend(data)
>  page += 1
>  return repos
> 
> def download_repo_zip(repo):
>  name = repo["name"]
>  default_branch = repo["default_branch"]
>  zip_url = f"https://api.github.com/repos/{GITHUB_USERNAME}/{name}/zipball/{default_branch}"
>  print(f"Downloading {name} ({default_branch})...")
>  resp = requests.get(zip_url, headers=headers, stream=True)
>  if resp.status_code != 200:
>  print(f"Failed to download {name}: {resp.status_code}")
>  return
>  out_path = Path(OUTPUT_DIR) / f"{name}.zip"
>  with open(out_path, "wb") as f:
>  for chunk in resp.iter_content(chunk_size=8192):
>  f.write(chunk)
>  print(f"Saved to {out_path}")
> 
> def main():
>  print(f"Fetching repos for {GITHUB_USERNAME}...")
>  repos = get_repos(GITHUB_USERNAME)
>  print(f"Found {len(repos)} repositories.")
>  for repo in repos:
>  download_repo_zip(repo)
> 
> if __name__ == "__main__":
>  main()
> ```
> 
> ---
> 
> ### 🔧 Setup
> 
> 1. Replace `your-username` and `your-token` at the top.
> 2. Run:
> 
> ```bash
> pip install requests
> python download_github_repos.py
> ```
> 
> ---
> 
> ### 💡 Notes
> 
> - It backs up only public repos unless your token has private repo access.
> - You can change the ZIP name to include timestamp or branch if desired.
> - It uses `zipball`, which respects the default branch (usually `main` or `master`).
> 
> Would you like a version that backs up **org repos**, **private repos**, or uses a **config file** for multiple users/accounts?
<!-- UID: 39df07b2-ceec-42cb-a87f-1923205b341d -->

---


