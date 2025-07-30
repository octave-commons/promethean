const path = require("path")
module.exports = {
    apps: [
        {
            name: "tts",
            cwd: "./services/tts",
            script: "./services/tts/run.sh",
            interpreter:"bash",
            "exec_mode": "fork",
            watch: ["./services/tts"],
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
            cwd: "./services/stt",
            script: "./services/stt/run.sh",
            interpreter: "bash",
            exec_mode: "fork",
            watch: ["./services/stt"],
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
    ]
};
