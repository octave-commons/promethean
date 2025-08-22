const noise = require("./noise")
const config = require("./config.js")
const Vector = require("./vector")
const waitingDecay = new Set()

const Tone = require("tone");
const {game} = require("./game")

const synth=(new Tone.Synth()).toDestination();
module.exports.updateParticle = function updateParticle(
    vel,
    p,
    field,
    pheremones,
    tick,
    decay=false,
    win=false,
    homePos,
    loose =  isNaN(vel.xd)|| isNaN(vel.yd) || (vel?.trail?.length >= config.maxTrail) //Math.max(vel.winCount +config.maxTrail -vel.looseCount))
) {
    const pos = new Vector(0,0)
    
    pos.x = Math.max(Math.min(Math.floor(p.x / config.size), config.columns-1),0);
    pos.y = Math.max(Math.min(Math.floor(p.y / config.size), config.rows-1),0);

    if(pos.x >= 0 && pos.x < config.columns && pos.y >= 0 && pos.y < config.rows) {

        let angle = noise.simplex3(pos.x/config.angleZoom/5, pos.y/config.angleZoom/5, tick *(config.noiseZ / 10000)) * Math.PI * 2;
        let length = noise.simplex3(pos.x/50 + 40000, pos.y/50 + 40000, tick * (config.noiseZ / 10000)) * config.fieldForce / 20;
        let pH = pheremones[pos.x][pos.y]
        field[pos.x][pos.y].setLength(length);
        field[pos.x][pos.y].setAngle(angle);

        let vec = field[pos.x][pos.y];

        if(!pH.lastCheck) {
            pH.lastCheck = tick
            waitingDecay.add(pH)
        }
        if(decay || (config.limitDecay && waitingDecay.size > config.maxInDecay)) {
            console.log("decaying")

            if(pH.lastCheck < tick) {
                for(let cell of waitingDecay) {
                    // console.log("decaying",pH,tick)
                    // cell.divTo(Math.pow (config.decay * (tick - cell.lastCheck ),2))
                    cell.divTo(config.decay * (tick - cell.lastCheck ),2)
                    // cell.subFrom({
                    //   x:cell.x * (Math.pow (config.decay * (tick - cell.lastCheck ),2)),
                    //   y:cell.y * (Math.pow (config.decay * (tick - cell.lastCheck ),2)),
                    // })
                    cell.lastCheck = tick
                    waitingDecay.delete(cell)
                }
            }
        }




        pH.addTo(vec)


        if(config.trackTrail) {
            if(!vel.trail ) {
                vel.winCount=0
                vel.looseCount=0
                vel.trail = [
                    {
                        x:vel.xd,
                        y:vel.yd,
                        pheremones:pH
                    }
                ]
            } else vel.trail.push({
                x:vel.xd,
                y:vel.yd,
                pheremones:pH
            })
        }
        if(loose && config.punishLoosers) {
            let weight = vel.looseCount/(vel.winCount+1)
            for(let {x,y,pheremones} of vel.trail) {
                pheremones.subFrom({
                    x:x*weight*config.antInfluence,
                    y:y*weight*config.antInfluence,
                })
            }
        }
        if(loose ) {

            // console.log("loose",vel)
            game.events.emit("loose")
            vel.xd = 0
            vel.yd = 0

            p.x =homePos.x
            p.y =homePos.y

            vel.looseCount++
            vel.trail = []

        }
        if(win && config.rewardWinners) {
            console.log("win",vel)
            let weight = vel.winCount/(vel.looseCount + 1)
            for(let {x,y,pheremones} of vel.trail) {
                pheremones.addTo({
                    x:x*weight*config.antInfluence,
                    y:y*weight*config.antInfluence,
                })
            }

            vel.trail = []
            vel.winCount++
        }
        if(win) {
            vel.xd = 0
            vel.yd = 0
        }
        if(pH.getLength() > config.maxLength) pH.setLength(config.maxLength)
        // vel.xd = pH.x
        // vel.xy = pH.y

        //vel.accelerate([Math.min(pH.x,config.maxSpeed),Math.min()]);
        vel.accelerate([pH.x,pH.y]);
        pH.addTo({
            x:vel.xd*config.antInfluence,
            y:vel.yd*config.antInfluence,
        })
        // console.log({tick,vec,vel})

    } else {
        console.log("STUCK",pos.x,pos.y,p.x,p.y,config.rows, config.columns)
    }
}

module.exports.createVectorField = function createVectorField(columns,rows) {
    let field = new Array(columns);
    for(let x = 0; x < columns; x++) {
        field[x] = new Array(columns);
        for(let y = 0; y < rows; y++) {
            field[x][y] = new Vector(0, 0);
        }
    }
    return field
}
