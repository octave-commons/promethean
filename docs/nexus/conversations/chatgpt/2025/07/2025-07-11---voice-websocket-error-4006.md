---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Voice WebSocket Error 4006"
conversation_id: 68712d0b-99cc-8004-8d2e-f14cc5d62d01
create_time: 07/11/2025 at 10:26 AM
update_time: 07/11/2025 at 10:55 AM
---

# Title: Voice WebSocket Error 4006

Created: 07/11/2025 at 10:26 AM
Last Updated: 07/11/2025 at 10:55 AM
Chat URL: https://chat.openai.com/c/68712d0b-99cc-8004-8d2e-f14cc5d62d01


>[!nexus_user] **User** - 07/11/2025 at 10:26 AM
> [2025-07-11 10:25:36] [INFO ] discord.voice_state: Voice handshake complete. Endpoint found: c-ord10-96bd4bd4.discord.media
> [2025-07-11 10:25:37] [ERROR ] discord.voice_state: Failed to connect to voice... Retrying in 9.0s...
> Traceback (most recent call last):
>  File "C:\Users\foamy\.virtualenvs\2_0-xfNAyVgc\Lib\site-packages\discord\voice_state.py", line 413, in _inner_connect
>  await self._handshake_websocket()
>  File "C:\Users\foamy\.virtualenvs\2_0-xfNAyVgc\Lib\site-packages\discord\voice_state.py", line 583, in _handshake_websocket
>  await self.ws.poll_event()
>  File "C:\Users\foamy\.virtualenvs\2_0-xfNAyVgc\Lib\site-packages\discord\gateway.py", line 1039, in poll_event
>  raise ConnectionClosed(self.ws, shard_id=None, code=self._close_code)
> discord.errors.ConnectionClosed: Shard ID None WebSocket closed with 4006
> [2025-07-11 10:25:37] [INFO ] discord.voice_state: The voice handshake is being terminated for Channel ID 343179912196128794 (Guild ID 343179912196128792)
> [2025-07-11 10:25:46] [INFO ] discord.voice_state: Voice connection complete.
> [2025-07-11 10:25:46] [INFO ] discord.voice_state: Disconnecting from voice normally, close code 1000.
<!-- UID: 4846a92e-73a9-412c-80a0-678f9ec62d4c -->




>[!nexus_agent] **Assistant** - 07/11/2025 at 10:26 AM
> This log suggests your Discord bot is having trouble completing the voice connection due to a WebSocket issue — specifically:
> 
> > `WebSocket closed with 4006`
> 
> ### What does WebSocket close code `4006` mean?
> 
> According to Discord's voice gateway error codes:
> - **4006** = *"Session no longer valid."*
> 
> This typically happens when:
> - The session has become stale or corrupted.
> - Discord wants you to **start a new session** rather than trying to resume.
> - This is usually recoverable by **cleanly closing and reconnecting**.
> 
> ---
> 
> ### Practical Fixes You Can Try
> 
> Here’s what to focus on:
> 
> #### ✅ 1. **Ensure clean session handling**
> After a `4006`, you **must** fully tear down and recreate the voice connection — including any internal voice WebSocket state. Check your reconnection logic to see if it’s trying to "resume" instead of starting over.
> 
> #### ✅ 2. **Update discord.py / fork**
> If you're not using the most recent voice-supported fork of `discord.py` (like `Pycord`, `Nextcord`, or `discord.py` 2.x with voice enabled), consider updating. Legacy forks or stale environments are more prone to these issues.
> 
> #### ✅ 3. **Avoid rapid reconnect attempts**
> Discord will sometimes throw `4006` if your bot reconnects to voice too rapidly. Try adding a **10–15 second delay** before reconnect attempts after a 4006.
> 
> #### ✅ 4. **Reconnect logic**
> Make sure you:
> ```python
> await voice_client.disconnect(force=True)
> await asyncio.sleep(10)
> await voice_client.connect(...)
> ```
> Or, if you're building from lower-level primitives, drop and recreate the **entire voice state object**.
> 
> #### ✅ 5. **Gateway connection stability**
> If your bot's internet is unstable, or your WS pings are too high, Discord might kill the session as invalid. Consider running the bot on a more stable network.
> 
> ---
> 
> ### Extra Debugging Tip
> Add a `debug=True` or equivalent verbose WebSocket log mode to your library, and watch for:
> - WS heartbeat failures
> - Unexpected pong/ping mismatches
> - Session resume attempts after a 4006
> 
> ---
> 
> Let me know what voice library and version you're using (`discord.py`, `nextcord`, custom, etc.), and I can help fine-tune the fix or look for specific bugs/workarounds.
<!-- UID: dbef3252-edeb-4371-9b9f-9c96b5127bcf -->

