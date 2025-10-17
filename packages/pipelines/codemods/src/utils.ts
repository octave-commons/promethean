import { promises as fs } from "fs";
import * as path from "path";

import { SourceFile, SyntaxKind } from "ts-morph";
import { globby } from "globby";

export async function readJSON<T>(p: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(p, "utf-8")) as T;
  } catch {
    return fallback;
  }
}
export async function writeJSON(p: string, data: any) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
}

export async function listCodeFiles(root: string) {
  const patterns = [
    `${root.replace(/\\/g, "/")}/**/*.{ts,tsx,js,jsx}`,
    `!**/node_modules/**`,
    `!**/dist/**`,
    `!**/build/**`,
    `!**/.next/**`,
    `!**/.turbo/**`,
    `!**/coverage/**`,
  ];
  return globby(patterns);
}

export function importPathRelative(
  fromFileAbs: string,
  canonicalFileAbs: string,
) {
  let rel = path
    .relative(path.dirname(fromFileAbs), canonicalFileAbs)
    .replace(/\\/g, "/");
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel.replace(/\.(tsx?|jsx?)$/i, "");
}

export function ensureImport(
  source: SourceFile,
  spec: { name: string; from: string; alias?: string },
) {
  // find existing import
  const existing = source
    .getImportDeclarations()
    .find((d) => d.getModuleSpecifierValue() === spec.from);
  if (existing) {
    const already = existing
      .getNamedImports()
      .find((n) => n.getName() === spec.name);
    if (!already)
      existing.addNamedImport(
        spec.alias
          ? { name: spec.name, alias: spec.alias }
          : { name: spec.name },
      );
    return;
  }
  source.addImportDeclaration({
    moduleSpecifier: spec.from,
    namedImports: [
      spec.alias ? { name: spec.name, alias: spec.alias } : { name: spec.name },
    ],
  });
}

export function removeImportIfUnused(source: SourceFile, name: string) {
  const decs = source.getImportDeclarations();
  for (const d of decs) {
    const ni = d.getNamedImports();
    const match = ni.find(
      (n) => n.getName() === name || n.getAliasNode()?.getText() === name,
    );
    if (match) {
      // remove and if no named left, remove import decl
      match.remove();
      if (
        d.getNamedImports().length === 0 &&
        !d.getDefaultImport() &&
        !d.getNamespaceImport()
      )
        d.remove();
      return;
    }
  }
}

export function replaceIdentifier(
  source: SourceFile,
  from: string,
  to: string,
) {
  const ids = source
    .getDescendantsOfKind(SyntaxKind.Identifier)
    .filter((i) => i.getText() === from);
  for (const id of ids) {
    // skip if it's a declaration of the same name
    const parent = id.getParent();
    if (
      parent &&
      (parent.getKindName().endsWith("Declaration") ||
        parent.getKind() === SyntaxKind.BindingElement)
    ) {
      // leave declarations to separate removal step
      continue;
    }
    id.replaceWithText(to);
  }
}
