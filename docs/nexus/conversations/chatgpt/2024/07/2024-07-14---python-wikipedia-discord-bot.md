---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Python Wikipedia Discord bot"
conversation_id: de84ca9b-9a27-4530-be4f-44769c2cc9c3
create_time: 07/14/2024 at 12:29 AM
update_time: 07/14/2024 at 1:52 AM
---

# Title: Python Wikipedia Discord bot

Created: 07/14/2024 at 12:29 AM
Last Updated: 07/14/2024 at 1:52 AM
Chat URL: https://chat.openai.com/c/de84ca9b-9a27-4530-be4f-44769c2cc9c3


>[!nexus_user] **User** - 07/14/2024 at 12:29 AM
> Python script which sends chunks of wikipedia articles to a discord channel between 1 and 10 seconds apart
<!-- UID: aaa2b225-a4c0-4e80-89ba-8080b3fe64d2 -->




>[!nexus_agent] **Assistant** - 07/14/2024 at 12:29 AM
> To create a Python script that sends chunks of Wikipedia articles to a Discord channel with random intervals between 1 and 10 seconds, you'll need to use the `discord.py` library for interacting with Discord and the `wikipedia-api` library for fetching Wikipedia articles. 
> 
> First, make sure you have the necessary libraries installed:
> 
> ```bash
> pip install discord.py wikipedia-api
> ```
> 
> Here is the script:
> 
> ```python
> import discord
> import wikipediaapi
> import asyncio
> import random
> 
> # Set up the Wikipedia API
> wiki_wiki = wikipediaapi.Wikipedia('en')
> 
> # Discord bot token and channel ID
> TOKEN = 'YOUR_DISCORD_BOT_TOKEN'
> CHANNEL_ID = YOUR_CHANNEL_ID
> 
> # Define a client for discord
> intents = discord.Intents.default()
> client = discord.Client(intents=intents)
> 
> # Function to fetch and chunk Wikipedia content
> def get_wikipedia_chunks(page_title, chunk_size=200):
>  page = wiki_wiki.page(page_title)
>  if not page.exists():
>  return ["Page not found."]
>  content = page.text
>  return [content[i:i+chunk_size] for i in range(0, len(content), chunk_size)]
> 
> # Event listener when the bot has connected to the server
> @client.event
> async def on_ready():
>  print(f'We have logged in as {client.user}')
>  channel = client.get_channel(CHANNEL_ID)
>  
>  # Change the title to the Wikipedia article you want to fetch
>  page_title = 'Python (programming language)'
>  chunks = get_wikipedia_chunks(page_title)
>  
>  for chunk in chunks:
>  await channel.send(chunk)
>  await asyncio.sleep(random.randint(1, 10))
> 
> # Run the bot
> client.run(TOKEN)
> ```
> 
> ### Explanation:
> 1. **Imports and Setup**:
>  - `discord`: For interacting with the Discord API.
>  - `wikipediaapi`: For fetching Wikipedia articles.
>  - `asyncio` and `random`: For handling asynchronous delays and random intervals.
> 
> 2. **Wikipedia API Initialization**: Sets up the Wikipedia API client to fetch articles in English.
> 
> 3. **Discord Bot Initialization**:
>  - `TOKEN`: Replace `'YOUR_DISCORD_BOT_TOKEN'` with your actual Discord bot token.
>  - `CHANNEL_ID`: Replace `YOUR_CHANNEL_ID` with the actual ID of the channel where you want to send messages.
> 
> 4. **Fetching and Chunking Wikipedia Content**:
>  - `get_wikipedia_chunks`: Fetches the Wikipedia page content and splits it into chunks of 200 characters each.
> 
> 5. **Event Listener `on_ready`**:
>  - Sends each chunk to the specified Discord channel with a random delay between 1 and 10 seconds.
> 
> Make sure your bot has permission to send messages to the specified channel. To get your bot's token and channel ID, you need to create a bot on the Discord Developer Portal and invite it to your server with appropriate permissions.
<!-- UID: 45247bea-440c-4a0f-a5f0-d1fd0c52e25c -->

---




>[!nexus_user] **User** - 07/14/2024 at 12:58 AM
> Fetch a random article then crawl the
<!-- UID: aaa2f644-d807-4f04-9c57-92203d888d6f -->




