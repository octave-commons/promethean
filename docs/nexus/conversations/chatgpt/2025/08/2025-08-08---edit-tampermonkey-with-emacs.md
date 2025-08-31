---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Edit Tampermonkey with Emacs"
conversation_id: 68966f24-b46c-8326-99d5-cd5cea3aeb97
create_time: 08/08/2025 at 4:41 PM
update_time: 08/11/2025 at 4:37 PM
---

# Title: Edit Tampermonkey with Emacs

Created: 08/08/2025 at 4:41 PM
Last Updated: 08/11/2025 at 4:37 PM
Chat URL: https://chat.openai.com/c/68966f24-b46c-8326-99d5-cd5cea3aeb97


>[!nexus_user] **User** - 08/08/2025 at 4:41 PM
> Yo is there a way to like... edit my tamper monkey stuff with my emacs?
<!-- UID: ee150fcf-57e9-41e3-bd84-7d072bc9fcbb -->




>[!nexus_agent] **Assistant** - 08/08/2025 at 4:42 PM
> Yep—couple good ways:
> 
> # Option A (Tampermonkey + Emacs, proper way)
> Use **TamperDAV**, the official WebDAV bridge. It lets Tampermonkey sync your scripts to a local WebDAV folder that you edit in Emacs; saves are picked up automatically.
> 
> **Quick start on Ubuntu:**
> 1) Run TamperDAV:
> ```bash
> git clone https://github.com/Tampermonkey/TamperDAV
> cd TamperDAV
> npm i
> ./tamperdav.sh # defaults to http://localhost:7000
> ```
> 2) In Tampermonkey → **Dashboard → Settings → Script Sync**, choose **WebDAV**, point it at `http://localhost:7000/`, set creds if you enabled them, and **Enable Script Sync**. citeturn1view0 
> 3) Mount it so Emacs can just open files:
> ```bash
> sudo apt install davfs2
> sudo mkdir -p /mnt/tamperdav
> sudo mount -t davfs http://localhost:7000 /mnt/tamperdav
> ```
> 4) Edit scripts from Emacs at `/mnt/tamperdav/Tampermonkey/sync/...`. If you need to map a script name to the UUID filename, run:
> ```bash
> node find_script_in_meta.js --name="My Script Name"
> ```
> Tip: set `"meta-touch": true` in TamperDAV’s `config.json` so TM syncs immediately on save. citeturn2view0
> 
> # Option B (Chrome-only hack)
> You can keep a userscript in a local file and **@require** it from Tampermonkey using a `file://` URL, then edit that file in Emacs. This works in **Chrome/Chromium**, not Firefox. (Firefox doesn’t allow the local-file access piece.) citeturn1view0
> 
> # Option C (If you’re okay switching managers during dev)
> **Violentmonkey** has a built-in “**Track external edits**” flow: save your script as `*.user.js`, install it from `http://localhost:8080/my-script.user.js`, click **Track external edits**, and it will hot-reload on every save from Emacs. Super simple. You can switch back to Tampermonkey later. citeturn3view0
> 
> Want me to toss you a tiny `make tm-dev` that boots TamperDAV and mounts it, plus an Emacs TRAMP snippet?
<!-- UID: ca746080-ef34-40f9-8f4c-04b6bf930594 -->

---




>[!nexus_user] **User** - 08/08/2025 at 4:58 PM
> ^Cerr@err-Stealth-16-AI-Studio-A1VGG:~/TamperDAV$ ./tamperdav.sh --help defaultsts to http://localhost:7000
> TamperDAV is running without any form of authentication. It's strongly recommended to configure username and password!
> server is listening on 7000
<!-- UID: 214d1ad8-e452-4bb3-b6a8-f19bb3a604ca -->




