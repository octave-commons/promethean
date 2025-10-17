import { SyntaxKind } from "ts-morph";
export async function apply(project){
  const by = (p)=>project.getSourceFile(p) || project.getSourceFiles().find(f=>f.getFilePath().endsWith(p));
  const not = (x,msg)=>{ if(!x) throw new Error(msg); };

  { const sf = by("/home/err/devel/promethean/packages/buildfix/simple-benchmark-temp/fixtures/undefined-variable/src.ts"); not(sf,"file");
    const names = ["undefinedVariable"];
    const decl = sf.getImportDeclarations().find(d=>d.getModuleSpecifierValue()==="module");
    if (decl) { for (const n of names) { if (!decl.getNamedImports().some(ni=>ni.getName()===n)) decl.addNamedImport(n); } }
    else { sf.addImportDeclaration({ moduleSpecifier: "module", namedImports: names }); }
  }
  { const sf = by("/home/err/devel/promethean/packages/buildfix/simple-benchmark-temp/fixtures/undefined-variable/src.ts"); not(sf,"file");
    const ent = sf.getVariableDeclaration("undefinedVariable");
    if (ent && !ent.hasExportKeyword?.()) ent.setIsExported?.(true);
  }
}
