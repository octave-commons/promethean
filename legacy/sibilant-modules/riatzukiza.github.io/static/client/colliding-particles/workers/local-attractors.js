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
  Vector
 } from "/shared/vectors.js";
import { 
  Spawnable
 } from "/shared/data-structures/spawnable.js";
import { 
  PhysicsArray
 } from "../typed-arrays/physics-array.js";
import { 
  GroupIdArray
 } from "../typed-arrays/group-id-array.js";
import { 
  Vector2DArray
 } from "../typed-arrays/vector-2d.js";
import { 
  config
 } from "../config.js";
const { 
  gravitationalConstant
 }=config;
var calculateGravitationalIntensity = (function calculateGravitationalIntensity$(target, affector) {
  /* calculate-gravitational-intensity eval.sibilant:14:0 */

  const dist=affector.pos.distanceTo(target.pos);
  const usedDistance=Math.abs(dist.getLength());
  const mag=Math.sqrt(((dist.x * dist.x) + (dist.y * dist.y)));
  dist.setLength(Math.abs(((gravitationalConstant * affector.mass * usedDistance) / Math.pow(mag, 2))));
  return dist;
});
var ParticleGroup = Spawnable.define("ParticleGroup", { 
  init( id = this.id,groups = this.groups,members = (this.members || []) ){ 
    
      this.id = id;this.groups = groups;this.members = members;
      groups[id] = this;
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
      this.groups[this.id] = null;
      return this.members.length = 0;
    
   }
 });
var LocalParticle = Spawnable.define("LocalParticle", { 
  init( posSource = this.posSource,physSource = this.physSource,groupIdSource = this.groupIdSource,nearGravitySource = this.nearGravitySource,mass = physSource.mass,scale = physSource.scale,groupId = groupIdSource.groupId,height = scale,width = scale,pos = Vector.spawn(posSource.x, posSource.y),vel = Vector.spawn(0, 0) ){ 
    
      this.posSource = posSource;this.physSource = physSource;this.groupIdSource = groupIdSource;this.nearGravitySource = nearGravitySource;this.mass = mass;this.scale = scale;this.groupId = groupId;this.height = height;this.width = width;this.pos = pos;this.vel = vel;
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
var LocalAttractorSystem = ParentSystem.define("LocalAttractorSystem", { 
  dataTypes:[ Vector2DArray, PhysicsArray, GroupIdArray, Vector2DArray ],
  async update( args,[ position, phys, groupId ] ){ 
  
    const groups=[];
    const particles=[];
    for (var pos of positions.data)
    {
    const particle=LocalParticle.spawn(pos, phys.data[pos.id], groupId.data[pos.id], nearGravity.data[pos.id]);;
    const group=(function() {
      if (!(groups[particle.groupId])) {
        return ParticleGroup.spawn(particle.groupId, groups);
      } else {
        return groups[particle.groupId];
      }
    }).call(this);;
    particles.push(particle);
    group.members.push(particle)
    }
    ;
    for (var group of groups)
    {
    for (var target of group.members)
    {
    for (var affector of group.members)
    {
    if( target.id === affector.id ){ 
      continue
     };
    const intensity=calculateGravitationalIntensity(target, affector);;
    target.vel.addTo(intensity);
    intensity.despawn()
    }
    
    }
    
    }
    ;
    for (var particle of particles)
    {
    particle.nearGravitySource.x = particle.vel.x;
    particle.nearGravitySource.y = particle.vel.y;;
    particle.despawn()
    }
    ;
    for (var group of groups)
    {
    group.despawn()
    }
    ;
    return null;
  
 }
 });
LocalAttractorSystem.start();