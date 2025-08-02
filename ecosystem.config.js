const path = require("path")
const duck = require("./agents/duck/ecosystem.config.js")
module.exports = {
    apps: [
        ...duck.apps,
        {
            name: "tts",
            cwd: "./services/py/tts",
            script: "pipenv",
            exec_mode:"fork",
            args:["run", "uvicorn", "--host", "0.0.0.0", "--port" ,"5001", "app:app"],
            watch: ["./services/py/tts"],
            instances: 1,
            autorestart: true,
            env: {
                PYTHONPATH: `.:${path.resolve(__dirname)}`,
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
            script: "pipenv",
            exec_mode:"fork",
            args:["run", "uvicorn", "--host", "0.0.0.0", "--port" ,"5002", "app:app"],
            watch: ["./services/py/stt"],
            instances: 1,
            autorestart: true,
            out_file: "./logs/stt-out.log",
            error_file: "./logs/stt-err.log",
            merge_logs: true,
            env: {
                PYTHONUNBUFFERED: "1",
                PYTHONPATH: `.:${path.resolve(__dirname)}:.`,
                FLASK_APP: "app.py",
                FLASK_ENV: "production",
            },

            restart_delay: 10000,
            kill_timeout: 10000 // wait 5s before SIGKILL
        },
        {
            name: "file-watcher",
            cwd: "./services/ts/file-watcher",
            "script":".",
            watch: ["./services/ts/file-watcher"],
            instances: 1,
            autorestart: true,
            env: {
                NODE_ENV: "production",
                REPO_ROOT:__dirname

            },
            restart_delay: 10000,
            kill_timeout: 10000
        },


        {
            name: "vision",
            cwd: "./services/js/vision",

            "script":".",
            watch: ["./services/js/vision/"],
            instances: 1,
            autorestart: true,
            restart_delay: 10000,
            kill_timeout: 10000,
            env:{
                PORT:9999
            }
        },
        {
            name: "llm",
            cwd: "./services/ts/llm",

            "script":".",
            watch: ["./services/ts/llm/src"],
            instances: 1,
            autorestart: true,
            restart_delay: 10000,
            kill_timeout: 10000,
            env:{
                LLM_PORT:8888
            }
        },
    ]
};
