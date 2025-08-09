export function matchTopic(pattern: string, topic: string): boolean {
  const pSegs = pattern.split(".");
  const tSegs = topic.split(".");
  let i = 0,
    j = 0;
  while (i < pSegs.length && j < tSegs.length) {
    const p = pSegs[i],
      t = tSegs[j];
    if (p === "**") {
      if (i === pSegs.length - 1) return true; // ** at end
      // try to consume until next segment matches
      const next = pSegs[i + 1];
      while (j < tSegs.length) {
        if (segmentMatch(next, tSegs[j])) {
          i++;
          break;
        }
        j++;
      }
    } else if (segmentMatch(p, t)) {
      i++;
      j++;
    } else {
      return false;
    }
  }
  // consume trailing **
  while (i < pSegs.length && pSegs[i] === "**") i++;
  return i === pSegs.length && j === tSegs.length;
}
function segmentMatch(p: string, t: string) {
  if (p === "*") return true;
  if (p === t) return true;
  return false;
}
