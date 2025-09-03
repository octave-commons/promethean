import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const REQUIRED_SECTIONS = ["Description", "Goals", "Requirements", "Subtasks"];
const STATUS_TAGS = ["#IceBox", "#Accepted", "#Ready", "#Todo", "#InProgress", "#Done"];

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function checkFile(path: string): string[] | null {
  const text = readFileSync(path, "utf8");
  const errors: string[] = [];

  for (const section of REQUIRED_SECTIONS) {
    const pattern = new RegExp(`^#+\\s*${escapeRegExp(section)}`, "im");
    if (!pattern.test(text)) {
      errors.push(`Missing section: ${section}`);
    }
  }

  if (!STATUS_TAGS.some((tag) => text.includes(tag))) {
    errors.push("Missing status hashtag");
  }

  return errors.length ? errors : null;
}

export function main(): void {
  const directory = process.argv[2] ?? "docs/agile/tasks";
  const files = readdirSync(directory).filter((f) => f.endsWith(".md")).sort();
  const failures: Array<{ path: string; errors: string[] }> = [];

  for (const file of files) {
    const filePath = join(directory, file);
    const result = checkFile(filePath);
    if (result) failures.push({ path: filePath, errors: result });
  }

  if (failures.length) {
    for (const { path, errors } of failures) {
      for (const err of errors) {
        console.log(`${path}: ${err}`);
      }
    }
    process.exit(1);
  }

  console.log("All task files have required sections and status hashtags.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
