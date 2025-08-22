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
  simplex3,
  simplex2
 } from "/shared/noise.js";
import { 
  Vector2DPhaseSpace
 } from "./typed-arrays/vector-2d.js";
import { 
  DoubleBufferedArray
 } from "./typed-arrays/double-buffered.js";
import { 
  rendering,
  vertexLayer
 } from "./rendering.js";
import { 
  Thread
 } from "/shared/worker.js";
import { 
  config
 } from "./config.js";
import { 
  Ticker
 } from "/shared/ticker.js";
import { 
  Vector
 } from "/shared/vectors.js";
import { 
  DataType
 } from "./data-types/data-type.js";
import { 
  gameView,
  startButton
 } from "./ui.js";
var ThreadedSystem = Thread.define("ThreadedSystem", { 
  data:[],
  update( args ){ 
    
      return this.send({ 
        args,
        buffers:this.data.map(((data) => {
        	return [ data.currentState.buffer, data.nextState.buffer ];
        }))
       });
    
   }
 });
var PhysicalProperty = DataType.define("PhysicalProperty", { 
  keys:[ "mass", "scale" ]
 });
var PhysicalProperties = DoubleBufferedArray.define("PhysicalProperties", { 
  dataType:PhysicalProperty
 });
const { 
  spawnWidth,
  spawnHeight,
  dimensions,
  particleCount,
  maxMass,
  minMass,
  actualMaximumMass,
  particleRenderSize
 }=config;
const velocities=Vector2DPhaseSpace.spawn(particleCount);
const attractors=Vector2DPhaseSpace.spawn(particleCount);
const physicalProperties=PhysicalProperties.spawn(particleCount);
const positions=Vector2DPhaseSpace.spawn(particleCount);
const vertices=vertexLayer(particleCount);
var MovementSystem = ThreadedSystem.define("MovementSystem", { 
  url:("/client/simple-gravity/workers/movement.js"),
  data:[ velocities, positions, attractors ]
 });
var AttractorSystem = ThreadedSystem.define("AttractorSystem", { 
  url:"/client/simple-gravity/workers/attractors.js",
  data:[ velocities, positions, attractors, physicalProperties ]
 });
var initializeMotes = (function initializeMotes$(positions, verts) {
  /* initialize-motes eval.sibilant:60:0 */

  for (var p of positions.data)
  {
  const phys=physicalProperties.data[p.id];;
  verts[p.id].color.r = 255;
  verts[p.id].color.g = 10;
  verts[p.id].color.b = 10;
  verts[p.id].color.a = 255;;
  verts[p.id].size = phys.scale;
  verts[p.id].intensity = phys.scale;;
  verts[p.id].point.x = p.x;
  verts[p.id].point.y = p.y;
  verts[p.id].point.z = 1;
  }
  ;
  return null;
});
const randomSignedFloat=((range) => {
	return ((Math.random() * (range - (-1 * range))) + (-1 * range));
});
var randomlyPlaceParticles = (function randomlyPlaceParticles$() {
  /* randomly-place-particles eval.sibilant:76:0 */

  const spawnPos=Vector.spawn(0, 0);
  for (var p of positions.data)
  {
  const phys=physicalProperties.data[p.id];;
  var scale = (maxMass * Math.random());;
  var mass = Math.max(minMass, Math.pow(scale, 3));;
  phys.mass = mass;
  phys.scale = scale;;
  spawnPos.addTo({ 
    x:((mass / actualMaximumMass) * randomSignedFloat(spawnWidth)),
    y:((mass / actualMaximumMass) * randomSignedFloat(spawnHeight))
   });
  p.x = spawnPos.x;;
  p.y = spawnPos.y;
  }
  ;
  return null;
});
var getBounds = (function getBounds$(positions) {
  /* get-bounds eval.sibilant:96:0 */

  var minX = 0,
      minY = 0,
      maxX = 0,
      maxY = 0;
  for (var p of positions.data)
  {
  (function() {
    if (p.x < minX) {
      return minX = p.x;
    }
  }).call(this);
  (function() {
    if (p.y < minY) {
      return minY = p.y;
    }
  }).call(this);
  (function() {
    if (p.x > maxX) {
      return maxX = p.x;
    }
  }).call(this);
  (function() {
    if (p.y > maxY) {
      return maxY = p.y;
    }
  }).call(this)
  }
  ;
  return [ minX, minY, maxX, maxY ];
});
randomlyPlaceParticles();
physicalProperties.step();
positions.step();
velocities.step();
initializeMotes(positions, vertices);
rendering.update();
var wait = (function wait$(n) {
  /* wait eval.sibilant:120:0 */

  return (new Promise(((success, fail) => {
  	var resolve = success,
      reject = fail;
  return setTimeout(resolve, n);
  })));
});
async function draw(){

  while( true ){ 
    await (new Promise(((success, fail) => {
    	var resolve = success,
        reject = fail;
    return requestAnimationFrame((() => {
    	rendering.update();
    return resolve();
    }));
    })))
   };
  return null;

};
async function main(){

  MovementSystem.init();
  AttractorSystem.init();
  MovementSystem.start();
  AttractorSystem.start();
  const drawer=draw();
  var promise = Promise.resolve();
  while( true ){ 
    await Promise.all([ AttractorSystem.update({ 
      bounds:getBounds(positions)
     }), MovementSystem.update() ]);
    positions.step();
    attractors.step();
    for (var p of positions.data)
    {
    const v=velocities.data[p.id];;
    const a=attractors.data[p.id];;
    const phys=physicalProperties.data[p.id];;
    vertices[p.id].color.b = Math.min(255, Math.abs(Math.round((32 * a.x))));
    vertices[p.id].color.g = Math.min(255, Math.abs(Math.round((32 * a.y))));;
    vertices[p.id].point.x = p.x;
    vertices[p.id].point.y = p.y;
    }
    
   };
  return null;

};
createDocumentNode("div", { 'id': "frame" }, [ createDocumentNode("div", { 'id': "container" }, [ gameView, createDocumentNode("div", {
  'id': "debug-view",
  'className': "panel",
  'style': { 
    height:(dimensions[1] + "px"),
    width:(Math.round(((window.innerWidth * 0.2) - 42)) + "px"),
    "overflow-y":"scroll"
   }
}, [ startButton(main) ]) ]) ]).render(DocumentBody);