>[!nexus_agent] **Assistant** - 07/14/2024 at 12:58 AM
> To extend the script to fetch a random Wikipedia article and then crawl the , you'll need to modify it to use the Wikipedia API for fetching random articles and extracting . Here's an enhanced version of the script:
> 
> 1. Install the required libraries if you haven't already:
> 
> ```bash
> pip install discord.py wikipedia-api
> ```
> 
> 2. Here is the updated script:
> 
> ```python
> import discord
> import wikipediaapi
> import asyncio
> import random
> 
> # Set up the Wikipedia API
> wiki_wiki = wikipediaapi.Wikipedia('en')
> 
> # Discord bot token and channel ID
> TOKEN = 'YOUR_DISCORD_BOT_TOKEN'
> CHANNEL_ID = YOUR_CHANNEL_ID
> 
> # Define a client for discord
> intents = discord.Intents.default()
> client = discord.Client(intents=intents)
> 
> # Function to fetch and chunk Wikipedia content
> def get_wikipedia_chunks(page_title, chunk_size=200):
>  page = wiki_wiki.page(page_title)
>  if not page.exists():
>  return ["Page not found."]
>  content = page.text
>  return [content[i:i+chunk_size] for i in range(0, len(content), chunk_size)]
> 
> # Function to fetch a random Wikipedia page title
> def get_random_page_title():
>  random_page = wiki_wiki.random()
>  return random_page.title
> 
> # Function to fetch from a Wikipedia page
> def get_page_(page_title):
>  page = wiki_wiki.page(page_title)
>  if not page.exists():
>  return []
>  return list(page..keys())
> 
> # Event listener when the bot has connected to the server
> @client.event
> async def on_ready():
>  print(f'We have logged in as {client.user}')
>  channel = client.get_channel(CHANNEL_ID)
>  
>  # Fetch a random Wikipedia page
>  random_page_title = get_random_page_title()
>  await channel.send(f"Random article: {random_page_title}")
>  
>  # Get and send chunks of the random page
>  chunks = get_wikipedia_chunks(random_page_title)
>  for chunk in chunks:
>  await channel.send(chunk)
>  await asyncio.sleep(random.randint(1, 10))
>  
>  # Get from the random page
>  = get_page_(random_page_title)
>  if :
>  await channel.send("Crawling from the random article...")
>  for link in [:5]: # Limit to first 5 to avoid flooding the channel
>  await channel.send(f"Crawling link: {link}")
>  = get_wikipedia_chunks(link)
>  for chunk in :
>  await channel.send(chunk)
>  await asyncio.sleep(random.randint(1, 10))
>  else:
>  await channel.send("No found in the random article.")
> 
> # Run the bot
> client.run(TOKEN)
> ```
> 
> ### Explanation:
> 1. **New Functionality**:
>  - `get_random_page_title`: Fetches a random Wikipedia page title.
>  - `get_page_`: Fetches the from a given Wikipedia page.
> 
> 2. **Event Listener `on_ready`**:
>  - Fetches a random Wikipedia article and sends its title to the specified channel.
>  - Sends chunks of the random article to the channel with random delays.
>  - Fetches and sends chunks of up to 5 articles from the random article.
> 
> Replace `YOUR_DISCORD_BOT_TOKEN` and `YOUR_CHANNEL_ID` with your actual bot token and channel ID.
> 
> This script will fetch a random Wikipedia article, send its content in chunks to a Discord channel, and then crawl and send the content of the first 5 articles. The delays between sending messages help to avoid hitting rate limits and making the bot's activity more natural.
<!-- UID: d86ac3b8-dfb5-43f1-966e-257173dcb994 -->

---




