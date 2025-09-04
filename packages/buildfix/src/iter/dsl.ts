import * as path from "path";
import { promises as fs } from "fs";

import { z } from "zod";

export const Op = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("ensureExported"),
    file: z.string(),
    symbol: z.string(),
    kind: z.enum(["function", "class", "variable"]),
  }),
  z.object({
    op: z.literal("renameSymbol"),
    file: z.string(),
    from: z.string(),
    to: z.string(),
  }),
  z.object({
    op: z.literal("makeParamOptional"),
    file: z.string(),
    fn: z.string(),
    param: z.string(),
  }),
  z.object({
    op: z.literal("addImport"),
    file: z.string(),
    from: z.string(),
    names: z.array(z.string()),
  }),
  z.object({
    op: z.literal("addTypeAnnotation"),
    file: z.string(),
    selector: z.string(),
    typeText: z.string(),
  }),
  z.object({
    op: z.literal("insertStubFunction"),
    file: z.string(),
    name: z.string(),
    signature: z.string().optional(),
    returns: z.string().optional(),
  }),
]);
export type OpT = z.infer<typeof Op>;

export const PlanSchema = z.object({
  title: z.string(),
  rationale: z.string(),
  snippet_b64: z.string().optional(), // base64(ESM JS with export async function apply(project){})
  dsl: z.array(Op).optional(),
});
export type Plan = z.infer<typeof PlanSchema>;

export function decodeB64(s: string): string {
  return Buffer.from(s, "base64").toString("utf8");
}

// Turn DSL ops into a safe ESM snippet.
export async function dslToSnippet(ops: OpT[]): Promise<string> {
  const hdr = `import { SyntaxKind } from "ts-morph";
export async function apply(project){
  const by = (p)=>project.getSourceFile(p) || project.getSourceFiles().find(f=>f.getFilePath().endsWith(p));
  const not = (x,msg)=>{ if(!x) throw new Error(msg); };
`;
  const lines: string[] = [hdr];

  for (const o of ops) {
    if (o.op === "ensureExported") {
      lines.push(`
  { const sf = by(${JSON.stringify(o.file)}); not(sf,"file");
    const ent = ${
      o.kind === "function"
        ? `sf.getFunctions().find(f=>f.getName()===${JSON.stringify(o.symbol)})`
        : o.kind === "class"
          ? `sf.getClasses().find(c=>c.getName()===${JSON.stringify(o.symbol)})`
          : `sf.getVariableDeclaration(${JSON.stringify(o.symbol)})`
    };
    if (ent && !ent.hasExportKeyword?.()) ent.setIsExported?.(true);
  }`);
    }
    if (o.op === "renameSymbol") {
      lines.push(`
  { const sf = by(${JSON.stringify(o.file)}); not(sf,"file");
    const f = sf.getFunctions().find(x=>x.getName()===${JSON.stringify(
      o.from,
    )}) ||
              sf.getClasses().find(x=>x.getName()===${JSON.stringify(o.from)});
    if (f) f.rename(${JSON.stringify(o.to)});
  }`);
    }
    if (o.op === "makeParamOptional") {
      lines.push(`
  { const sf = by(${JSON.stringify(o.file)}); not(sf,"file");
    const fn = sf.getFunctions().find(x=>x.getName()===${JSON.stringify(o.fn)});
    if (fn){
      const p = fn.getParameters().find(p=>p.getName()===${JSON.stringify(
        o.param,
      )});
      if (p && !p.hasQuestionToken()) p.setHasQuestionToken(true);
    }
  }`);
    }
    if (o.op === "addImport") {
      lines.push(`
  { const sf = by(${JSON.stringify(o.file)}); not(sf,"file");
    const names = ${JSON.stringify(o.names)};
    const decl = sf.getImportDeclarations().find(d=>d.getModuleSpecifierValue()===${JSON.stringify(
      o.from,
    )});
    if (decl) { for (const n of names) { if (!decl.getNamedImports().some(ni=>ni.getName()===n)) decl.addNamedImport(n); } }
    else { sf.addImportDeclaration({ moduleSpecifier: ${JSON.stringify(
      o.from,
    )}, namedImports: names }); }
  }`);
    }
    if (o.op === "addTypeAnnotation") {
      // Simple selector: function:name or var:name
      lines.push(`
  { const sf = by(${JSON.stringify(o.file)}); not(sf,"file");
    const [kind, name] = ${JSON.stringify(o.selector)}.split(":");
    if (kind==="function"){
      const fn = sf.getFunctions().find(x=>x.getName()===name);
      if (fn) fn.setReturnType(${JSON.stringify(o.typeText)});
    } else if (kind==="var"){
      const v = sf.getVariableDeclaration(name);
      if (v) v.setType(${JSON.stringify(o.typeText)});
    }
  }`);
    }
    if (o.op === "insertStubFunction") {
      lines.push(`
  { const sf = by(${JSON.stringify(o.file)}); not(sf,"file");
    const name=${JSON.stringify(o.name)};
    if (!sf.getFunction(name)) sf.addFunction({
      name,
      isExported: true,
      parameters: [],
      statements: ${JSON.stringify(o.returns ? `return ${o.returns};` : "")}
    });
  }`);
    }
  }

  lines.push("\n}\n");
  return lines.join("");
}

export async function materializeSnippet(
  plan: Plan,
  outPath: string,
): Promise<void> {
  let code = "";
  if (plan.snippet_b64) code = decodeB64(plan.snippet_b64);
  else if (plan.dsl && plan.dsl.length) code = await dslToSnippet(plan.dsl);
  else throw new Error("plan has neither snippet_b64 nor dsl");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, code, "utf-8");
}
