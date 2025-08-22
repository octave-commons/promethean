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
  config
 } from "./config.js";
import { 
  getGame,
  startGame,
  loadGame,
  saveGame
 } from "./game.js";
var displayDecimal = (function displayDecimal$(d = this.d, n = 6) {
  /* display-decimal inc/core/function-expressions.sibilant:28:8 */

  return (Math.round((Math.pow(10, n) * d)) / Math.pow(10, n));
});
var startInterface = (function startInterface$() {
  /* start-interface eval.sibilant:11:0 */

  const game=getGame();
  const gameView=createDocumentNode("div", {
    'id': "game-view",
    'className': "panel",
    'style': { 
      "background-color":"black"
     }
  }, [ (() => {
  	return (function() {
    if (game) {
      return game.rendering.context.canvas;
    } else {
      return "";
    }
  }).call(this);
  }) ]);
  return createDocumentNode("div", { 'id': "frame" }, [ createDocumentNode("div", { 'id': "container" }, [ gameView, createDocumentNode("div", {
    'id': "debug-view",
    'className': "panel",
    'style': { 
      height:(config.dimensions[1] + "px"),
      width:(Math.round(((window.innerWidth * 0.2) - 42)) + "px"),
      "overflow-y":"scroll"
     }
  }, [ createDocumentNode("div", { 'id': "startGame" }, [ createDocumentNode("button", { 'onclick': (() => {
  	startGame();
  return startInterface();
  }) }, [ "start game" ]) ]), createDocumentNode("div", { 'id': "loadGame" }, [ createDocumentNode("button", { 'onclick': (() => {
  	return loadGame(document.getElementById("loadSaveNameField").value);
  }) }, [ "load game" ]), createDocumentNode("input", {
    'type': "text",
    'id': "loadNameField"
  }, []) ]), createDocumentNode("div", { 'id': "saveGame" }, [ createDocumentNode("button", { 'onclick': (() => {
  	return saveGame(document.getElementById("saveNameField").value);
  }) }, [ "save game" ]), createDocumentNode("input", {
    'type': "text",
    'id': "saveNameField"
  }, []) ]) ]) ]) ]).render(DocumentBody);
});
export { 
  startInterface
 };