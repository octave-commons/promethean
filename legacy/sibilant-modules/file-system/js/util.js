var identity = (function identity$(a) {
  /* identity ../file-system/sib/util.sibilant:4:0 */

  return a;
});
defCurried(setValue, v(o), o.value = v;);
defCurried(reducePromise, f(a), a.reduce(f, [ Promise.resolve(), "" ]));
defPromised(timeout, t(), setTimeout(success, t));
var onceThen = (function onceThen$(event, emitter) {
  /* once-then ../file-system/sib/util.sibilant:26:0 */

  print("once then", event, emitter);
  return makePromise(emitter.once(event, success));
});