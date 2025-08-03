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
  rendering
 } from "/client/obstacles/rendering.js";
import { 
  vectorPool,
  trailPool
 } from "/shared/vectors.js";
import { 
  Physics
 } from "/shared/systems/physics.js";
import { 
  Dot
 } from "/shared/systems/rendering/dot.js";
import { 
  summate
 } from "/shared/math/math.js";
import { 
  ViewPanel,
  PropertyView
 } from "/client/obstacles/systems/property-view.js";
import { 
  config
 } from "/client/obstacles/config.js";
import { 
  game
 } from "/client/obstacles/game.js";
import { 
  ants,
  rocks,
  plants,
  trailSegments
 } from "/client/obstacles/entities.js";
var displayDecimal = (function displayDecimal$(d = this.d, n = 6) {
  /* display-decimal inc/core/function-expressions.sibilant:28:8 */

  return (Math.round((Math.pow(10, n) * d)) / Math.pow(10, n));
});
const gameView=createDocumentNode("div", {
  'id': "game-view",
  'className': "panel",
  'style': { 
    "background-color":"sandyBrown"
   }
}, [ rendering.context.canvas ]);
const getStats=(() => {
	const getTotalAntMass=(() => {
	return displayDecimal(ants.group.reduce(((sum, el) => {
	return (sum + (el.physicalProperties.mass || 0));
}), 0), 2);
});
const getAntCount=(() => {
	return ants.size;
});
const getWins=(() => {
	return ants.group.reduce(((sum, el) => {
	return (sum + (el.antLife.winCount || 0));
}), 0);
});
const getLosses=(() => {
	return ants.group.reduce(((sum, el) => {
	return (sum + (el.antLife.looseCount || 0));
}), 0);
});
const wins=getWins();
const losses=getLosses();
return [ createDocumentNode("div", {  }, [ "Ants" ]), createDocumentNode("div", {  }, [ "count:", getAntCount ]), createDocumentNode("div", {  }, [ "latency:", game.ticker.averageLatency ]), createDocumentNode("div", {  }, [ "fps:", game.ticker.averageFps ]), createDocumentNode("div", {  }, [ "target fps:", game.ticker.fps ]), createDocumentNode("div", {  }, [ "total mass:", getTotalAntMass ]), createDocumentNode("div", {  }, [ "wins:", displayDecimal(wins) ]), createDocumentNode("div", {  }, [ "losses:", displayDecimal(losses) ]), createDocumentNode("div", {  }, [ "win/loss:", displayDecimal((wins / losses)) ]) ];
});
const stats=createDocumentNode("div", { 'className': "panel" }, [ getStats ]);
const getVectorBucketCount=(() => {
	return vectorPool.buckets.length;
});
const getTrailBucketCount=(() => {
	return trailPool.buckets.length;
});
const poolsView=createDocumentNode("div", { 'className': "panel" }, [ createDocumentNode("h3", {  }, [ "Pools" ]), createDocumentNode("div", {  }, [ "vector buckets", getVectorBucketCount ]), createDocumentNode("div", {  }, [ "trail buckets", getTrailBucketCount ]) ]);
const resetButton=createDocumentNode("button", { 'onclick': (() => {
	rocks.clear();
ants.clear();
plants.clear();
trailSegments.clear();
return game.systems.getBySymbol(Physics.symbol).forces.each(((force) => {
	return f.reset();
}));
}) }, [ "Reset" ]);
const inputField=((label, initialInput, type, f) => {
	return createDocumentNode("div", {
  'className': "panel",
  'style': { 
    width:"49%"
   }
}, [ label, createDocumentNode("input", {
  'value': initialInput,
  'type': (type || "number"),
  'onchange': f
}, []) ]);
});
const numberInput=((label, initialInput, f) => {
	return inputField(label, initialInput, "number", f);
});
const configNumberInput=((label) => {
	return numberInput(label, config[label], ((event) => {
	return config[label] = event.target.value;
}));
});
const settingsPanel=createDocumentNode("div", { 'className': "panel" }, [ configNumberInput("angleZoom"), configNumberInput("noiseZ"), configNumberInput("fieldForce"), configNumberInput("decay"), configNumberInput("maxLength"), configNumberInput("trailResultDuration"), configNumberInput("growthRate"), configNumberInput("plantMassLimit"), configNumberInput("maxInDecay"), configNumberInput("trailLimit"), configNumberInput("antLife"), configNumberInput("antInfluence"), configNumberInput("trailResolution"), configNumberInput("stationaryResistanceCoefficiant") ]);
const debugView=createDocumentNode("div", {
  'id': "debug-view",
  'className': "panel",
  'style': { 
    height:(config.dimensions[1] + "px"),
    width:(Math.round(((window.innerWidth * 0.2) - 42)) + "px"),
    "overflow-y":"scroll"
   }
}, [ createDocumentNode("div", {  }, [ createDocumentNode("b", {  }, [ "stats" ]), resetButton, stats, poolsView ]), createDocumentNode("div", {  }, [ settingsPanel ]) ]);
var container = createDocumentNode("div", { 'id': "container" }, [ gameView, debugView ]);
export { 
  container
 };
export { 
  gameView
 };
export { 
  debugView
 };
var startInterface = (function startInterface$() {
  /* start-interface eval.sibilant:115:0 */

  createDocumentNode("div", { 'id': "frame" }, [ container ]).render(DocumentBody);
  return game.events.on("tick", ((t) => {
  	return (function() {
    if ((t % config.uiPollingRate) === 0) {
      stats.render();
      return poolsView.render();
    }
  }).call(this);
  })).once("error", ((err) => {
  	console.log("error on", "tick", "of", "game.events", "given", "t()");
  return console.log(err);
  }));
});
export { 
  startInterface
 };