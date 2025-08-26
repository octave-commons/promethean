"\nCrawl through discord history and fill in all messages that are not getting processed in real time.\n"
(import os)
(setv AGENT_NAME ((. os.environ get) "AGENT_NAME" "duck"))
(print f"Discord indexer running for {AGENT_NAME}")
(import sys)
((. sys.path insert) 0 ((. os.path join) ((. os.path dirname) __file__) "../../../"))
(import asyncio)
(import random)
(import traceback)
(import typing [List])
(import discord)
(import shared.py [settings])
(import shared.py.mongodb [discord_message_collection discord_channel_collection])
(import shared.py.utils.discord [fetch_channel_history shuffle_array update_cursor])

(setv intents ((. discord.Intents default)))
(setv client (discord.Client :intents intents))
(setv intents.message_content True)

(defn format_message [message]
  (setv channel message.channel)
  (setv author message.author)
  (if (hasattr channel "name")
      (do (setv channel_name channel.name))
      (do (setv channel_name f"DM from {(. channel.recipient name)}")))
  (return {"id" message.id  "recipient" settings.DISCORD_CLIENT_USER_ID  "recipient_name" settings.DISCORD_CLIENT_USER_NAME  "created_at" (str message.created_at)  "raw_mentions" message.raw_mentions  "author_name" author.name  "guild" (. message.guild id)
           "channel_name" channel_name  "content" message.content  "author" author.id  "channel" channel.id}))

(defn (annotate index_message None) [(annotate message discord.Message)]
  "\n    Index a message only if it has not already been added to mongo.\n    "
  (setv message_record (discord_message_collection.find_one {"id" message.id}))
  (if (is message_record None)
      (do (print f"Indexing message {message.id} {message.content}")
          (discord_message_collection.insert_one (format_message message)))
      (do (print f"Message {message.id} already indexed")
          (print message_record))))

(defn :async (annotate index_channel None) [(annotate channel discord.TextChannel)]
  "\n    Index all messages in a channel.\n "
  (setv newest_message None)
  (print f"Indexing channel {channel}")
  (for [message (await (fetch_channel_history channel discord_channel_collection "cursor"))]
    (await (asyncio.sleep 0.1))
    (setv newest_message message)
    (index_message message))
  (when (is-not newest_message None)
    (update_cursor discord_channel_collection channel.id newest_message.id "cursor"))
  (print f"Newest message: {newest_message}"))

(defn :async [client.event] on_ready []
  (while True
    (for [channel (shuffle_array (list (client.get_all_channels)))]
      (when (isinstance channel discord.TextChannel)
        (print f"Indexing channel {channel}")
        (setv random_sleep (random.randint 1 10))
        (await (asyncio.sleep random_sleep))
        (await (index_channel channel))))))

(defn :async [client.event] on_message [message]
  (print message)
  (index_message message))

(client.run settings.DISCORD_TOKEN)
