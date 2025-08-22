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
import { 
  config
 } from "../config.js";
var ParticleGroup = Spawnable.define("ParticleGroup", { 
  init( members = (this.members || []) ){ 
    
      this.members = members;
      return this;
    
   },
  get center(  ){ 
    
      return (function() {
        if (this._center) {
          return this._center;
        } else {
          return this._center = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            var center = Vector.spawn(0, 0);
            for (var member of this.members)
            {
            const a=member.pos.mult(member.mass);;
            center.addTo(a);
            a.despawn()
            }
            ;
            center.divTo(this.mass);
            return center;
          }).call(this);
        }
      }).call(this);
    
   },
  get mass(  ){ 
    
      return (function() {
        if (this._mass) {
          return this._mass;
        } else {
          return this._mass = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            var mass = 0;
            for (var member of this.members)
            {
            mass += member.mass
            }
            ;
            return mass;
          }).call(this);
        }
      }).call(this);
    
   },
  clear(  ){ 
    
      (function() {
        if (this._center) {
          (function() {
            if (this._center.spawn) {
              return this._center.despawn();
            } else if ((this._center[0] && this._center[0].spawn)) {
              return this._center.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._center = null;
        }
      }).call(this);
      (function() {
        if (this._mass) {
          (function() {
            if (this._mass.spawn) {
              return this._mass.despawn();
            } else if ((this._mass[0] && this._mass[0].spawn)) {
              return this._mass.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._mass = null;
        }
      }).call(this);
      return this.members.length = 0;
    
   }
 });
var Particle = Spawnable.define("Particle", { 
  init( posSource = this.posSource,mass = this.mass,scale = this.scale,height = scale,width = scale,pos = Vector.spawn(posSource.x, posSource.y) ){ 
    
      this.posSource = posSource;this.mass = mass;this.scale = scale;this.height = height;this.width = width;this.pos = pos;
      return this;
    
   },
  get x(  ){ 
    
      return this.posSource.x;
    
   },
  get y(  ){ 
    
      return this.posSource.y;
    
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
  /* self.onmessage eval.sibilant:63:0 */

  const [ [ pb1, pb2 ], [ mb1, mb2 ] ]=e.data.buffers;
  const groupBuffers=e.data.groupBuffers;
  const groups=groupBuffers.map((([ gb1, gb2 ]) => {
  	return Vector2DPhaseSpace.fromBuffers(gb1, gb2);
  }));
  const { 
    bounds:[ minX, minY, maxX, maxY ]
   }=e.data.args;
  const positions=Vector2DPhaseSpace.fromBuffers(pb1, pb2);
  const phys=PhysicalProperties.fromBuffers(mb1, mb2);
  const particles=[];
  const quadsConfig={ 
    x:minX,
    y:minY,
    height:(maxY - minY),
    width:(maxX - minX)
   };
  const quads=(new QuadTree(quadsConfig, maxObjects, maxLevels));
  for (var pos of positions.data)
  {
  const object=phys.data[pos.id];;
  const particle=Particle.spawn(pos, object.mass, object.scale);;
  particles.push(particle);
  quads.insert(particle)
  }
  ;
  const visited=(new Set());
  const groups=[];
  var currentGroup = ParticleGroup.spawn();
  for (var pos of positions.data)
  {
  if( visited.has(pos.id) ){ 
    continue
   };
  const object=phys.data[pos.id];;
  const p=Vector.spawn(pos.x, pos.y);;
  const elements=quads.retrieve({ 
    x:pos.x,
    y:pos.y,
    height:object.scale,
    width:object.scale
   }).sort(((a, b) => {
  	const d1=Math.abs(p.distanceTo(a.pos));
  const d2=Math.abs(p.distanceTo(b.pos));
  return (function() {
    if (d1 > d2) {
      return 1;
    } else {
      return -1;
    }
  }).call(this);
  }));;
  p.despawn();
  for (var neighbor of elements)
  {
  if( currentGroup.members.length > config.groupSize ){ 
    groups.push(currentGroup);
    currentGroup = ParticleGroup.spawn();
   };
  if( visited.has(neighbor.id) ){ 
    continue
   };
  visited.add(neighbor.id);
  currentGroup.members.push(neighbor);
  neighbor.group = currentGroup;
  }
  
  }
  ;
  return for (var group of groups)
  {
  
  }
  ;
});