var plift = (function plift$(f) {
  /* plift sib/promise.sibilant:1:0 */

  "create a promise returning function from a node callback accepting functions";
  return promised(args(), f.apply(this, [ args, =>(err(data), (function() {
    if (err) {
      return reject(err);
    } else {
      return resolve(data);
    }
  }).call(this)) ]));
});
exports.plift = plift;