>[!nexus_user] **User** - 07/14/2024 at 1:10 AM
> zen-1 | Traceback (most recent call last):
> zen-1 | File "/app/./main.py", line 9, in <module>
> zen-1 | wiki_wiki = wikipediaapi.Wikipedia('en')
> zen-1 | File "/.venv/lib/python3.10/site-packages/wikipediaapi/__init__.py", line 166, in __init__
> zen-1 | raise AssertionError(
> zen-1 | AssertionError: Please, be nice to Wikipedia and specify user agent - https://meta.wikimedia.org/wiki/User-Agent_policy. Current user_agent: 'en' is not sufficient.
> zen-1 | Traceback (most recent call last):
> zen-1 | File "/app/./main.py", line 9, in <module>
> zen-1 | wiki_wiki = wikipediaapi.Wikipedia('en')
> zen-1 | File "/.venv/lib/python3.10/site-packages/wikipediaapi/__init__.py", line 166, in __init__
> zen-1 | raise AssertionError(
> zen-1 | AssertionError: Please, be nice to Wikipedia and specify user agent - https://meta.wikimedia.org/wiki/User-Agent_policy. Current user_agent: 'en' is not sufficient.
<!-- UID: aaa292d4-9548-4c71-937a-55981330cc47 -->




>[!nexus_agent] **Assistant** - 07/14/2024 at 1:10 AM
> The error you are encountering is because the `wikipedia-api` library requires you to specify a user agent string to comply with Wikipedia's User-Agent policy. Here is the updated script with the user agent included:
> 
> 1. Install the required libraries if you haven't already:
> 
> ```bash
> pip install discord.py wikipedia-api
> ```
> 
> 2. Here is the updated script:
> 
> ```python
> import discord
> import wikipediaapi
> import asyncio
> import random
> 
> # Set up the Wikipedia API with a user agent
> user_agent = 'MyDiscordBot/1.0 (https://github.com/yourusername/yourrepository)'
> wiki_wiki = wikipediaapi.Wikipedia('en', user_agent=user_agent)
> 
> # Discord bot token and channel ID
> TOKEN = 'YOUR_DISCORD_BOT_TOKEN'
> CHANNEL_ID = YOUR_CHANNEL_ID
> 
> # Define a client for discord
> intents = discord.Intents.default()
> client = discord.Client(intents=intents)
> 
> # Function to fetch and chunk Wikipedia content
> def get_wikipedia_chunks(page_title, chunk_size=200):
>  page = wiki_wiki.page(page_title)
>  if not page.exists():
>  return ["Page not found."]
>  content = page.text
>  return [content[i:i+chunk_size] for i in range(0, len(content), chunk_size)]
> 
> # Function to fetch a random Wikipedia page title
> def get_random_page_title():
>  random_page = wiki_wiki.random()
>  return random_page.title
> 
> # Function to fetch from a Wikipedia page
> def get_page_(page_title):
>  page = wiki_wiki.page(page_title)
>  if not page.exists():
>  return []
>  return list(page..keys())
> 
> # Event listener when the bot has connected to the server
> @client.event
> async def on_ready():
>  print(f'We have logged in as {client.user}')
>  channel = client.get_channel(CHANNEL_ID)
>  
>  # Fetch a random Wikipedia page
>  random_page_title = get_random_page_title()
>  await channel.send(f"Random article: {random_page_title}")
>  
>  # Get and send chunks of the random page
>  chunks = get_wikipedia_chunks(random_page_title)
>  for chunk in chunks:
>  await channel.send(chunk)
>  await asyncio.sleep(random.randint(1, 10))
>  
>  # Get from the random page
>  = get_page_(random_page_title)
>  if :
>  await channel.send("Crawling from the random article...")
>  for link in [:5]: # Limit to first 5 to avoid flooding the channel
>  await channel.send(f"Crawling link: {link}")
>  = get_wikipedia_chunks(link)
>  for chunk in :
>  await channel.send(chunk)
>  await asyncio.sleep(random.randint(1, 10))
>  else:
>  await channel.send("No found in the random article.")
> 
> # Run the bot
> client.run(TOKEN)
> ```
> 
> ### Explanation:
> 1. **User Agent**:
>  - `user_agent`: A string that identifies your bot, following Wikipedia's User-Agent policy.
>  - `wiki_wiki = wikipediaapi.Wikipedia('en', user_agent=user_agent)`: Initializes the Wikipedia API with the specified user agent.
> 
> 2. **Rest of the Script**: Remains the same as before, handling fetching and sending Wikipedia content and to the Discord channel.
> 
> Replace `YOUR_DISCORD_BOT_TOKEN` and `YOUR_CHANNEL_ID` with your actual bot token and channel ID. Adjust the `user_agent` string to something appropriate for your bot, including a URL where users can find more information about it.
<!-- UID: 17f5b801-637e-4494-9fe6-c7f96651c439 -->

---




>[!nexus_user] **User** - 07/14/2024 at 1:14 AM
> zen-1 | 2024-07-14 06:13:44 ERROR discord.client Ignoring exception in on_ready
> zen-1 | Traceback (most recent call last):
> zen-1 | File "/.venv/lib/python3.10/site-packages/discord/client.py", line 449, in _run_event
> zen-1 | await coro(*args, **kwargs)
> zen-1 | File "/app/./main.py", line 39, in on_ready
> zen-1 | await channel.send(chunk)
> zen-1 | File "/.venv/lib/python3.10/site-packages/discord/abc.py", line 1618, in send
> zen-1 | data = await state.http.send_message(channel.id, params=params)
> zen-1 | File "/.venv/lib/python3.10/site-packages/discord/http.py", line 752, in request
> zen-1 | raise Forbidden(response, data)
> zen-1 | discord.errors.Forbidden: 403 Forbidden (error code: 50013): Missing Permissions
<!-- UID: aaa20df2-3d79-4b83-a087-b9de52d3c489 -->




>[!nexus_agent] **Assistant** - 07/14/2024 at 1:14 AM
> The error you're encountering indicates that the bot does not have the necessary permissions to send messages in the specified channel. You'll need to ensure that your bot has the `Send Messages` permission in the channel where you want it to send the messages.
> 
> Here's how you can resolve this issue:
> 
> 1. **Check Bot Permissions**:
>  - Go to your Discord server and locate the channel where you want the bot to send messages.
>  - Click on the channel name and select `Edit Channel`.
>  - Go to the `Permissions` tab and make sure that your bot's role has the `Send Messages` permission enabled.
> 
> 2. **Update Bot's Role**:
>  - Go to `Server Settings` > `Roles`.
>  - Ensure that the bot's role has the necessary permissions to read messages and send messages in the channel.
> 
> 3. **Verify Channel ID and Bot Token**:
>  - Double-check that the `CHANNEL_ID` and `TOKEN` variables in your script are correctly set.
> 
> Once you've ensured that the bot has the necessary permissions, the script should work without any issues. Here is a reminder of the script to use, in case you need it again:
> 
> ```python
> import discord
> import wikipediaapi
> import asyncio
> import random
> 
> # Set up the Wikipedia API with a user agent
> user_agent = 'MyDiscordBot/1.0 (https://github.com/yourusername/yourrepository)'
> wiki_wiki = wikipediaapi.Wikipedia('en', user_agent=user_agent)
> 
> # Discord bot token and channel ID
> TOKEN = 'YOUR_DISCORD_BOT_TOKEN'
> CHANNEL_ID = YOUR_CHANNEL_ID
> 
> # Define a client for discord
> intents = discord.Intents.default()
> client = discord.Client(intents=intents)
> 
> # Function to fetch and chunk Wikipedia content
> def get_wikipedia_chunks(page_title, chunk_size=200):
>  page = wiki_wiki.page(page_title)
>  if not page.exists():
>  return ["Page not found."]
>  content = page.text
>  return [content[i:i+chunk_size] for i in range(0, len(content), chunk_size)]
> 
> # Function to fetch a random Wikipedia page title
> def get_random_page_title():
>  random_page = wiki_wiki.random()
>  return random_page.title
> 
> # Function to fetch from a Wikipedia page
> def get_page_(page_title):
>  page = wiki_wiki.page(page_title)
>  if not page.exists():
>  return []
>  return list(page..keys())
> 
> # Event listener when the bot has connected to the server
> @client.event
> async def on_ready():
>  print(f'We have logged in as {client.user}')
>  channel = client.get_channel(CHANNEL_ID)
>  
>  # Fetch a random Wikipedia page
>  random_page_title = get_random_page_title()
>  await channel.send(f"Random article: {random_page_title}")
>  
>  # Get and send chunks of the random page
>  chunks = get_wikipedia_chunks(random_page_title)
>  for chunk in chunks:
>  await channel.send(chunk)
>  await asyncio.sleep(random.randint(1, 10))
>  
>  # Get from the random page
>  = get_page_(random_page_title)
>  if :
>  await channel.send("Crawling from the random article...")
>  for link in [:5]: # Limit to first 5 to avoid flooding the channel
>  await channel.send(f"Crawling link: {link}")
>  = get_wikipedia_chunks(link)
>  for chunk in :
>  await channel.send(chunk)
>  await asyncio.sleep(random.randint(1, 10))
>  else:
>  await channel.send("No found in the random article.")
> 
> # Run the bot
> client.run(TOKEN)
> ```
> 
> Make sure to replace `YOUR_DISCORD_BOT_TOKEN` and `YOUR_CHANNEL_ID` with the correct values.
<!-- UID: 66b3b1a9-b7e0-40b9-b069-0d19c14ed11e -->

---




>[!nexus_user] **User** - 07/14/2024 at 1:25 AM
> random reddit
<!-- UID: aaa2258c-16dc-49cb-be32-47edf9095fe8 -->




>[!nexus_agent] **Assistant** - 07/14/2024 at 1:25 AM
> To fetch random posts from Reddit and send them to a Discord channel, you'll need to use the `praw` library for interacting with the Reddit API and `discord.py` for interacting with the Discord API. 
> 
> First, ensure you have the necessary libraries installed:
> 
> ```bash
> pip install discord.py praw
> ```
> 
> ### Setting Up Reddit API Credentials
> You need to create an application on Reddit to get the `client_id`, `client_secret`, and `user_agent`. Follow [these instructions](https://www.reddit.com/prefs/apps) to create an application and get the necessary credentials.
> 
> ### Script to Fetch Random Reddit Posts and Send to Discord
> 
> Here's the complete script:
> 
> ```python
> import discord
> import praw
> import asyncio
> import random
> 
> # Reddit API credentials
> REDDIT_CLIENT_ID = 'YOUR_REDDIT_CLIENT_ID'
> REDDIT_CLIENT_SECRET = 'YOUR_REDDIT_CLIENT_SECRET'
> REDDIT_USER_AGENT = 'MyDiscordBot/1.0'
> 
> # Set up the Reddit API
> reddit = praw.Reddit(
>  client_id=REDDIT_CLIENT_ID,
>  client_secret=REDDIT_CLIENT_SECRET,
>  user_agent=REDDIT_USER_AGENT
> )
> 
> # Discord bot token and channel ID
> TOKEN = 'YOUR_DISCORD_BOT_TOKEN'
> CHANNEL_ID = YOUR_CHANNEL_ID
> 
> # Define a client for Discord
> intents = discord.Intents.default()
> client = discord.Client(intents=intents)
> 
> # Function to fetch a random post from a subreddit
> def get_random_reddit_post(subreddit_name='all'):
>  subreddit = reddit.subreddit(subreddit_name)
>  posts = [post for post in subreddit.hot(limit=100)]
>  return random.choice(posts)
> 
> # Event listener when the bot has connected to the server
> @client.event
> async def on_ready():
>  print(f'We have logged in as {client.user}')
>  channel = client.get_channel(CHANNEL_ID)
> 
>  for _ in range(5): # Fetch and send 5 random posts
>  post = get_random_reddit_post()
>  message = f"**{post.title}**\n{post.url}\n{post.selftext[:200] if post.selftext else ''}"
>  await channel.send(message)
>  await asyncio.sleep(random.randint(1, 10))
> 
> # Run the bot
> client.run(TOKEN)
> ```
> 
> ### Explanation:
> 1. **Reddit API Setup**:
>  - `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USER_AGENT`: Replace with your Reddit API credentials.
>  - Initializes the `praw` Reddit API client.
> 
> 2. **Discord Bot Setup**:
>  - `TOKEN` and `CHANNEL_ID`: Replace with your Discord bot token and channel ID.
>  - Initializes the `discord.py` client.
> 
> 3. **Fetching Random Reddit Posts**:
>  - `get_random_reddit_post`: Fetches a random post from the specified subreddit (default is 'all').
> 
> 4. **Event Listener `on_ready`**:
>  - Sends 5 random posts to the specified Discord channel with random delays between 1 and 10 seconds.
> 
> Make sure to replace the placeholders (`YOUR_REDDIT_CLIENT_ID`, `YOUR_REDDIT_CLIENT_SECRET`, `YOUR_REDDIT_USER_AGENT`, `YOUR_DISCORD_BOT_TOKEN`, and `YOUR_CHANNEL_ID`) with the actual values for your Reddit and Discord credentials. This script fetches random posts from Reddit and sends them to your Discord channel. Adjust the `range(5)` to control how many posts you want to send.
<!-- UID: b20c083c-34af-460f-b319-8d684efacf6f -->

---


