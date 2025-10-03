#!/usr/bin/env node
import process from "node:process";

const PER_PAGE = 250;
const DOC_PREFIXES = ["docs/", "changelog.d/"];
const DOC_FILENAMES = new Set(["readme.md", "readme.mdx", "changelog.md"]);
const TEST_SEGMENTS = new Set([
  "test",
  "tests",
  "__tests__",
  "__mocks__",
  "__fixtures__",
  "__snapshots__",
  "fixtures",
  "mocks",
]);

function normalizePath(input) {
  return input.replace(/^\.\/?/, "");
}

function isDocPath(input) {
  if (!input) return false;
  const normalized = normalizePath(input);
  const lower = normalized.toLowerCase();
  if (DOC_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
    return true;
  }
  const basename = lower.split("/").pop() ?? lower;
  return DOC_FILENAMES.has(basename);
}

function isTestPath(input) {
  if (!input) return false;
  const normalized = normalizePath(input);
  const lower = normalized.toLowerCase();
  const segments = lower.split("/");
  if (segments.some((segment) => TEST_SEGMENTS.has(segment))) {
    return true;
  }
  const basename = segments[segments.length - 1] ?? lower;
  return (
    /\.test\.[^./]+$/.test(basename) ||
    /\.spec\.[^./]+$/.test(basename) ||
    basename.endsWith(".snap") ||
    basename.endsWith(".snap.json") ||
    basename.endsWith(".fixture") ||
    basename.endsWith(".fixtures") ||
    basename.endsWith(".mock") ||
    basename.endsWith(".mocks")
  );
}

function parseLinkHeader(header) {
  if (!header) return {};
  return header.split(",").reduce((acc, part) => {
    const match = part.trim().match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match) {
      acc[match[2]] = match[1];
    }
    return acc;
  }, {});
}

async function fetchChangedFiles({ repo, prNumber, token, apiBase }) {
  const files = [];
  let nextUrl = new URL(`/repos/${repo}/pulls/${prNumber}/files`, apiBase);
  nextUrl.searchParams.set("per_page", String(PER_PAGE));

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "promethean-docguard",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (response.status === 404) {
      console.error(
        `docguard: pull request #${prNumber} not found in ${repo}.`,
      );
      process.exit(2);
    }

    if (!response.ok) {
      const message = await response.text();
      console.error(
        `docguard: failed to load PR files (${response.status} ${response.statusText}).`,
      );
      if (message) {
        console.error(message);
      }
      process.exit(1);
    }

    const page = await response.json();
    files.push(...page);

    const linkHeader = response.headers.get("link");
    const links = parseLinkHeader(linkHeader ?? "");
    if (links.next) {
      nextUrl = new URL(links.next);
    } else {
      nextUrl = null;
    }
  }

  return files;
}

function summarizeFiles(files) {
  let docsTouched = false;
  let requiresDocs = false;
  let onlyTests = files.length > 0;

  for (const file of files) {
    const paths = new Set();
    if (file?.filename) paths.add(file.filename);
    if (file?.previous_filename) paths.add(file.previous_filename);
    if (paths.size === 0) continue;

    const pathList = [...paths];
    const touchesDoc = pathList.some(isDocPath);
    const testOnly = pathList.every(isTestPath);
    const hasNonDoc = pathList.some((p) => !isDocPath(p) && !isTestPath(p));

    if (touchesDoc) {
      docsTouched = true;
    }
    if (hasNonDoc) {
      requiresDocs = true;
    }
    if (!testOnly) {
      onlyTests = false;
    }
  }

  return { docsTouched, requiresDocs, onlyTests };
}

async function main() {
  const repo =
    process.env.GITHUB_REPOSITORY ?? process.env.DOCGUARD_REPOSITORY ?? "";
  if (!repo.includes("/")) {
    console.error(
      "docguard: missing repository. Set GITHUB_REPOSITORY (owner/repo).",
    );
    process.exit(2);
  }

  const prInput =
    process.env.DOCGUARD_PR ?? process.env.PR_NUMBER ?? process.argv[2] ?? "";
  const prNumber = Number.parseInt(prInput, 10);
  if (!Number.isInteger(prNumber) || prNumber <= 0) {
    console.error(
      "docguard: missing or invalid pull request number. Provide DOCGUARD_PR or PR_NUMBER or pass it as the first argument.",
    );
    process.exit(2);
  }

  const apiBase = process.env.GITHUB_API_URL ?? "https://api.github.com";
  const token = process.env.GITHUB_TOKEN ?? process.env.DOCGUARD_TOKEN;

  const files = await fetchChangedFiles({ repo, prNumber, token, apiBase });
  if (files.length === 0) {
    console.log("docguard: pull request has no file changes.");
    return;
  }

  const { docsTouched, requiresDocs, onlyTests } = summarizeFiles(files);

  if (!requiresDocs) {
    if (onlyTests) {
      console.log(
        "docguard: only test files changed; documentation update not required.",
      );
    } else {
      console.log(
        "docguard: documentation-only change detected; guard satisfied.",
      );
    }
    return;
  }

  if (docsTouched) {
    console.log("docguard: documentation updates detected.");
    return;
  }

  console.error(
    "docguard: documentation update required. Touch docs/ or changelog.d/ in this PR.",
  );
  process.exit(1);
}

main().catch((err) => {
  console.error(err?.stack ?? String(err));
  process.exit(1);
});