>[!nexus_agent] **Assistant** - 08/08/2025 at 4:58 PM
> Nice—TamperDAV is up!
> 
> Let’s get you set up clean so Emacs can edit everything seamlessly. Here's what you need:
> 
> ---
> 
> ## ✅ 1. Enable WebDAV sync in Tampermonkey
> 
> 1. Open the **Tampermonkey Dashboard** in your browser
> 2. Click the ⚙️ **Settings** tab
> 3. Scroll to **Script Sync** section
> 4. Set:
>  - **Mode**: `WebDAV`
>  - **Address**: `http://localhost:7000/`
>  - **User/Password**: leave blank unless you want to lock it down
>  - Enable **"Automatic Script Sync"** and **"Sync on each save"**
> 5. Hit **Save**
> 
> ---
> 
> ## ✅ 2. Mount the WebDAV folder locally
> 
> Install `davfs2` if you haven’t:
> ```bash
> sudo apt install davfs2
> ```
> 
> Then create and mount the folder:
> ```bash
> mkdir -p ~/tampermonkey-sync
> sudo mount -t davfs http://localhost:7000 ~/tampermonkey-sync
> ```
> 
> If it prompts for credentials and you're not using any, just hit `Enter` twice.
> 
> > ⚠️ **Got mount errors?** Add this to `/etc/davfs2/davfs2.conf`:
> ```
> use_locks 0
> ```
> 
> You can also make it mountable as a normal user by adding yourself to the `davfs2` group and setting permissions.
> 
> ---
> 
> ## ✅ 3. Edit in Emacs
> 
> Now you can just:
> ```bash
> emacs ~/tampermonkey-sync/Tampermonkey/sync/YOURSCRIPT.user.js
> ```
> 
> Changes made here will be picked up automatically by Tampermonkey (as long as `meta-touch` is enabled in `config.json`).
> 
> ---
> 
> ## ✨ Bonus: Makefile or script
> 
> Want a fast dev toggle?
> 
> ```Makefile
> tm-dev:
> 	@mkdir -p ~/tampermonkey-sync
> 	@npm --prefix ~/TamperDAV start &
> 	@sleep 2
> 	@sudo mount -t davfs http://localhost:7000 ~/tampermonkey-sync
> ```
> 
> Or a shell alias:
> ```bash
> alias tm-dev='(cd ~/TamperDAV && npm start &) && sleep 2 && sudo mount -t davfs http://localhost:7000 ~/tampermonkey-sync'
> ```
> 
> ---
> 
> Let me know if you want to set up **per-user non-sudo mount**, **auth config**, or **.dir-locals.el** for js2-mode or prettier integration in Emacs.
<!-- UID: 3c5adc21-708d-4d66-942b-eec7fed0472e -->

---




>[!nexus_user] **User** - 08/08/2025 at 5:00 PM
> the bufferis read only?
<!-- UID: 94c44971-5151-473e-8641-7cb704ec3f93 -->




>[!nexus_agent] **Assistant** - 08/08/2025 at 5:00 PM
> Ah yes — classic `davfs2` pain. The WebDAV mount is probably **read-only** due to permissions or locking. Here's how to fix it:
> 
> ---
> 
> ## 🔧 Step-by-step fix for read-only buffer
> 
> ### ✅ 1. Add yourself to `davfs2` group
> This lets you mount and write as your user (not root):
> ```bash
> sudo usermod -aG davfs2 $USER
> ```
> Then **log out and back in** (or restart the shell) for the group to apply.
> 
> ---
> 
> ### ✅ 2. Create a mount point with write access
> ```bash
> mkdir -p ~/tampermonkey-sync
> chown $USER: ~/tampermonkey-sync
> ```
> 
> ---
> 
> ### ✅ 3. Edit `/etc/fstab` to allow user mount
> Open `/etc/fstab`:
> ```bash
> sudo nano /etc/fstab
> ```
> 
> Add this line at the bottom:
> ```
> http://localhost:7000 /home/YOURUSER/tampermonkey-sync davfs user,noauto,uid=1000,gid=1000 0 0
> ```
> 
> Replace `YOURUSER`, `uid`, and `gid` with your actual username and ID:
> ```bash
> id -u # uid
> id -g # gid
> ```
> 
> ---
> 
> ### ✅ 4. Configure `~/.davfs2/secrets`
> Create and edit your secrets file:
> ```bash
> mkdir -p ~/.davfs2
> chmod 700 ~/.davfs2
> nano ~/.davfs2/secrets
> ```
> 
> Add:
> ```
> http://localhost:7000 <your_username> <your_password>
> ```
> 
> Leave username/password blank if you aren’t using any:
> ```
> http://localhost:7000 "" ""
> ```
> 
> Then:
> ```bash
> chmod 600 ~/.davfs2/secrets
> ```
> 
> ---
> 
> ### ✅ 5. Optional: disable file locking
> 
> Edit `~/.davfs2/davfs2.conf` and add:
> ```
> use_locks 0
> ```
> 
> ---
> 
> ### ✅ 6. Mount it as your user
> 
> Now you can mount it without sudo:
> ```bash
> mount ~/tampermonkey-sync
> ```
> 
> Try editing again in Emacs:
> ```bash
> emacs ~/tampermonkey-sync/Tampermonkey/sync/*.user.js
> ```
> 
> Should now be writeable.
> 
> ---
> 
> Want a one-liner shell script to wrap the mount + launch tamperdav? I can wire that up too.
<!-- UID: cfba330e-9a0a-4e4f-b2cb-0a1d01278bba -->

