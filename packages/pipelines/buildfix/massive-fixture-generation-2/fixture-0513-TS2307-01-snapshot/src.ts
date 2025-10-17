import type {
  PkgSnapshot,
  ApiItem,
  FnSig,
  ClassSig,
  MemberSig,
} from "./types.js";

const args = parseArgs({
  "--root": "packages",
  "--tsconfig": "tsconfig.json",
  "--cache": ".cache/semverguard",
  "--ns": "snapshot",
});

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(moduleDir, "..");
const REPO_ROOT = path.resolve(PACKAGE_ROOT, "..", "..");

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function resolvePath(
  input: string | undefined,
  defaultPath: string,
  options: { mustExist?: boolean; bases?: string[] } = {},
): Promise<string> {
  const { mustExist = false, bases = [REPO_ROOT, PACKAGE_ROOT] } = options;
  const select = async (candidate: string): Promise<string> => {
    if (mustExist && !(await pathExists(candidate))) {
      throw new Error(`semverguard: path not found → ${candidate}`);
    }
    return candidate;
  };
  if (!input) {
    return select(defaultPath);
  }
  if (path.isAbsolute(input)) {
    return select(path.resolve(input));
  }
  for (const base of bases) {
    const candidate = path.resolve(base, input);
    if (!mustExist) {
      return candidate;
    }
    if (await pathExists(candidate)) {
      return candidate;
    }
  }
  const fallback = path.resolve(bases[0] ?? REPO_ROOT, input);
  return select(fallback);
}

async function main() {
  const ROOT = await resolvePath(
    args["--root"],
    path.resolve(REPO_ROOT, args["--root"] ?? "packages"),
    { mustExist: true, bases: [REPO_ROOT, PACKAGE_ROOT] },
  );
  const pkgs = await fs
    .readdir(ROOT, { withFileTypes: true })
    .then((ents) => ents.filter((e) => e.isDirectory()).map((e) => e.name));

  const project = new Project({
    tsConfigFilePath: await resolvePath(
      args["--tsconfig"],
      path.join(PACKAGE_ROOT, args["--tsconfig"] ?? "tsconfig.json"),
      { mustExist: true, bases: [PACKAGE_ROOT, REPO_ROOT] },
    ),
    skipAddingFilesFromTsConfig: true,
  });
  const cache = await openLevelCache<PkgSnapshot>({
    path: await resolvePath(
      args["--cache"],
      path.resolve(REPO_ROOT, args["--cache"] ?? ".cache/semverguard"),
      { bases: [REPO_ROOT, PACKAGE_ROOT] },
    ),
    namespace: args["--ns"] ?? "snapshot",
  });

  let count = 0;
  for (const dir of pkgs) {
    const pkgRoot = path.join(ROOT, dir);
    const pkgJsonPath = path.join(pkgRoot, "package.json");
    let pkgName = dir,
      version = "0.0.0";
    try {
      const pkgJson = JSON.parse(await fs.readFile(pkgJsonPath, "utf-8"));
      pkgName = pkgJson.name ?? dir;
      version = pkgJson.version ?? "0.0.0";
    } catch {}

    // include src/lib files
    const files = await globby([
      `${pkgRoot.replace(/\\/g, "/")}/**/*.{ts,tsx,js,jsx}`,
      "!**/node_modules/**",
      "!**/dist/**",
      "!**/build/**",
    ]);
    files.forEach((f: string) => project.addSourceFileAtPathIfExists(f));

    const exports: Record<string, ApiItem> = {};

    for (const sf of project
      .getSourceFiles()
      .filter((s) => s.getFilePath().startsWith(pkgRoot))) {
      // gather named exports
      for (const ed of sf.getExportedDeclarations()) {
        const [name, decls] = ed;
        const d = decls[0];
        if (!d) continue;
        const kindName = d.getKindName();

        if (kindName.endsWith("FunctionDeclaration")) {
          const fn = d as any;
          const sig = fn.getSignature();
          const params: MemberSig[] = fn.getParameters().map((p: any) => ({
            name: p.getName(),
            type: p.getType().getText(),
            optional: p.isOptional?.(),
          }));
          const ret = sig
            ? sig.getReturnType().getText()
            : fn.getReturnType().getText();
          const signature = `function ${name}(${params
            .map((p) => p.name + ":" + p.type + (p.optional ? "?" : ""))
            .join(", ")}): ${ret}`;
          exports[name] = {
            kind: "function",
            name,
            signature: hashSignature(signature),
            fn: { params, returns: ret } as FnSig,
          };
        } else if (kindName.endsWith("VariableDeclaration")) {
          const v = d as any;
          const typ = v.getType().getText();
          const signature = `var ${name}: ${typ}`;
          exports[name] = {
            kind: "variable",
            name,
            signature: hashSignature(signature),
          };
        } else if (kindName.endsWith("ClassDeclaration")) {
          const c = d as any;
          const props: MemberSig[] = c
            .getProperties()
            .filter(
              (p: any) => p.hasModifier("public") || !p.hasModifier("private"),
            )
            .map((p: any) => ({
              name: p.getName(),
              type: p.getType().getText(),
              optional: p.hasQuestionToken?.(),
            }));
          const methods: Record<string, FnSig> = {};
          c.getMethods()
            .filter(
              (m: any) => m.hasModifier("public") || !m.hasModifier("private"),
            )
            .forEach((m: any) => {
              const params: MemberSig[] = m.getParameters().map((p: any) => ({
                name: p.getName(),
                type: p.getType().getText(),
                optional: p.isOptional?.(),
              }));
              const ret = m.getReturnType().getText();
              methods[m.getName()] = { params, returns: ret };
            });
          const signature = `class ${name}{ props:[${props
            .map((p) => p.name + ":" + p.type + (p.optional ? "?" : ""))
            .join(",")}]; methods:[${Object.entries(methods)
            .map(
              ([n, f]) =>
                `${n}(${f.params.map((p) => p.type).join(",")}):${f.returns}`,
            )
            .join(";")}] }`;
          exports[name] = {
            kind: "class",
            name,
            signature: hashSignature(signature),
            class: { props, methods } as ClassSig,
          };
        } else if (kindName.endsWith("InterfaceDeclaration")) {
          const i = d as any;
          const members: MemberSig[] = i.getProperties().map((p: any) => ({
            name: p.getName(),
            type: p.getType().getText(),
            optional: p.hasQuestionToken?.(),
          }));
          const signature = `interface ${name}{${members
            .map((m) => m.name + ":" + m.type + (m.optional ? "?" : ""))
            .join(";")}}`;
          exports[name] = {
            kind: "interface",
            name,
            signature: hashSignature(signature),
          };
        } else if (kindName.endsWith("TypeAliasDeclaration")) {
          const t = d as any;
          const text = t.getTypeNode()?.getText() ?? t.getType().getText();
          const signature = `type ${name}=${text}`;
          exports[name] = {
            kind: "type",
            name,
            signature: hashSignature(signature),
          };
        } else if (kindName.endsWith("EnumDeclaration")) {
          const e = d as any;
          const members = e.getMembers().map((m: any) => m.getName());
          const signature = `enum ${name}{${members.join(",")}}`;
          exports[name] = {
            kind: "enum",
            name,
            signature: hashSignature(signature),
          };
        }
      }
    }

    const snap: PkgSnapshot = { pkgName, version, exports };
    await cache.set(pkgName, snap);
    count++;
  }
  await cache.close();
  console.log(
    `semverguard: snapshot → ${args["--ns"] ?? "snapshot"} (${count} packages)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
