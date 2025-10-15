import { SyntaxKind } from "ts-morph";
export async function apply(project){
  const by = (p)=>project.getSourceFile(p) || project.getSourceFiles().find(f=>f.getFilePath().endsWith(p));
  const not = (x,msg)=>{ if(!x) throw new Error(msg); };

  { const sf = by("/home/err/devel/promethean/packages/buildfix/repo-benchmark-temp/fixtures/repo-file-1-flags/src.ts"); not(sf,"file");
    const name="functionName";
    if (!sf.getFunction(name)) sf.addFunction({
      name,
      isExported: true,
      parameters: [],
      statements: "return void;"
    });
  }
}
