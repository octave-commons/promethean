var euclidianDistance = (function euclidianDistance$(x, y, a, b) {
  /* euclidian-distance eval.sibilant:1:0 */

  return Math.sqrt((Math.pow((x - a), 2) + Math.pow((y - b), 2)));
});
exports.euclidianDistance = euclidianDistance;
var square = (function square$(dim, f) {
  /* square eval.sibilant:6:0 */

  let lim = Math.round((dim / 2));
  for (let i = (0 - lim);i <= lim;++(i)){
  for (let j = (0 - lim);j <= lim;++(j)){
  console.log("square!", i, j, lim);
  f(i, j)}};
  return null;
});
var inverseSquare = (function inverseSquare$(rate, pos, x, y) {
  /* inverse-square eval.sibilant:14:0 */

  return (rate / (1 + Math.pow(euclidianDistance(x, y, pos.x, pos.y), 2)));
});
exports.inverseSquare = inverseSquare;