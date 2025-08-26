"\nScan Discord history for attachments and add their metadata to message documents.\n"
(import os)
(import sys)
(import asyncio)
(import random)
(import discord)
((. sys.path insert) 0 ((. os.path join) ((. os.path dirname) __file__) "../../../"))
(import shared.py [settings])
(import shared.py.mongodb [discord_channel_collection])
(import shared.py.utils.discord [fetch_channel_history shuffle_array update_cursor])
(import shared.py.utils.discord_attachment [index_attachments])

(setv AGENT_NAME ((. os.environ get) "AGENT_NAME" "duck"))
(print f"Discord attachment indexer running for {AGENT_NAME}")
(setv intents ((. discord.Intents default)))
(setv client (discord.Client :intents intents))
(setv intents.message_content True)


(defn :async (annotate index_channel None) [(annotate channel discord.TextChannel)]
  (setv newest_message None)
  (for [message (await (fetch_channel_history channel discord_channel_collection "attachment_cursor"))]
    (await (asyncio.sleep 0.1))
    (setv newest_message message)
    (index_attachments message))
  (when (is-not newest_message None)
    (update_cursor discord_channel_collection channel.id newest_message.id "attachment_cursor")))

(defn :async [client.event] on_ready []
  (while True
    (for [channel (shuffle_array (list (client.get_all_channels)))]
      (when (isinstance channel discord.TextChannel)
        (setv random_sleep (random.randint 1 10))
        (await (asyncio.sleep random_sleep))
        (await (index_channel channel))))))

(defn :async [client.event] on_message [message]
  (index_attachments message))

(client.run settings.DISCORD_TOKEN)
