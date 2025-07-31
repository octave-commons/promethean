const path = require("path")
module.exports = {
    apps: [
        {
            name: "tts",
            cwd: "./services/py/tts",
            script: "./services/py/tts/run.sh",
            interpreter:"bash",
            "exec_mode": "fork",
            watch: ["./services/py/tts"],
            instances: 1,
            autorestart: true,
            env: {

                PYTHONPATH: path.resolve(__dirname),
                PYTHONUNBUFFERED: "1",
                FLASK_APP: "app.py",
                FLASK_ENV: "production",
            },
            restart_delay: 10000,
            kill_timeout: 10000 

        },
        {
            name: "stt",
            cwd: "./services/py/stt",
            script: "./services/py/stt/run.sh",
            interpreter: "bash",
            exec_mode: "fork",
            watch: ["./services/py/stt"],
            instances: 1,
            autorestart: true,
            out_file: "./logs/stt-out.log",
            error_file: "./logs/stt-err.log",
            merge_logs: true,
            env: {
                PYTHONUNBUFFERED: "1",
                PYTHONPATH: path.resolve(__dirname),
            },

            restart_delay: 10000,
            kill_timeout: 10000 // wait 5s before SIGKILL
        },
        {
            name: "file-watcher",
            cwd: "./services/file-watcher",
            script: "npm",
            args: "start",
            exec_mode: "fork",
            watch: ["./services/file-watcher"],
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
            cwd: "./services/py/stt_ws",
            script: "./services/py/stt_ws/run.sh",
            interpreter: "bash",
            exec_mode: "fork",
            watch: ["./services/py/stt_ws"],
            instances: 1,
            autorestart: true,
            env: {
                PYTHONUNBUFFERED: "1",
                PYTHONPATH: path.resolve(__dirname),
            },
            restart_delay: 10000,
            kill_timeout: 10000
        },
        {
            name: "whisper-stream-ws",
            cwd: "./services/py/whisper_stream_ws",
            script: "./services/py/whisper_stream_ws/run.sh",
            interpreter: "bash",
            exec_mode: "fork",
            watch: ["./services/py/whisper_stream_ws"],
            instances: 1,
            autorestart: true,
            env: {
                PYTHONUNBUFFERED: "1",
                PYTHONPATH: path.resolve(__dirname),
            },
            restart_delay: 10000,
            kill_timeout: 10000
        },
    ]
};
