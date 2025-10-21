import { SyntaxKind } from "ts-morph";
export async function apply(project){
  const by = (p)=>project.getSourceFile(p) || project.getSourceFiles().find(f=>f.getFilePath().endsWith(p));
  const not = (x,msg)=>{ if(!x) throw new Error(msg); };

  { const sf = by("/home/err/devel/promethean/packages/buildfix/repo-benchmark-temp/fixtures/repo-file-1-flags/src.ts"); not(sf,"file");
    const [kind, name] = "expression".split(":");
    if (kind==="function"){
      const fn = sf.getFunctions().find(x=>x.getName()===name);
      if (fn) fn.setReturnType("string");
    } else if (kind==="var"){
      const v = sf.getVariableDeclaration(name);
      if (v) v.setType("string");
    }
  }
}
