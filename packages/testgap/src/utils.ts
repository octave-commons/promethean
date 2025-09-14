export {
  writeJSON,
  readJSON,
  readMaybe,
  OLLAMA_URL,
  ollamaJSON,
} from "@promethean/utils";
export function rel(p: string) {
  return p.replace(process.cwd().replace(/\\/g, "/") + "/", "");
}
