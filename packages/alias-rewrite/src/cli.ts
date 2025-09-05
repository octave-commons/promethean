#!/usr/bin/env node
import fg from "fast-glob";
import { Project, SyntaxKind } from "ts-morph";
import { mkAliasRewriter, mkRelativeToJs } from "./lib.js";

type Args = { fromPrefix: string; toPrefix: string; globs: string[] };

const parseArgs = (argv: string[]): Args => {
  const fromIdx = argv.indexOf("--from");
  const toIdx = argv.indexOf("--to");
  const fromPrefix = fromIdx >= 0 ? argv[fromIdx + 1] : "@old";
  const toPrefix = toIdx >= 0 ? argv[toIdx + 1] : "@new-";
  const globs = argv.filter((x) => !x.startsWith("--"));
  return { fromPrefix, toPrefix, globs };
};

const rewriteSpec = (
  spec: string,
  alias: ReturnType<typeof mkAliasRewriter>,
  relToJs: (s: string) => string,
  filePath: string,
): string => {
  const aliasOut = alias(spec);
  if (aliasOut === "__ALIAS_REWRITE_ERROR__ROOT_IMPORT__") {
    throw new Error(`Root alias not allowed: "${spec}" in ${filePath}`);
  }
  if (aliasOut === "__ALIAS_REWRITE_ERROR__BAD_SEGMENT__") {
    throw new Error(`Bad alias segment in "${spec}" at ${filePath}`);
  }
  if (aliasOut) return aliasOut;
  if (spec.startsWith("./") || spec.startsWith("../")) return relToJs(spec);
  return spec;
};

const main = async () => {
  const { fromPrefix, toPrefix, globs } = parseArgs(process.argv.slice(2));
  const patterns = globs.length
    ? globs
    : ["packages/**/src/**/*.{ts,tsx,mts,cts}"];
  const ignore = [
    "**/node_modules/**",
    "**/dist/**",
    "**/.turbo/**",
    "**/.next/**",
  ];

  const files = await fg(patterns, { ignore });
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  files.forEach((f) => project.addSourceFileAtPath(f));

  const alias = mkAliasRewriter(fromPrefix, toPrefix);
  let changed = 0;

  for (const sf of project.getSourceFiles()) {
    const relToJs = mkRelativeToJs(sf.getFilePath());
    let touched = false;

    sf.getImportDeclarations().forEach((imp) => {
      const old = imp.getModuleSpecifierValue();
      const next = rewriteSpec(old, alias, relToJs, sf.getFilePath());
      if (next !== old) {
        imp.setModuleSpecifier(next);
        touched = true;
      }
    });

    sf.getExportDeclarations().forEach((exp) => {
      const ms = exp.getModuleSpecifierValue();
      if (!ms) return;
      const next = rewriteSpec(ms, alias, relToJs, sf.getFilePath());
      if (next !== ms) {
        exp.setModuleSpecifier(next);
        touched = true;
      }
    });

    sf.forEachDescendant((node) => {
      if (node.getKind() !== SyntaxKind.ImportCall) return;
      // @ts-ignore ts-morph dynamic
      const arg = node.getExpression().getArguments?.()[0];
      if (!arg || arg.getKind() !== SyntaxKind.StringLiteral) return;
      // @ts-ignore
      const lit = arg;
      const old = lit.getLiteralText();
      const next = rewriteSpec(old, alias, relToJs, sf.getFilePath());
      if (next !== old) {
        lit.setLiteralValue(next);
        touched = true;
      }
    });

    if (touched) {
      sf.saveSync();
      changed++;
    }
  }

  console.log(
    JSON.stringify(
      { files: files.length, changed, fromPrefix, toPrefix },
      null,
      2,
    ),
  );
};

main().catch((e) => {
  console.error(e.stack || e);
  process.exit(1);
});
