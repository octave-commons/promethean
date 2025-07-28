(import os)

(setv AGENT_NAME (.get os.environ "AGENT_NAME" "duck"))

(setv MIN_TEMP (float (.get os.environ "MIN_TEMP" 0.7)))
(setv MAX_TEMP (float (.get os.environ "MAX_TEMP" 0.9)))

(setv MONGODB_HOST_NAME (.get os.environ "MONGODB_HOST_NAME" "localhost"))
(setv MONGODB_ADMIN_DATABASE_NAME (.get os.environ "MONGODB_ADMIN_DATABASE_NAME" "database"))
(setv MONGODB_ADMIN_USER_NAME (.get os.environ "MONGODB_ADMIN_USER_NAME" "root"))
(setv MONGODB_ADMIN_USER_PASSWORD (.get os.environ "MONGODB_ADMIN_USER_PASSWORD" "example"))

(setv DISCORD_TOKEN (.__getitem__ os.environ "DISCORD_TOKEN"))

(setv DISCORD_CLIENT_USER_ID (.get os.environ "DISCORD_CLIENT_USER_ID"))
(setv DISCORD_CLIENT_USER_NAME (.get os.environ "DISCORD_CLIENT_USER_NAME"))

(setv DEFAULT_CHANNEL (.__getitem__ os.environ "DEFAULT_CHANNEL"))
(setv DEFAULT_CHANNEL_NAME (.__getitem__ os.environ "DEFAULT_CHANNEL_NAME"))

(setv model-path (f"/app/models/{AGENT_NAME}_gpt.v0.6.1/"))

(setv AUTHOR_ID (.get os.environ "AUTHOR_ID"))
(setv AUTHOR_NAME (.get os.environ "AUTHOR_NAME" "error"))

(setv PROFILE_CHANNEL_ID (.get os.environ "PROFILE_CHANNEL_ID"))
