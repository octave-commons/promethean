require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"@crash-landed/exploration.js":[function(require,module,exports){
Array.prototype.each = (function Array$prototype$each$(f) {
  /* Array.prototype.each inc/misc.sibilant:1:1121 */

  this.forEach(f);
  return this;
});
Object.prototype.each = (function Object$prototype$each$(f) {
  /* Object.prototype.each inc/misc.sibilant:1:1183 */

  return Object.keys(this).forEach(((k) => {
  	
    return f(this[k], k);
  
  }));
});
game.events.on("tick", ((t) => {
	
  const pos=p.positionInterface;
  (function() {
    if ((t % 10) === 0) {
      return p.playerSprite.step();
    }
  }).call(this);
  const directionName=getCardinalDirectionName(v);
  return p.playerSprite.selectSequence(directionName);

})).once("error", ((err) => {
	
  console.log("error on", "tick", "of", "game.events", "given", "t()");
  return console.log(err);

}));
},{}]},{},[]);