---




>[!nexus_user] **User** - 08/08/2025 at 5:07 PM
> Do I really hve to restart...I killed the shell and opened a new one, and is still not recognizing that I am in davfs2
<!-- UID: 4c096871-fb80-4f1a-a504-526e3274c581 -->




>[!nexus_agent] **Assistant** - 08/08/2025 at 5:07 PM
> Nope, you *shouldn't* need to fully restart — but just opening a new shell **won’t reload group membership** for your current session. That part is handled by the **login session**, not just the shell process.
> 
> So here's what's up:
> 
> ---
> 
> ## 🔍 Why your new shell doesn’t see `davfs2` group yet
> 
> When you run:
> 
> ```bash
> groups
> ```
> 
> ...and it doesn't list `davfs2`, it means your session still has the **old group list cached**.
> 
> ---
> 
> ## ✅ 3 ways to apply the new group without full reboot
> 
> ### 🥇 Best (minimal restart): log out of your desktop session
> Just log out from Ubuntu, then log back in. That applies group changes system-wide for your user.
> 
> ---
> 
> ### 🥈 ALT: use `su - $USER`
> This opens a new login shell with the new group applied:
> ```bash
> su - $USER
> ```
> 
> (You may need to enter your password again.)
> 
> Then confirm:
> ```bash
> groups | grep davfs2
> ```
> 
> If it's there, you're good.
> 
> ---
> 
> ### 🥉 Hacky temp fix: run `mount` with `sudo`
> Until your session sees the group, this works:
> ```bash
> sudo mount -t davfs http://localhost:7000 ~/tampermonkey-sync
> ```
> 
> But that's not the goal — we want **user-mountable**, read/write access.
> 
> ---
> 
> Let me know if you want to permanently mount it on login, or set up a tampermonkey-dev service that brings it all up in one go.
<!-- UID: ed3fdbbf-cdda-4234-b4b7-0a03cdf51d20 -->

---




>[!nexus_user] **User** - 08/08/2025 at 5:10 PM
> Ok... so that worked. Do I have to do anything to make sure my changes sync with my browser?
<!-- UID: 259774d1-1e89-4ea7-8fb8-ec980802bd21 -->




>[!nexus_agent] **Assistant** - 08/08/2025 at 5:10 PM
> Nice — you got write access! 🔓 Now for the sync part:
> 
> ---
> 
> ## ✅ To make sure your Emacs edits sync with Tampermonkey:
> 
> ### 🧠 1. Tampermonkey’s sync system watches for file changes
> Tampermonkey will automatically pick up changes **if**:
> 
> - You’ve enabled **WebDAV sync**
> - You’ve checked the box for **“Sync on each save”**
> - You’re editing the **exact files** from the WebDAV folder
> 
> You already mounted the correct folder, so the only gotcha left is metadata.
> 
> ---
> 
> ### 🔧 2. Enable `meta-touch` in TamperDAV (important!)
> 
> Tampermonkey *only detects changes* if the `.meta.json` file gets touched along with the script. This setting forces that.
> 
> Edit `TamperDAV/config.json`:
> 
> ```json
> {
>  "meta-touch": true
> }
> ```
> 
> Then restart TamperDAV:
> ```bash
> cd ~/TamperDAV
> ./tamperdav.sh
> ```
> 
> Now when you save a `.user.js` file in Emacs, TamperDAV will touch the `.meta.json`, and Tampermonkey will say:
> > 🔄 Synced script: `your-script.user.js`
> 
> ---
> 
> ## 🛠 Optional dev quality-of-life tips
> 
> ### 🧪 Test it:
> 1. Edit the `.user.js` in Emacs
> 2. Save it
> 3. Open the script in Tampermonkey dashboard — it should show your changes instantly
> 4. Optionally open console and log something: `console.log("hi from emacs")`
> 
> ---
> 
> ### 💡 Want a `file-watcher` that triggers Tampermonkey reloads manually?
> You *could* set up a `watchman` or `fswatch` daemon that touches `.meta.json` on save, but if `meta-touch: true` is set, you don’t need that.
> 
> ---
> 
> ### 🚫 Don't:
> - Don’t rename files in the sync folder
> - Don’t move them out-of-band (will break Tampermonkey link)
> - Don’t manually edit `.meta.json` unless you know what you're doing
> 
> ---
> 
> Let me know if you want an Emacs minor mode or hook that auto-lints userscripts or restarts the WebDAV mount if it fails.
<!-- UID: 7d3cc1bc-79a0-40eb-96da-bd5c5a5a57ff -->

---


