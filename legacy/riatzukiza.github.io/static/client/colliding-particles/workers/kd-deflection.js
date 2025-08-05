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
  KdTree
 } from "../typed-arrays/kd-tree.js";
import { 
  Vector
 } from "/shared/vectors.js";
import { 
  Spawnable
 } from "/shared/data-structures/spawnable.js";
import { 
  config
 } from "../config.js";
const { 
  maxObjects,
  maxLevels
 }=config;
import { 
  ParentSystem
 } from "../system.js";
var ElasticParticle = Spawnable.define("ElasticParticle", { 
  init( posSource = this.posSource,velSource = this.velSource,physSource = this.physSource,deflectionSource = this.deflectionSource,correctionSource = this.correctionSource,_mass = physSource.mass,_scale = physSource.scale,deflection = Vector.spawn(0, 0),correction = Vector.spawn(0, 0),pos = Vector.spawn(posSource.x, posSource.y),vel = Vector.spawn(velSource.x, velSource.y) ){ 
    
      this.posSource = posSource;this.velSource = velSource;this.physSource = physSource;this.deflectionSource = deflectionSource;this.correctionSource = correctionSource;this._mass = _mass;this._scale = _scale;this.deflection = deflection;this.correction = correction;this.pos = pos;this.vel = vel;
      return this;
    
   },
  get x(  ){ 
    
      return this.posSource.x;
    
   },
  get y(  ){ 
    
      return this.posSource.y;
    
   },
  get height(  ){ 
    
      return this.scale;
    
   },
  get width(  ){ 
    
      return this.scale;
    
   },
  get mass(  ){ 
    
      return this._mass;
    
   },
  get scale(  ){ 
    
      return this._scale;
    
   },
  set mass( v ){ 
    
      return this._mass = v;
    
   },
  set scale( v ){ 
    
      return this._scale = v;
    
   },
  clear(  ){ 
    
      this.posSource = null;
      this.pos.despawn();
      this.vel.despawn();
      this.deflection.impacts = null;
      this.deflection.despawn();
      this.correction.despawn();
      this.pos = null;
      this.deflection = null;
      this.correction = null;
      this.physSource = null;
      return this.vel = null;
    
   },
  get id(  ){ 
    
      return this.posSource.id;
    
   }
 });
var ElasticDeflectionSystem = ParentSystem.define("ElasticDeflectionSystem", { 
  dataTypes:[ Vector2DArray, Vector2DArray, PhysicsArray, KdTree, Vector2DArray, Vector2DArray ],
  async update( { 
  bounds:[ minX, minY, maxX, maxY ],
  collisionGroupId
 },[ positions, velocities, phys, kdTree, deflections, corrections ] ){ 
  
    const particles=[];
    const initialIndex=(config.collisionGroupSize * collisionGroupId);
    const lastIndex=((config.collisionGroupSize * (collisionGroupId + 1)) - 1);
    const collisionGroupParticles=[];
    for (var pos of positions.data)
    {
    const vel=velocities.data[pos.id];;
    const object=phys.data[pos.id];;
    const correction=corrections.data[pos.id];;
    const deflection=deflections.data[pos.id];;
    const particle=ElasticParticle.spawn(pos, vel, object, deflection, correction);;
    particles.push(particle);
    if( (particle.id >= initialIndex && particle.id <= lastIndex) ){ 
      collisionGroupParticles.push(particle)
     }
    }
    ;
    var collisionsCount = 0;
    for (var target of collisionGroupParticles)
    {
    const queryResults=kdTree.query(target.x, target.y, (4 * target.scale));;
    const elements=queryResults.map(((el) => {
    	return particles[el.pid];
    })).sort(((a, b) => {
    	const d1=a.pos.distanceTo(target.pos);
    const d2=b.pos.distanceTo(target.pos);
    const l1=Math.abs(d1.getLength());
    const l2=Math.abs(d2.getLength());
    d1.despawn();
    d2.despawn();
    return (l1 - l2);
    }));;
    for (var affector of elements)
    {
    if( target.id === affector.id ){ 
      continue
     };
    const dist=affector.pos.distanceTo(target.pos);;
    const diff=dist.getLength();;
    const usedDistance=Math.abs(diff);;
    const threshold=(0.01 * (affector.scale + target.scale));;
    if( threshold > usedDistance ){ 
      const totalMass=(affector.mass + target.mass);;
      target.correction.subFrom(target.vel);
      dist.setLength((threshold - usedDistance));
      target.correction.subFrom(dist);
      if( target.scale > affector.scale ){ 
        const massDiff=(target.scale - affector.scale);;
        const massGainFactor=(massDiff / totalMass);;
        const massGain=(target.mass * massGainFactor);;
        const mass=(target.mass + massGain);;
        target.mass = mass;;
        target.scale = Math.cbrt(mass);
       };
      if( target.scale < affector.scale ){ 
        if( config.actualMinMass > target.mass ){ 
          const massDiff=(affector.scale - target.scale);;
          const massLossFactor=(massDiff / totalMass);;
          const massLoss=(target.mass * massLossFactor);;
          const mass=(target.mass - massLoss);;
          target.mass = mass;;
          target.scale = Math.cbrt(mass);
         }
       };
      if( !(target.deflection.impacts) ){ 
        target.deflection.impacts = 0;
       };
      ((target.deflection.impacts)++);
      const vector1=Vector.spawn(target.vel.x, target.vel.y);;
      const vector2=Vector.spawn(affector.vel.x, affector.vel.y);;
      const theta=Math.atan2((vector1.y - vector2.y), (vector1.x - vector2.x));;
      const v1=vector1.rotateTo((1 * theta));;
      const v2=vector2.rotateTo((1 * theta));;
      const m=target.mass;;
      const m_=affector.mass;;
      const u1=Vector.spawn((((v1.x * (m - m_)) / (m + m_)) + (v2.x * 2 * (m_ / (m + m_)))), v1.y).rotateTo((-1 * theta));;
      target.deflection.addTo(u1);
      u1.despawn();
      v1.despawn();
      v2.despawn()
     };
    dist.despawn()
    }
    
    }
    ;
    for (var particle of collisionGroupParticles)
    {
    if( particle.deflection.impacts ){ 
      particle.deflection.divTo(particle.deflection.impacts);
      particle.correction.divTo(particle.deflection.impacts)
     };
    particle.correctionSource.x = particle.correction.x;
    particle.correctionSource.y = particle.correction.y;;
    particle.deflectionSource.x = particle.deflection.x;
    particle.deflectionSource.y = particle.deflection.y;;
    particle.physSource.mass = particle.mass;
    particle.physSource.scale = particle.scale;
    }
    ;
    for (var particle of particles)
    {
    particle.despawn()
    }
    ;
    return null;
  
 }
 });
ElasticDeflectionSystem.start();