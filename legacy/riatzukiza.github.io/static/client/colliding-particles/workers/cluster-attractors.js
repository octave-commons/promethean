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
  Vector
 } from "/shared/vectors.js";
import { 
  Spawnable
 } from "/shared/data-structures/spawnable.js";
import { 
  PhysicsArray
 } from "../typed-arrays/physics-array.js";
import { 
  BarycenterArray
 } from "../typed-arrays/barycenter-array.js";
import { 
  GroupIdArray
 } from "../typed-arrays/group-id-array.js";
import { 
  ParentSystem
 } from "../system.js";
import { 
  config
 } from "../config.js";
const { 
  gravitationalConstant,
  minDist
 }=config;
var ParticleGroup = Spawnable.define("ParticleGroup", { 
  init( barycenter = this.barycenter,groups = this.groups,members = (this.members || []) ){ 
    
      this.barycenter = barycenter;this.groups = groups;this.members = members;
      groups[barycenter.id] = this;
      return this;
    
   },
  get id(  ){ 
    
      return this.barycenter.id;
    
   },
  get center(  ){ 
    
      return (function() {
        if (this._center) {
          return this._center;
        } else {
          return this._center = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return Vector.spawn(this.barycenter.x, this.barycenter.y);
          }).call(this);
        }
      }).call(this);
    
   },
  get mass(  ){ 
    
      return this.barycenter.mass;
    
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
var DistantParticle = Spawnable.define("DistantParticle", { 
  init( posSource = this.posSource,physSource = this.physSource,groupIdSource = this.groupIdSource,farGravitySource = this.farGravitySource,mass = physSource.mass,scale = physSource.scale,groupId = groupIdSource.groupId,height = scale,width = scale,pos = Vector.spawn(posSource.x, posSource.y),vel = Vector.spawn(0, 0) ){ 
    
      this.posSource = posSource;this.physSource = physSource;this.groupIdSource = groupIdSource;this.farGravitySource = farGravitySource;this.mass = mass;this.scale = scale;this.groupId = groupId;this.height = height;this.width = width;this.pos = pos;this.vel = vel;
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
      this.group = null;
      this.pos = null;
      this.vel = null;
      this.width = null;
      return this.height = null;
    
   },
  get id(  ){ 
    
      return this.posSource.id;
    
   }
 });
var ClusterAttractorSystem = ParentSystem.define("ClusterAttractorSystem", { 
  dataTypes:[ Vector2DArray, PhysicsArray, GroupIdArray, BarycenterArray, Vector2DArray ],
  async update( args,[ positions, phys, groupId, barycenters, farGravity ] ){ 
  
    const groups=[];
    const particles=[];
    for (var pos of positions.data)
    {
    const particle=DistantParticle.spawn(pos, phys.data[pos.id], groupId.data[pos.id], farGravity.data[pos.id]);;
    const group=(function() {
      if (!(groups[particle.groupId])) {
        return ParticleGroup.spawn(barycenters.data[particle.groupId], groups);
      } else {
        return groups[particle.groupId];
      }
    }).call(this);;
    particle.group = group;;
    particles.push(particle);
    group.members.push(particle)
    }
    ;
    for (var target of particles)
    {
    for (var affectorGroup of groups)
    {
    if( !(affectorGroup) ){ 
      continue
     };
    if( target.groupId === affectorGroup.id ){ 
      continue
     };
    const dist=affectorGroup.center.distanceTo(target.pos);;
    const usedDistance=Math.abs(dist.getLength());;
    if( usedDistance < Math.pow((2 * target.scale), 2) ){ 
      dist.x = 0;
      dist.y = 0;;
      dist.despawn();
      continue
     };
    const mag=Math.sqrt(((dist.x * dist.x) + (dist.y * dist.y)));;
    const intensity=Math.abs(((-1 * gravitationalConstant * affectorGroup.mass * target.mass * usedDistance) / Math.pow(mag, 2)));;
    dist.setLength(intensity);
    target.vel.addTo(dist);
    dist.despawn()
    }
    
    }
    ;
    for (var particle of particles)
    {
    particle.farGravitySource.x = particle.vel.x;
    particle.farGravitySource.y = particle.vel.y;;
    particle.despawn()
    }
    ;
    for (var group of groups)
    {
    if( group ){ 
      group.despawn()
     }
    }
    ;
    return null;
  
 }
 });
ClusterAttractorSystem.start();