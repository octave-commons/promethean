Array.prototype.each = (function Array$prototype$each$(f) {
  /* Array.prototype.each inc/misc.sibilant:1:1831 */

  this.forEach(f);
  return this;
});
Object.prototype.each = (function Object$prototype$each$(f) {
  /* Object.prototype.each inc/misc.sibilant:1:1893 */

  return Object.keys(this).forEach(((k) => {
  	return f(this[k], k);
  }));
});
import '/bundles/external.js';
import { 
  mixin,
  create,
  extend
 } from "/shared/kit/core/util.js";
import { 
  renderChildren,
  createDocumentNode,
  DocumentNode,
  DocumentBody,
  DocumentHead,
  DocumentRoot
 } from "/shared/dom.js";
import { 
  rendering
 } from "./rendering.js";
const gameView=createDocumentNode("div", {
  'id': "game-view",
  'className': "panel",
  'style': { 
    "background-color":"black"
   }
}, [ (() => {
	return rendering.context.canvas;
}) ]);
var startButton = (function startButton$(startGame) {
  /* start-button eval.sibilant:9:0 */

  return createDocumentNode("div", { 'id': "startGame" }, [ createDocumentNode("button", { 'onclick': startGame }, [ "start game" ]) ]);
});
var panel = (function panel$(args) {
  /* panel eval.sibilant:11:0 */

  var args = Array.prototype.slice.call(arguments, 0);

  return createDocumentNode("div", {
    'className': "panel",
    'style': { 
      width:"99%"
     }
  }, [ args ]);
});
var particleList = (function particleList$(particles) {
  /* particle-list eval.sibilant:14:0 */

  return createDocumentNode("div", { 'className': "panel" }, [ panel("total mass", particles.phys.data.reduce(((r, phys) => {
  	return (r + phys.mass);
  }), 0)), particles.pos.data.map(((p) => {
  	return { 
    id:p.id,
    x:p.x,
    y:p.y,
    pos:p,
    mass:particles.phys.data[p.id].mass,
    scale:particles.phys.data[p.id].scale
   };
  })).sort(((a, b) => {
  	return (b.mass - a.mass);
  })).slice(0, 20).map(((p) => {
  	return createDocumentNode("div", { 'className': "panel" }, [ createDocumentNode("button", { 'onclick': (() => {
  	console.log("CLICK", { 
    p,
    rendering
   });
  rendering.xOffset = (-1 * p.pos.x);
  return rendering.yOffset = (-1 * p.pos.y);
  }) }, [ "jump to" ]), panel("id:", (" " + p.id)), panel("x:", (" " + p.x)), panel("y:", (" " + p.y)), panel("mass:", (" " + p.mass)), panel("scale:", (" " + p.scale)) ]);
  })) ]);
});
export { 
  particleList
 };
export { 
  gameView
 };
export { 
  startButton
 };