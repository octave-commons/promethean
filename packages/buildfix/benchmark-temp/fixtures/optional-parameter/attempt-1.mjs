import { SyntaxKind } from "ts-morph";
export async function apply(project){
  const by = (p)=>project.getSourceFile(p) || project.getSourceFiles().find(f=>f.getFilePath().endsWith(p));
  const not = (x,msg)=>{ if(!x) throw new Error(msg); };

  { const sf = by("/home/err/devel/promethean/packages/buildfix/benchmark-temp/fixtures/optional-parameter/src.ts"); not(sf,"file");
    const fn = sf.getFunctions().find(x=>x.getName()==="calculate");
    if (fn){
      const p = fn.getParameters().find(p=>p.getName()==="value");
      if (p && !p.hasQuestionToken()) p.setHasQuestionToken(true);
    }
  }
}
