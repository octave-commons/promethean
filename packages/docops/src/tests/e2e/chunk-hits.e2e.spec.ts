import * as path from "node:path";
import * as url from "node:url";
import { promises as fs } from "node:fs";
import { v4 as uuidv4 } from "uuid";

import test from "ava";
import {
	withPage,
	shutdown,
	startProcessWithPort,
} from "@promethean/test-utils";
import { ensureServices } from "../helpers/services.js";
import { openDB } from "../../db.js";

const PKG_ROOT = path.resolve(
	path.dirname(url.fileURLToPath(import.meta.url)),
	"../../../",
);
const DOC_FIXTURE_PATH = path.join(PKG_ROOT, "test-tmp", `docs-${uuidv4()}`);
const TMP_DB = path.join(PKG_ROOT, ".cache", `docops-e2e-${uuidv4()}`);
const COLLECTION = `coll-${uuidv4()}`;

let state: { stop: () => Promise<void>; baseUrl?: string } | null = null;

// Helper to click a file within <file-tree>
async function clickFileInTree(page: any, label: string) {
	const item = page.getByRole("treeitem", { name: label }).first();
	if (await item.count().then((n: number) => n > 0)) {
		await item.click();
		return;
	}
	const clicked = await page.evaluate((wanted: string) => {
		const host = document.querySelector("file-tree") as HTMLElement & {
			shadowRoot?: ShadowRoot | null;
		};
		if (!host) return false;
		const root = host.shadowRoot ?? host;
		const anchors = root.querySelectorAll("a, li, span, div, button");
		for (const el of anchors) {
			if ((el.textContent || "").trim() === wanted) {
				(el as HTMLElement).click();
				return true;
			}
		}
		return false;
	}, label);
	if (!clicked)
		throw new Error(`Could not click file "${label}" in <file-tree>`);
}

test.before(async () => {
	await ensureServices();
	await fs.mkdir(DOC_FIXTURE_PATH, { recursive: true });
	const fileA = path.join(DOC_FIXTURE_PATH, "a.md");
	const fileB = path.join(DOC_FIXTURE_PATH, "b.md");
	const uuidA = uuidv4();
	const uuidB = uuidv4();
	await fs.writeFile(
		fileA,
		`---\nuuid: ${uuidA}\ntitle: a\n---\nHello world one\n`,
	);
	await fs.writeFile(
		fileB,
		`---\nuuid: ${uuidB}\ntitle: b\n---\nHello world two\n`,
	);

	// Prepopulate hit for chunk of fileA pointing to fileB
	const db = await openDB(TMP_DB);
	await db.q.put(`${uuidA}:0`, [
		{ docUuid: uuidB, score: 0.99, startLine: 1, startCol: 0 },
	] as any);
	await db.root.close();

	const { stop, baseUrl } = await startProcessWithPort({
		cmd: "node",
		args: [
			path.join(PKG_ROOT, "dist/dev-ui.js"),
			"--dir",
			DOC_FIXTURE_PATH,
			"--collection",
			COLLECTION,
			"--port",
			":PORT",
		],
		cwd: PKG_ROOT,
		env: { ...process.env, DOCOPS_DB: TMP_DB },
		stdio: "inherit",
		ready: {
			kind: "http",
			url: "http://127.0.0.1:PORT/health",
			timeoutMs: 60_000,
		},
		port: { mode: "free" },
		baseUrlTemplate: (p) => `http://127.0.0.1:${p}/`,
	});
	state = { stop };
	if (baseUrl) state.baseUrl = baseUrl;

	// Run embed step for both files
	const files = [fileA, fileB];
	const embedParams = new URLSearchParams({
		step: "embed",
		dir: DOC_FIXTURE_PATH,
		collection: COLLECTION,
		files: JSON.stringify(files),
	});
	const embedRes = await fetch(
		`${state!.baseUrl}api/run-step?${embedParams}`,
	);
	const embedText = await embedRes.text();
	if (!embedText.includes("Step 'embed' completed.")) {
		throw new Error("Embed step did not complete");
	}
});

test.after.always(async () => {
	try {
		await state?.stop?.();
	} finally {
		state = null;
		try {
			await shutdown();
		} finally {
			await Promise.all([
				fs.rm(TMP_DB, { recursive: true, force: true }).catch(() => {}),
				fs
					.rm(DOC_FIXTURE_PATH, { recursive: true, force: true })
					.catch(() => {}),
			]);
		}
	}
});

test.serial(
	"DocOps E2E: chunk meta and hits",
	withPage,
	{ baseUrl: () => state?.baseUrl },
	async (t, fixtures) => {
		const page = (fixtures as any).page;
		await page.goto(`${state!.baseUrl}`, { waitUntil: "domcontentloaded" });

		// Populate file tree for the temporary docs directory before selecting a chunk
		await page.fill("#dir", DOC_FIXTURE_PATH);
		await page.fill("#collection", COLLECTION);
		await page.click("#refresh");
		await page.getByRole("treeitem", { name: "a.md" }).first().waitFor();
		await clickFileInTree(page, "a.md");
		await page.waitForSelector("#chunksList li");
		await page.locator("#chunksList li").first().click();

		await page.waitForSelector("#chunkMeta");
		const meta = await page.textContent("#chunkMeta");
		t.regex(meta || "", /lines:\s*\d+:\d+\s*-\s*\d+:\d+/);

		await page.waitForSelector("#chunkText");
		const chunkText = await page.textContent("#chunkText");
		t.truthy(chunkText && chunkText.length > 0);

		await page.waitForSelector("#chunkHits li");
		const hits = await page.locator("#chunkHits li").count();
		t.true(hits > 0);
		const hitText = await page.textContent("#chunkHits li");
		t.regex(hitText || "", /^\s*\d+\.\d+\s*—/);
	},
);