---




>[!nexus_user] **User** - 07/11/2025 at 10:54 AM
> I just don't understand. I'm using discord.py. It was working last night.
<!-- UID: e57f2393-4780-4236-9aa3-d96b918844e8 -->




>[!nexus_agent] **Assistant** - 07/11/2025 at 10:54 AM
> Yeah, that’s frustrating — especially when **it worked yesterday**, and now it just... breaks with no real code changes. Here's the thing with Discord voice: it's *finicky*, and sometimes the failure isn't even on your side.
> 
> Let’s break it down practically.
> 
> ---
> 
> ## ✅ What We Know:
> - You’re using `discord.py`.
> - The bot **successfully completed a handshake**: 
>  ```
>  [INFO] discord.voice_state: Voice handshake complete. Endpoint found
>  ```
> - Then it **immediately failed with WebSocket 4006**:
>  ```
>  discord.errors.ConnectionClosed: Shard ID None WebSocket closed with 4006
>  ```
> 
> ---
> 
> ## 🔍 Key Facts About `4006`:
> - It **only happens after a successful initial connect** — Discord accepts the connection but then **drops the session as invalid**.
> - It is **not your bot code, per se**, but something at the **protocol level** (Discord voice server, voice gateway WebSocket, etc.)
> 
> ---
> 
> ## ⚠️ The Reality:
> Here’s what might have caused this **despite no code changes**:
> 
> ### 1. **Discord rolled something out**
> Voice servers update all the time — Discord may have changed something on a regional server that your bot is now hitting. This could invalidate sessions on connect.
> 
> ### 2. **Your bot was mid-session when the app restarted**
> Did you close your dev environment (e.g. Ctrl+C) last night? If the bot crashed or didn’t cleanly disconnect, Discord might think it’s still connected, and refuse a reconnect.
> 
> ### 3. **Network changes (IP shift, NAT timeout)**
> If your **public IP address changed** overnight (e.g., dynamic IP from ISP or dev laptop moved networks), Discord may reject the resumed session.
> 
> ---
> 
> ## 🧰 What You Should Try Right Now
> 
> ### 🔁 Full Restart
> 1. Fully stop the bot.
> 2. Wait 15 seconds.
> 3. Restart the bot **from a cold state** (fresh process).
> 
> This will ensure it doesn't try to *resume* a broken session. Discord expects you to start fresh after `4006`.
> 
> ---
> 
> ### 🧼 Add Clean Voice Disconnect Logic
> If you didn’t have it already, make sure you're calling:
> ```python
> await voice_client.disconnect(force=True)
> ```
> before retrying to join voice. If you’re just calling `connect` again after a failure without cleaning up first, it can *reuse* stale state.
> 
> ---
> 
> ### 🧪 Try a Different Voice Channel
> Sometimes one voice channel gets into a bad state. Just try connecting to a different one on the same server to see if it changes the behavior.
> 
> ---
> 
> ## 🛠 If It Still Fails:
> Please tell me:
> - What version of `discord.py` you’re using (`pip freeze | findstr discord`)
> - Your OS and Python version
> - Whether you're using any forks (`nextcord`, `pycord`, etc.)
> - Any custom voice connection logic you’re using
> 
> That’ll help figure out if this is a bug, a known issue, or something we can patch around with better logic.
> 
> Let’s dig in and get it stable — it’s probably one dumb state flag somewhere.
<!-- UID: f982d85d-eb81-4177-a55b-acfd254aadfd -->

---


