#!/usr/bin/env node
import fg from "fast-glob";
import { Node, Project, SyntaxKind } from "ts-morph";
import { mkAliasRewriter, mkRelativeToJs } from "@promethean/naming";

console.warn(
  "@promethean/alias-rewrite is deprecated; use @promethean/naming instead.",
);

type Args = Readonly<{
  fromPrefix: string;
  toPrefix: string;
  globs: readonly string[];
}>;

const parseArgs = (argv: readonly string[]): Args => {
  const fromIdx = argv.indexOf("--from");
  const toIdx = argv.indexOf("--to");

  const fromVal = argv[fromIdx + 1];
  const hasFromVal =
    fromIdx >= 0 && fromVal != null && !fromVal.startsWith("--");
  const toVal = argv[toIdx + 1];
  const hasToVal = toIdx >= 0 && toVal != null && !toVal.startsWith("--");

  const fromPrefix = hasFromVal ? fromVal : "@old";
  const toPrefix = hasToVal ? toVal : "@new-";

  const globs: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i]!;
    if (t === "--from" || t === "--to") {
      i++;
      continue;
    }
    globs.push(t);
  }

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

  const files = await fg(Array.from(patterns), { ignore });
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

    for (const call of sf.getDescendantsOfKind(SyntaxKind.CallExpression)) {
      if (call.getExpression().getKind() !== SyntaxKind.ImportKeyword) continue;
      const arg = call.getArguments()[0];
      if (!arg || !Node.isStringLiteral(arg)) continue;
      const old = arg.getLiteralText();
      const next = rewriteSpec(old, alias, relToJs, sf.getFilePath());
      if (next !== old) {
        arg.setLiteralValue(next);
        touched = true;
      }
    }

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
