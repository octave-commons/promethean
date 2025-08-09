import path from "path";
import { fileURLToPath } from "url";
import loadEcosystem from "./ecosystem-loader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = loadEcosystem({
  services: [
    {
      name: "cephalon",
      command: ["npm", "run", "start"],
      cwd: path.join(__dirname, "services/ts/cephalon"),
    },
    {
      name: "stt",
      command: ["pipenv", "run", "python", "-m", "service"],
      cwd: path.join(__dirname, "services/py/stt"),
    },
    {
      name: "tts",
      command: [
        "pipenv",
        "run",
        "uvicorn",
        "--host",
        "0.0.0.0",
        "--port",
        "5001",
        "app:app",
      ],
      cwd: path.join(__dirname, "services/py/tts"),
    },
  ],
});

export default config;

if (process.argv[1] === __filename) {
  const pm2 = (await import("pm2")).default;
  pm2.connect((err) => {
    if (err) {
      console.error(err);
      process.exit(2);
    }
    pm2.start(config.apps, (startErr) => {
      if (startErr) {
        console.error(startErr);
      }
      pm2.disconnect();
    });
  });
}
