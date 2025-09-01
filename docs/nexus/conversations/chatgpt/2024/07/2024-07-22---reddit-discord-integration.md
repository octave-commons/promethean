---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Reddit Discord Integration"
conversation_id: f81f15f5-5595-4ac1-a84a-509e670513b8
create_time: 07/22/2024 at 1:18 AM
update_time: 07/22/2024 at 1:19 AM
---

# Title: Reddit Discord Integration

Created: 07/22/2024 at 1:18 AM
Last Updated: 07/22/2024 at 1:19 AM
Chat URL: https://chat.openai.com/c/f81f15f5-5595-4ac1-a84a-509e670513b8


>[!nexus_user] **User** - 07/22/2024 at 1:18 AM
> crawl reddit with python. post to discord
<!-- UID: aaa28c2c-cc89-4441-b40e-fde950dc91b0 -->




>[!nexus_agent] **Assistant** - 07/22/2024 at 1:19 AM
> To crawl Reddit and post to Discord using Python, you can use the `praw` library for Reddit and `discord.py` for Discord. Below are the steps and example code to achieve this.
> 
> ### Steps:
> 
> 1. **Set up Reddit API credentials**:
>  - Create a Reddit application [here](https://www.reddit.com/prefs/apps).
>  - Note the `client_id`, `client_secret`, `user_agent`, and other necessary credentials.
> 
> 2. **Set up Discord bot**:
>  - Create a Discord bot [here](https://discord.com/developers/applications).
>  - Note the bot token and invite the bot to your server.
> 
> 3. **Install required libraries**:
>  ```sh
>  pip install praw discord.py
>  ```
> 
> 4. **Write the Python script**:
> 
> ### Example Python Script:
> 
> ```python
> import praw
> import discord
> from discord.ext import tasks
> 
> # Reddit API credentials
> REDDIT_CLIENT_ID = 'your_client_id'
> REDDIT_CLIENT_SECRET = 'your_client_secret'
> REDDIT_USER_AGENT = 'your_user_agent'
> 
> # Discord Bot Token
> DISCORD_TOKEN = 'your_discord_token'
> DISCORD_CHANNEL_ID = 123456789012345678 # Replace with your Discord channel ID
> 
> # Initialize Reddit client
> reddit = praw.Reddit(
>  client_id=REDDIT_CLIENT_ID,
>  client_secret=REDDIT_CLIENT_SECRET,
>  user_agent=REDDIT_USER_AGENT
> )
> 
> # Initialize Discord client
> client = discord.Client()
> 
> @client.event
> async def on_ready():
>  print(f'Logged in as {client.user}')
>  check_reddit_posts.start()
> 
> @tasks.loop(minutes=10) # Set the interval to check Reddit
> async def check_reddit_posts():
>  channel = client.get_channel(DISCORD_CHANNEL_ID)
>  subreddit = reddit.subreddit('python') # Replace with your desired subreddit
>  for submission in subreddit.new(limit=5): # Fetch the latest 5 posts
>  title = submission.title
>  url = submission.url
>  await channel.send(f"**{title}**\n{url}")
> 
> # Run the Discord bot
> client.run(DISCORD_TOKEN)
> ```
> 
> ### Explanation:
> 
> 1. **Reddit API**: 
>  - Initialize the Reddit client using `praw.Reddit` with your credentials.
>  - Fetch new posts from the specified subreddit.
> 
> 2. **Discord Bot**:
>  - Initialize the Discord client using `discord.Client()`.
>  - Define an asynchronous task to fetch and post Reddit content to a Discord channel.
>  - Start the bot with `client.run(DISCORD_TOKEN)`.
> 
> 3. **Tasks Loop**:
>  - Use `@tasks.loop(minutes=10)` to run the `check_reddit_posts` function every 10 minutes.
>  - Fetch the latest 5 posts from the specified subreddit and send them to the specified Discord channel.
> 
> ### Running the Script:
> - Make sure to replace placeholders (`your_client_id`, `your_client_secret`, `your_user_agent`, `your_discord_token`, and `DISCORD_CHANNEL_ID`) with actual values.
> - Run the script in your Python environment.
> 
> This script will automatically fetch new posts from the specified subreddit and post them to the designated Discord channel at regular intervals.
<!-- UID: 8107ab44-6778-45f5-9e14-e5d17ad29e43 -->

---


