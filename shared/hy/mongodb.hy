(import os)
(import [pymongo [MongoClient]])
(import [shared.hy.settings :as settings])

(setv AGENT_NAME settings.AGENT_NAME)

(defn get-database []
  (setv CONNECTION_STRING (f"mongodb://{settings.MONGODB_HOST_NAME}/{settings.MONGODB_ADMIN_DATABASE_NAME}"))
  (setv client (MongoClient CONNECTION_STRING))
  (.__getitem__ client settings.MONGODB_ADMIN_DATABASE_NAME))

(if (= __name__ "__main__")
  (setv dbname (get-database)))

(setv db (get-database))
(setv discord_message_collection (.__getitem__ db (f"{AGENT_NAME}_discord_messages")))
(setv timmy_answers_collection (.__getitem__ db (f"{AGENT_NAME}_timmy_answers")))
(setv timmy_answer_cache_collection (.__getitem__ db (f"{AGENT_NAME}_timmy_answer_cache")))

(setv generated_message_collection (.__getitem__ db (f"{AGENT_NAME}_generated_messages")))

(setv discord_channel_collection (.__getitem__ db (f"{AGENT_NAME}_discord_channels")))
(setv discord_user_collection (.__getitem__ db (f"{AGENT_NAME}_discord_users")))
(setv discord_server_collection (.__getitem__ db (f"{AGENT_NAME}_discord_servers")))

(setv duck_gpt (.__getitem__ db (f"{AGENT_NAME}_gpt")))
