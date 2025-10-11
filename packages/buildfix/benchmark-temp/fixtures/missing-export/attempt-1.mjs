import { SyntaxKind } from "ts-morph";
export async function apply(project){
  const by = (p)=>project.getSourceFile(p) || project.getSourceFiles().find(f=>f.getFilePath().endsWith(p));
  const not = (x,msg)=>{ if(!x) throw new Error(msg); };

  { const sf = by("/home/err/devel/promethean/packages/buildfix/benchmark-temp/fixtures/missing-export/src.ts"); not(sf,"file");
    const ent = sf.getFunctions().find(f=>f.getName()==="helper");
    if (ent && !ent.hasExportKeyword?.()) ent.setIsExported?.(true);
  }
}
