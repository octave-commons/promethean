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
  Vector2DArray
 } from "../typed-arrays/vector-2d.js";
import { 
  PhysicsArray
 } from "../typed-arrays/physics-array.js";
import { 
  GroupIdArray
 } from "../typed-arrays/group-id-array.js";
import { 
  BarycenterArray
 } from "../typed-arrays/barycenter-array.js";
import { 
  Vector
 } from "/shared/vectors.js";
import { 
  Spawnable
 } from "/shared/data-structures/spawnable.js";
import { 
  ParentSystem
 } from "../system.js";
var QuadTree = require("@timohausmann/quadtree-js");
import { 
  config
 } from "../config.js";
const { 
  maxLevels,
  maxObjects
 }=config;
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
  init( posSource = this.posSource,physSource = this.physSource,pos = Vector.spawn(posSource.x, posSource.y) ){ 
    
      this.posSource = posSource;this.physSource = physSource;this.pos = pos;
      return this;
    
   },
  get x(  ){ 
    
      return this.posSource.x;
    
   },
  get y(  ){ 
    
      return this.posSource.y;
    
   },
  get mass(  ){ 
    
      return this.physSource.mass;
    
   },
  get scale(  ){ 
    
      return this.physSource.scale;
    
   },
  set mass( v ){ 
    
      return this.physSource.mass = v;
    
   },
  set scale( v ){ 
    
      return this.physSource.scale = v;
    
   },
  get height(  ){ 
    
      return this.scale;
    
   },
  get width(  ){ 
    
      return this.scale;
    
   },
  clear(  ){ 
    
      (function() {
        if (this._correction) {
          (function() {
            if (this._correction.spawn) {
              return this._correction.despawn();
            } else if ((this._correction[0] && this._correction[0].spawn)) {
              return this._correction.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._correction = null;
        }
      }).call(this);
      this.posSource = null;
      this.physSource = null;
      this.pos.despawn();
      this.pos = null;
      return this.vel = null;
    
   },
  get id(  ){ 
    
      return this.posSource.id;
    
   }
 });
var GrouperSystem = ParentSystem.define("GrouperSystem", { 
  dataTypes:[ Vector2DArray, PhysicsArray, GroupIdArray, BarycenterArray ],
  async update( { 
  bounds:[ minX, minY, maxX, maxY ]
 },[ positions, phys, groupIds, barycenters ] ){ 
  
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
    const particle=Particle.spawn(pos, object);;
    particles.push(particle);
    quads.insert(particle)
    }
    ;
    const visited=(new Set());
    const groups=[];
    var currentGroup = ParticleGroup.spawn();
    for (var particle of particles)
    {
    const elements=quads.retrieve(particle);;
    for (var neighbor of elements)
    {
    if( particle.id === neighbor.id ){ 
      continue
     };
    if( visited.has(neighbor.id) ){ 
      continue
     };
    if( currentGroup.members.length >= config.groupSize ){ 
      groups.push(currentGroup);
      currentGroup = ParticleGroup.spawn();;
      break
     };
    visited.add(neighbor.id);
    currentGroup.members.push(neighbor);
    neighbor.group = currentGroup;
    }
    
    }
    ;
    groups.push(currentGroup);
    var i = 0;
    for (var group of groups)
    {
    group.gid = i;;
    ++(i);
    for (var member of group.members)
    {
    const groupId=groupIds.data[member.id];;
    groupId.groupId = group.gid;
    }
    ;
    const barycenter=barycenters.data[group.gid];;
    barycenter.mass = group.mass;;
    barycenter.x = group.center.x;
    barycenter.y = group.center.y;
    }
    ;
    for (var particle of particles)
    {
    particle.despawn()
    }
    ;
    for (var group of groups)
    {
    group.despawn()
    }
    ;
    quads.clear();
    return null;
  
 }
 });
GrouperSystem.start();