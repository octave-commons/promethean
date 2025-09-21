import fs from "fs";
import pidusage from "pidusage";

export async function getProcessMetrics(pid) {
  const metrics = { cpu: 0, memory: 0, netRx: 0, netTx: 0 };
  try {
    const { cpu, memory } = await pidusage(pid);
    metrics.cpu = cpu;
    metrics.memory = memory;
  } catch (err) {
    console.warn(`failed to get cpu/memory for pid ${pid}`, err);
  }
  try {
    const data = fs.readFileSync(`/proc/${pid}/net/dev`, "utf8");
    for (const line of data.trim().split("\n").slice(2)) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 17) {
        metrics.netRx += parseInt(parts[1], 10) || 0;
        metrics.netTx += parseInt(parts[9], 10) || 0;
      }
    }
  } catch {
    // ignore network stats errors
  }
  return metrics;
}
