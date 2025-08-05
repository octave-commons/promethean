Array.prototype.each = (function Array$prototype$each$(f) {
  /* Array.prototype.each inc/misc.sibilant:1:1692 */

  this.forEach(f);
  return this;
});
Object.prototype.each = (function Object$prototype$each$(f) {
  /* Object.prototype.each inc/misc.sibilant:1:1754 */

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
import '/bundles/external.js';
import { 
  Vector2DPhaseSpace
 } from "../typed-arrays/vector-2d.js";
import { 
  DoubleBufferedArray
 } from "../typed-arrays/double-buffered.js";
import { 
  DataType
 } from "../data-types/data-type.js";
import { 
  Vector
 } from "/shared/vectors.js";
import { 
  Spawnable
 } from "/shared/data-structures/spawnable.js";
var QuadTree = require("@timohausmann/quadtree-js");
const gravitationalConstant=1e-8;
const minDist=1;
const particleSize=512;
var PhysicalProperty = DataType.define("PhysicalProperty", { 
  keys:[ "mass" ]
 });
var PhysicalProperties = DoubleBufferedArray.define("PhysicalProperties", { 
  dataType:PhysicalProperty
 });
var Particle = Spawnable.define("Particle", { 
  init( posSource = this.posSource,attractor = this.attractor,mass = this.mass,x = posSource.x,y = posSource.y,height = 256,width = 256,pos = Vector.spawn(posSource.x, posSource.y),vel = Vector.spawn(attractor.x, attractor.y) ){ 
    
      this.posSource = posSource;this.attractor = attractor;this.mass = mass;this.x = x;this.y = y;this.height = height;this.width = width;this.pos = pos;this.vel = vel;
      return this;
    
   },
  clear(  ){ 
    
      this.posSource = null;
      this.pos.despawn();
      this.vel.despawn();
      this.pos = null;
      this.vel = null;
      this.width = null;
      return this.height = null;
    
   },
  get id(  ){ 
    
      return this.posSource.id;
    
   }
 });
self.onmessage = (function self$onmessage$(e) {
  /* self.onmessage eval.sibilant:49:0 */

  const [ [ vb1, vb2 ], [ pb1, pb2 ], [ ab1, ab2 ], [ mb1, mb2 ] ]=e.data.buffers;
  const velocities=Vector2DPhaseSpace.fromBuffers(vb1, vb2);
  const positions=Vector2DPhaseSpace.fromBuffers(pb1, pb2);
  const attractors=Vector2DPhaseSpace.fromBuffers(ab1, ab2);
  const masses=PhysicalProperties.fromBuffers(mb1, mb2);
  const particles=[];
  var minMass = 0;
  var maxMass = 0;
  for (var pos of positions.data)
  {
  const attractor=attractors.data[pos.id];;
  const mass=masses.data[pos.id].mass;;
  minMass = Math.min(minMass, mass);;
  maxMass = Math.max(maxMass, mass);;
  const particle={ 
    x:pos.x,
    y:pos.y,
    id:pos.id,
    posSource:pos,
    mass,
    attractor,
    pos:Vector.spawn(pos.x, pos.y),
    vel:Vector.spawn(0, 0),
    height:256,
    width:256
   };;
  particles.push(particle)
  }
  ;
  for (var p1 of particles)
  {
  for (var p2 of particles)
  {
  if( p1.id === p2.id ){ 
    continue
   };
  const dist=p2.pos.distanceTo(p1.pos);;
  const usedDistance=Math.max(minDist, Math.abs(dist.getLength()));;
  const mag=Math.sqrt(((dist.x * dist.x) + (dist.y * dist.y)));;
  const intensity=((gravitationalConstant * p2.mass * usedDistance) / Math.pow(mag, 2));;
  dist.setLength(intensity);
  p1.vel.addTo(dist);
  dist.despawn()
  }
  
  }
  ;
  for (var p of particles)
  {
  p.attractor.addTo(p.vel);
  p.vel.despawn();
  p.pos.despawn()
  }
  ;
  self.postMessage([ [ vb1, pb1 ], [ vb2, pb2 ], [ ab1, ab2 ] ]);
  velocities.despawn();
  positions.despawn();
  attractors.despawn();
  return masses.despawn();
});