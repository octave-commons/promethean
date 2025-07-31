
// we have a mongodb instance running seperately from this file that the services depend on.
// we'll figure out what to do about that in the future.

// an instruction to future users?
// a container?

// I moved this out of containers because I was using the NPU for some of these services.
// and docker is just not the place to run that.
// either way, you use docker, you use a mongo db instance
// someone needs to download a program as a dependency.

module.exports = {
    apps: [

        {
            name: "duck_discord_indexer",
            script:"./scripts/discord_indexer_run.sh",
            interpreter: "bash",
            instances: 1,
            autorestart: true,
            "env_file": ".env",
            restart_delay: 10000,
            kill_timeout: 10000
        },
        {
            "name": "duck_cephalon",
            "cwd": ".",
            "script":"./scripts/duck_cephalon_run.sh",
            "interpreter": "bash",
            "autorestart": true,
            "env_file": ".env",
            restart_delay: 10000,
            kill_timeout: 10000 // wait 5s before SIGKILL

        },
        {
            "name": "duck_embedder",
            "cwd": ".",
            "script":"./scripts/duck_discord_embedder.sh",
            "interpreter": "bash",
            "autorestart": true,
            "env_file": ".env",
            restart_delay: 10000,
            kill_timeout: 10000 // wait 5s before SIGKILL

        },
        {
            // should each agent hold their own chroma?
            // will there be a single core chroma?
            // or will it be a mix of the two?
            // some "core" data we know is just used by all agents
            // and some data is specific to the agent?
            // for now, we'll just run chroma in each agent
            "name": "chromadb",
            "script": "python",
            "args": "-m pipenv run chroma run --path ./chroma_data",
            restart_delay: 10000,
            kill_timeout: 10000
        },
        {
            name: "tts",
            cwd: "../../services/py/tts",
            script: "../../services/py/tts/run.sh",
            interpreter: "bash",
            exec_mode: "fork",
            watch: ["../../services/py/tts"],
            instances: 1,
            autorestart: true,
            env: {
                PYTHONPATH: require("path").resolve(__dirname, "../.."),
                PYTHONUNBUFFERED: "1",
                FLASK_APP: "app.py",
                FLASK_ENV: "production",
            },
            restart_delay: 10000,
            kill_timeout: 10000
        },
        {
            name: "stt",
            cwd: "../../services/py/stt",
            script: "../../services/py/stt/run.sh",
            interpreter: "bash",
            exec_mode: "fork",
            watch: ["../../services/py/stt"],
            instances: 1,
            autorestart: true,
            env: {
                PYTHONUNBUFFERED: "1",
                PYTHONPATH: require("path").resolve(__dirname, "../.."),
            },
            restart_delay: 10000,
            kill_timeout: 10000
        },
        {
            name: "file-watcher",
            cwd: "../../services/file-watcher",
            script: "npm",
            args: "start",
            exec_mode: "fork",
            watch: ["../../services/file-watcher"],
            instances: 1,
            autorestart: true,
            env: {
                NODE_ENV: "production"
            },
            restart_delay: 10000,
            kill_timeout: 10000
        },
        {
            name: "stt-ws",
            cwd: "../../services/py/stt_ws",
            script: "../../services/py/stt_ws/run.sh",
            interpreter: "bash",
            exec_mode: "fork",
            watch: ["../../services/py/stt_ws"],
            instances: 1,
            autorestart: true,
            env: {
                PYTHONUNBUFFERED: "1",
                PYTHONPATH: require("path").resolve(__dirname, "../.."),
            },
            restart_delay: 10000,
            kill_timeout: 10000
        },
        {
            name: "whisper-stream-ws",
            cwd: "../../services/py/whisper_stream_ws",
            script: "../../services/py/whisper_stream_ws/run.sh",
            interpreter: "bash",
            exec_mode: "fork",
            watch: ["../../services/py/whisper_stream_ws"],
            instances: 1,
            autorestart: true,
            env: {
                PYTHONUNBUFFERED: "1",
                PYTHONPATH: require("path").resolve(__dirname, "../.."),
            },
            restart_delay: 10000,
            kill_timeout: 10000
        },
        {
            name: "llm",
            cwd: "../../services/llm",
            script: "npm",
            args: "start",
            exec_mode: "fork",
            watch: ["../../services/llm"],
            instances: 1,
            autorestart: true,
            restart_delay: 10000,
            kill_timeout: 10000
        },
        {
            name: "vision",
            cwd: "../../services/vision",
            script: "npm",
            args: "start",
            exec_mode: "fork",
            watch: ["../../services/vision"],
            instances: 1,
            autorestart: true,
            restart_delay: 10000,
            kill_timeout: 10000
        }

    ]
};
