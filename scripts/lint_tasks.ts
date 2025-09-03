import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const REQUIRED_SECTIONS = ["Description", "Goals", "Requirements", "Subtasks"];
const STATUS_TAGS = new Set(["#IceBox", "#Accepted", "#Ready", "#Todo", "#InProgress", "#Done"]);

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function checkFile(filePath: string): string[] {
  const text = readFileSync(filePath, "utf8");
  const errors: string[] = [];
  for (const section of REQUIRED_SECTIONS) {
    const pattern = new RegExp(`^#+\\s*${escapeRegExp(section)}`, "im");
    if (!pattern.test(text)) {
      errors.push(`Missing section: ${section}`);
    }
  }
  if (![...STATUS_TAGS].some((tag) => text.includes(tag))) {
    errors.push("Missing status hashtag");
  }
  return errors;
}

function main(): void {
  const dirArg = process.argv[2];
  const directory = dirArg ? path.resolve(dirArg) : path.resolve("docs/agile/tasks");

  const files = readdirSync(directory).filter((f) => f.endsWith(".md")).sort();
  const failures: [string, string[]][] = [];
  for (const file of files) {
    const filePath = path.join(directory, file);
    const errors = checkFile(filePath);
    if (errors.length > 0) {
      failures.push([filePath, errors]);
    }
  }

  if (failures.length > 0) {
    for (const [file, errs] of failures) {
      for (const err of errs) {
        console.log(`${file}: ${err}`);
      }
    }
    process.exit(1);
  }

  console.log("All task files have required sections and status hashtags.");
}

main();
