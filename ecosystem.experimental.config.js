const path = require("path")
const duck = require("./agents/duck/ecosystem.config.js")
module.exports = {
    apps: [
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
        }
        ,
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
        }
        ,
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
        }
    ]
};
