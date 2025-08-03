# Discord speaker.js

## Project structure

### bot.js

Handles everything to do with the top level discord.js library

### voice-session.js

Handles everything todo with discord/voice

# Runtime configuration

Some Cephalon settings can be adjusted via Discord slash commands without restarting the service:

- `/set_config` – update runtime values such as `historyLimit`, `forcedStopThreshold` or `prompt`.
- `/set_state` – update inner state fields like `currentMood`, `currentGoal`, `likes`, and similar values. Array fields (`chatMembers`, `selfAffirmations`) accept comma-separated lists.

#hashtags: #cephalon #service #promethean
