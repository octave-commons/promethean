// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable no-console */
import * as path from "path";
import { promises as fs } from "fs";
import { globby } from "globby";
import { Project } from "ts-morph";
import { parseArgs, writeJSON, hashSignature } from "./utils.js";
import type { WorkspaceSnapshot, PkgSnapshot, ApiItem, FnSig, ClassSig, MemberSig } from "./types.js";

const args = parseArgs({
  "--root": "packages",
  "--out": ".cache/semverguard/snapshot.json",
  "--tsconfig": "tsconfig.json"
});

async function main() {
  const ROOT = path.resolve(args["--root"]);
  const pkgs = await fs.readdir(ROOT, { withFileTypes: true }).then(ents => ents.filter(e => e.isDirectory()).map(e => e.name));

  const project = new Project({ tsConfigFilePath: path.resolve(args["--tsconfig"]), skipAddingFilesFromTsConfig: true });

  const workspace: WorkspaceSnapshot = { createdAt: new Date().toISOString(), packages: {} };

  for (const dir of pkgs) {
    const pkgRoot = path.join(ROOT, dir);
    const pkgJsonPath = path.join(pkgRoot, "package.json");
    let pkgName = dir, version = "0.0.0";
    try {
      const pkgJson = JSON.parse(await fs.readFile(pkgJsonPath, "utf-8"));
      pkgName = pkgJson.name ?? dir;
      version = pkgJson.version ?? "0.0.0";
    } catch {}

    // include src/lib files
    const files = await globby([`${pkgRoot.replace(/\\/g,"/")}/**/*.{ts,tsx,js,jsx}`, "!**/node_modules/**", "!**/dist/**", "!**/build/**"]);
    files.forEach((f: string) => project.addSourceFileAtPathIfExists(f));

    const exports: Record<string, ApiItem> = {};

    for (const sf of project.getSourceFiles().filter(s => s.getFilePath().startsWith(pkgRoot))) {
      // gather named exports
      for (const ed of sf.getExportedDeclarations()) {
        const [name, decls] = ed;
        const d = decls[0];
        const kindName = d.getKindName();

        if (kindName.endsWith("FunctionDeclaration")) {
          const fn = (d as any);
          const sig = fn.getSignature();
          const params: MemberSig[] = fn.getParameters().map((p:any) => ({ name: p.getName(), type: p.getType().getText(), optional: p.isOptional?.() }));
          const ret = sig ? sig.getReturnType().getText() : fn.getReturnType().getText();
          const signature = `function ${name}(${params.map(p=>p.name+":"+p.type+(p.optional?"?":"")).join(", ")}): ${ret}`;
          exports[name] = { kind: "function", name, signature: hashSignature(signature), fn: { params, returns: ret } as FnSig };
        }
        else if (kindName.endsWith("VariableDeclaration")) {
          const v = (d as any);
          const typ = v.getType().getText();
          const signature = `var ${name}: ${typ}`;
          exports[name] = { kind: "variable", name, signature: hashSignature(signature) };
        }
        else if (kindName.endsWith("ClassDeclaration")) {
          const c = (d as any);
          const props: MemberSig[] = c.getProperties().filter((p:any)=>p.hasModifier("public") || !p.hasModifier("private")).map((p:any)=>({ name: p.getName(), type: p.getType().getText(), optional: p.hasQuestionToken?.() }));
          const methods: Record<string, FnSig> = {};
          c.getMethods().filter((m:any)=>m.hasModifier("public") || !m.hasModifier("private")).forEach((m:any) => {
            const params: MemberSig[] = m.getParameters().map((p:any)=>({ name: p.getName(), type: p.getType().getText(), optional: p.isOptional?.() }));
            const ret = m.getReturnType().getText();
            methods[m.getName()] = { params, returns: ret };
          });
          const signature = `class ${name}{ props:[${props.map(p=>p.name+":"+p.type+(p.optional?"?":"")).join(",")}]; methods:[${Object.entries(methods).map(([n,f])=>`${n}(${f.params.map(p=>p.type).join(",")}):${f.returns}`).join(";")}] }`;
          exports[name] = { kind: "class", name, signature: hashSignature(signature), class: { props, methods } as ClassSig };
        }
        else if (kindName.endsWith("InterfaceDeclaration")) {
          const i = (d as any);
          const members: MemberSig[] = i.getProperties().map((p:any)=>({ name: p.getName(), type: p.getType().getText(), optional: p.hasQuestionToken?.() }));
          const signature = `interface ${name}{${members.map(m=>m.name+":"+m.type+(m.optional?"?":"")).join(";")}}`;
          exports[name] = { kind: "interface", name, signature: hashSignature(signature) };
        }
        else if (kindName.endsWith("TypeAliasDeclaration")) {
          const t = (d as any);
          const text = t.getTypeNode()?.getText() ?? t.getType().getText();
          const signature = `type ${name}=${text}`;
          exports[name] = { kind: "type", name, signature: hashSignature(signature) };
        }
        else if (kindName.endsWith("EnumDeclaration")) {
          const e = (d as any);
          const members = e.getMembers().map((m:any)=>m.getName());
          const signature = `enum ${name}{${members.join(",")}}`;
          exports[name] = { kind: "enum", name, signature: hashSignature(signature) };
        }
      }
    }

    const snap: PkgSnapshot = { pkgName, version, exports };
    workspace.packages[pkgName] = snap;
  }

  await writeJSON(path.resolve(args["--out"]), workspace);
  console.log(`semverguard: snapshot → ${args["--out"]} (${Object.keys(workspace.packages).length} packages)`);
}

main().catch(e => { console.error(e); process.exit(1); });
