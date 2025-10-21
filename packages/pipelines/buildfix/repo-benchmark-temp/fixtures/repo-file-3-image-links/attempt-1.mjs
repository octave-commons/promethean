import { SyntaxKind } from "ts-morph";
export async function apply(project){
  const by = (p)=>project.getSourceFile(p) || project.getSourceFiles().find(f=>f.getFilePath().endsWith(p));
  const not = (x,msg)=>{ if(!x) throw new Error(msg); };

  { const sf = by("/home/err/devel/promethean/packages/buildfix/repo-benchmark-temp/fixtures/repo-file-3-image-links/src.ts"); not(sf,"file");
    const names = ["default"];
    const decl = sf.getImportDeclarations().find(d=>d.getModuleSpecifierValue()==="@promethean/fs");
    if (decl) { for (const n of names) { if (!decl.getNamedImports().some(ni=>ni.getName()===n)) decl.addNamedImport(n); } }
    else { sf.addImportDeclaration({ moduleSpecifier: "@promethean/fs", namedImports: names }); }
  }
}
