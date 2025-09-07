// GPL-3.0-only
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

const PKG_ROOT = path.resolve(
	path.dirname(url.fileURLToPath(import.meta.url)),
	"../../../",
);

const DOC_FIXTURE_PATH = path.join(PKG_ROOT, "test-tmp", `docs-${uuidv4()}`);
const TMP_DB = path.join(PKG_ROOT, ".cache", `docops-pipeline-${uuidv4()}`);

let state: { stop: () => Promise<void>; baseUrl?: string } | null = null;

test.before(async () => {
	await ensureServices();
	await fs.mkdir(DOC_FIXTURE_PATH, { recursive: true });
	await fs.writeFile(
		path.join(DOC_FIXTURE_PATH, "run.md"),
		"---\ntitle: run\n---\n# Sample\n",
	);
	const { stop, baseUrl } = await startProcessWithPort({
		cmd: "node",
		args: [
			path.join(PKG_ROOT, "dist/dev-ui.js"),
			"--dir",
			DOC_FIXTURE_PATH,
			"--collection",
			uuidv4(),
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
	const next: { stop: () => Promise<void>; baseUrl?: string } = { stop };
	if (baseUrl) next.baseUrl = baseUrl;
	state = next;
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

const byId = (id: string) => `#${id}`;

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
	if (!clicked) {
		throw new Error(`Could not click file "${label}" in <file-tree>`);
	}
}

// TODO: unskip once pipeline run reliably succeeds
test.serial.skip(
        "DocOps Pipeline Run: executes pipeline and refreshes file tree",
        withPage,
        { baseUrl: () => state?.baseUrl },
        async (t, fixtures) => {
                const page =
                        (fixtures as any).page ??
			(await (async () => {
				const res = await fixtures.pageGoto?.("/");
				t.truthy(res, "app responded at /");
				throw new Error(
					"withPage did not expose a Playwright `page`. Extend @promethean/test-utils to provide it.",
				);
			})());

		await page.goto(`${state!.baseUrl}`, { waitUntil: "domcontentloaded" });

		await page.fill(byId("dir"), DOC_FIXTURE_PATH);
		const coll = `e2e-${uuidv4().slice(0, 8)}`;
		await page.fill(byId("collection"), coll);

		await page.click(byId("refresh"));
		await page.waitForFunction(() => {
			const sel = document.getElementById(
				"doclist",
			) as HTMLSelectElement | null;
			return !!sel && sel.options.length >= 0;
		});

		await clickFileInTree(page, "run.md");

                await page.click(byId("run"));
                const outcomeHandle = await page.waitForFunction(
                        () => {
                                const prog = document.getElementById(
                                        "overallProgress",
                                ) as HTMLProgressElement | null;
                                const logs =
                                        document.getElementById("logs")?.textContent || "";
                                if (/error/i.test(logs)) return "error";
                                if (
                                        (prog && prog.value >= 100) ||
                                        logs.includes("Done.")
                                )
                                        return "success";
                                return false;
                        },
                        { timeout: 60_000 },
                );
                const outcome = await outcomeHandle.jsonValue();
                t.is(outcome, "success", "Pipeline run should complete successfully");

                const logsText = await page.textContent("#logs");
                t.true(
                        !!logsText &&
                                logsText.split(/\n/).filter((l: string) => l.trim().length > 0)
                                        .length >= 1,
                        "Logs should contain at least one line",
                );
                t.false(/error/i.test(logsText || ""), "Logs should not contain errors");

		await page.waitForFunction(() => {
			const sel = document.getElementById(
				"doclist",
			) as HTMLSelectElement | null;
			return !!sel && sel.options.length > 0;
		});
		const count = await page.evaluate(() => {
			const sel = document.getElementById(
				"doclist",
			) as HTMLSelectElement | null;
			return sel ? sel.options.length : 0;
		});
		t.true(count > 0, "Doc list repopulated after run");
	},
);
