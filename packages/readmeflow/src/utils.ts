import { promises as fs } from "node:fs";
import * as path from "node:path";

export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

export function parseArgs<T extends Record<string, string>>(
	defaults: Readonly<T>,
): Readonly<T> {
	const pairs = process.argv
		.slice(2)
		.reduce<ReadonlyArray<[string, string]>>((acc, cur, idx, arr) => {
			if (!cur.startsWith("--")) return acc;
			const next = arr[idx + 1];
			const value =
				typeof next === "string" && !next.startsWith("--")
					? next
					: "true";
			return acc.concat([[cur, value]]);
		}, []);
	return { ...defaults, ...Object.fromEntries(pairs) } as Readonly<T>;
}

export async function readMaybe(p: string): Promise<string | undefined> {
	try {
		return await fs.readFile(p, "utf-8");
	} catch {
		return undefined;
	}
}
export async function writeText(p: string, s: string): Promise<void> {
	await fs.mkdir(path.dirname(p), { recursive: true });
	await fs.writeFile(p, s, "utf-8");
}

export function slug(s: string): string {
	return s
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export async function ollamaJSON(
	model: string,
	prompt: string,
): Promise<unknown> {
	const res = await fetch(`${OLLAMA_URL}/api/generate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			model,
			prompt,
			stream: false,
			options: { temperature: 0 },
			format: "json",
		}),
	});
	if (!res.ok) throw new Error(`ollama ${res.status}`);
	const data: unknown = await res.json();
	const response = (data as { response?: unknown } | undefined)?.response;
	const raw =
		typeof response === "string" ? response : JSON.stringify(response);
	return JSON.parse(
		String(raw)
			.replace(/```json\s*/g, "")
			.replace(/```\s*$/g, "")
			.trim(),
	) as unknown;
}
