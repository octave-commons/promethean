import { execa } from "execa";
import { decode } from "wav-decoder";

async function getAudioSource() {
  if (process.platform === "win32") {
    return {
      format: "dshow",
      device: "audio=Voicemeeter Out B1 (VB-Audio Voicemeeter VAIO)",
    };
  }
  if (process.platform === "linux") {
    try {
      const { stdout } = await execa("pactl", ["list", "short", "sources"]);
      const lines = stdout.split("\n").filter(Boolean);
      const monitor = lines.find(
        (line) => line.includes(".monitor") && line.includes("RUNNING"),
      );
      const device = (monitor ?? lines[0])?.split("\t")[1] ?? "default";
      return { format: "pulse", device };
    } catch {
      return { format: "pulse", device: "default" };
    }
  }
  return { format: "avfoundation", device: ":0" };
}

export async function captureAudio({
  duration = 5,
  source,
}: {
  duration?: number;
  source?: string;
} = {}) {
  const startTime = Date.now();

  const { format, device } = await getAudioSource();
  const input = source ?? device;

  const ffmpeg = execa(
    "ffmpeg",
    [
      "-y",
      "-f",
      format,
      "-i",
      input,
      "-t",
      duration.toString(),
      "-acodec",
      "pcm_s16le",
      "-ar",
      "44100",
      "-ac",
      "1",
      "-f",
      "wav",
      "pipe:1", // Output to stdout
    ],
    {
      stdout: "pipe",
      stderr: "ignore",
      encoding: "buffer", // ← this is the fix
    },
  );
  const endTime = Date.now();

  const { stdout } = await ffmpeg;
  const waveBuffer = Buffer.from(stdout);
  const audioData = await decode(waveBuffer.buffer.slice(waveBuffer.byteOffset, waveBuffer.byteOffset + waveBuffer.byteLength));

  const channelData = audioData.channelData[0];
  if (!channelData) throw new Error("No audio channel");
  return {
    startTime,
    endTime,
    audioData,
    channelData,
    waveBuffer,
  };
}
