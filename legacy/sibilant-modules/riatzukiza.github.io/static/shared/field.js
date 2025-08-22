var R = require("ramda");
var { 
  create,
  extend,
  mixin,
  conditional,
  cond,
  partiallyApplyAfter
 } = require("@kit-js/core/js/util");
var { 
  Vector,
  TrailVector
 } = require("@shared/vectors.js");
var noise = require("@shared/noise.js");
const waitingDecay=(new Set());
module.exports.createParticleUpdater = (function module$exports$createParticleUpdater$(config = this.config, game = this.game) {
  /* module.exports.create-particle-updater node_modules/kit/inc/core/function-expressions.sibilant:29:8 */

  var particleUpdater = (function particleUpdater$(vel = this.vel, p = this.p, field = this.field, pheremones = this.pheremones, tick = this.tick, decay = false, win = false, homePos = this.homePos, loose = (vel?.trail?.length || 0) >= config.maxTrail) {
    /* particle-updater node_modules/kit/inc/core/function-expressions.sibilant:29:8 */
  
    const pos=Vector.spawn((Math.min(Math.max(Math.round((p.x / config.size)), 0), (config.columns - 1)) || 1), (Math.min(Math.max(Math.round((p.y / config.size)), 0), (config.rows - 1)) || 1));
    const angle=(noise.simplex3((pos.x / config.angleZoom / 5), (pos.y / config.angleZoom / 5), (tick * (config.noiseZ / 10000))) * Math.PI * 2);
    const length=((noise.simplex3(((pos.x / 50) + 40000), ((pos.x / 50) + 40000), (tick * (config.noiseZ / 10000))) * config.fieldForce) / 20);
    const pH=pheremones[pos.x][pos.y];
    field[pos.x][pos.y].setLength(length);
    field[pos.x][pos.y].setAngle(angle);
    const vec=field[pos.x][pos.y];
    if( !(pH.lastCheck) ){ 
      pH.lastCheck = tick;;
      waitingDecay.add(pH)
     };
    if( ((decay || (config.limitDecay && waitingDecay.size > config.maxInDecay)) && pH.lastCheck < tick) ){ 
      for (var cell of waitingDecay)
      {
      cell.divTo((config.decay * (1 + (tick - cell.lastCheck))), 2);
      cell.lastCheck = tick;;
      waitingDecay.delete(cell)
      }
      
     };
    if( config.stepWiseUpdate ){ 
      pH.addTo(vec)
     };
    if( config.trackTrail ){ 
      if( !(vel.trail) ){ 
        vel.winCount = 0;
        vel.looseCount = 0;
        vel.trail = [ TrailVector.spawn(vel.xd, vel.yd, pH) ];
       }else { 
        vel.trail.push(TrailVector.spawn(vel.xd, vel.yd, pH))
       }
     };
    if( (loose && config.punishLoosers) ){ 
      const weight=(vel.looseCount / (vel.winCount + 1));;
      for (var { 
        x,
        y,
        pheremones
       } of vel.trail)
      {
      pheremones.subFrom({ 
        x:(x * weight * config.antInfluence),
        y:(y * weight * config.antInfluence)
       })
      }
      
     };
    if( loose ){ 
      for (var seg of vel.trail)
      {
      seg.despawn()
      }
      ;
      vel.trail = [];;
      p.x = (((Math.random() * config.spawnStatic) * (function() {
        if (Math.random() < 0.5) {
          return -1;
        } else {
          return 1;
        }
      }).call(this)) + homePos.x);
      p.y = (((Math.random() * config.spawnStatic) * (function() {
        if (Math.random() < 0.5) {
          return -1;
        } else {
          return 1;
        }
      }).call(this)) + homePos.y);;
      vel.looseCount += 1
     };
    if( (win && config.rewardWinners) ){ 
      const weight=(vel.looseCount / (vel.winCount + 1));;
      for (var { 
        x,
        y,
        pheremones
       } of vel.trail)
      {
      pheremones.addTo({ 
        x:(x * weight * config.antInfluence),
        y:(y * weight * config.antInfluence)
       })
      }
      
     };
    if( win ){ 
      for (var seg of vel.trail)
      {
      seg.despawn()
      }
      ;
      vel.trail = [];;
      vel.trail = [];;
      p.x = (((Math.random() * config.spawnStatic) * (function() {
        if (Math.random() < 0.5) {
          return -1;
        } else {
          return 1;
        }
      }).call(this)) + homePos.x);
      p.y = (((Math.random() * config.spawnStatic) * (function() {
        if (Math.random() < 0.5) {
          return -1;
        } else {
          return 1;
        }
      }).call(this)) + homePos.y);;
      vel.winCount += 1
     };
    if( pH.getLength() > config.maxLength ){ 
      pH.setLength(config.maxLength)
     };
    vel.accelerate([ pH.x, pH.y ]);
    pH.addTo({ 
      x:(vel.xd * config.antInfluence),
      y:(vel.yd * config.antInfluence)
     });
    return pos.despawn();
  });
  return particleUpdater;
});
module.exports.createVectorField = (function module$exports$createVectorField$(columns, rows) {
  /* module.exports.create-vector-field eval.sibilant:171:0 */

  const field=(new Array(columns));
  for (var x = 0;x < columns;++(x))
  {
  field[x] = (new Array(rows));;
  for (var y = 0;y < rows;++(y))
  {
  field[x][y] = Vector.spawn(0, 0);
  }
  
  }
  ;
  return field;
});