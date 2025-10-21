import { SyntaxKind } from "ts-morph";
export async function apply(project){
  const by = (p)=>project.getSourceFile(p) || project.getSourceFiles().find(f=>f.getFilePath().endsWith(p));
  const not = (x,msg)=>{ if(!x) throw new Error(msg); };

  { const sf = by("/home/err/devel/promethean/packages/buildfix/large-benchmark-temp/fixtures/packages_buildfix_src_01-errors/src.ts"); not(sf,"file");
    const name="fixMissingBrace";
    if (!sf.getFunction(name)) sf.addFunction({
      name,
      isExported: true,
      parameters: [],
      statements: "return void;"
    });
  }
}
