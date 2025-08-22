"use strict";

function logSuccess(a,x) {
    console.log("///////////////////////////////////////////////////////////////////");
    console.log("success:",a||"");
    console.log("///////////////////////////////////////////////////////////////////");
    console.log("Success Value:",x);
    console.log("///////////////////////////////////////////////////////////////////");
    return x;
};
function logFail(b,err) {
    if(!err.hasLogged) {
        console.log("///////////////////////////////////////////////////////////////////");
        console.log("fail:",b||"");
        console.log("///////////////////////////////////////////////////////////////////");
        console.log("fail error",err.stack);
        console.log("///////////////////////////////////////////////////////////////////");
        err.hasLogged = true;
    }
    throw err;
};
class Mask  {
    constructor(p) {
        this.p = Promise.resolve(p);
    }
    then(f,g) {
        return new Mask(this.p.then(f,g));
    }
    catch(g) {
        return new Mask(this.p.catch(g));
    }
    log(a,b) {
        return this.then(curry(logSuccess)(a),curry(logFail)(b));
    }
    finallyLog(a,b) {
        return this.then(function(x) {
            console.log("///////////////////////////////////////////////////////////////////");
            console.log("final:success:",a)
            console.log("///////////////////////////////////////////////////////////////////");
            console.log("final:value:",x);
            console.log("///////////////////////////////////////////////////////////////////");
        },function(err) {
            console.log("///////////////////////////////////////////////////////////////////");
            console.log("final:failiure:",b)
            console.log("///////////////////////////////////////////////////////////////////");
            console.log("final:error",err);
            console.log("///////////////////////////////////////////////////////////////////");
        })
    }
    call(target) {
        return this.then((f) => f.call(target,...[...arguments].slice(1)));
    }
    apply(target,args) {
        return this.then((f) => f.apply(target,args));
    }
    get(key) {
        return this.then((o) => o[key]);
    }
    spread(f) {
        return this.then(function(x) {
            return f.call(null,...x);
        });
    }
    set(key,value) {
        return this.then((o) => o[key] = value);
    }
    callMethod(key) {
        return this.then((o) => o[key](...[...arguments].slice(1)));
    }
    applyMethod(key,args) {
        return this.then((o) => o[key](...args));
    }
    expect(f,message) {
        return this.then((x) => {
            console.log("expecting",message);
            return cond(f,(x) =>{
                console.log("got",message);
                return x
            },(x) => {
                throw new TypeError("expected "+message)
            });
        })
                    
    }
    static create(p) {
        return new Mask(p);
    }
}
function createMaskedPromise(f) {
    return new Mask(new Promise(f));
};
function resolve(v) {
    return new Mask(Promise.resolve(v));
};
function then(f,g) {
    return resolve().then(f,g);
}
module.exports = {
    then:then,
    Mask:Mask,
    mask:Mask.create,
    resolve:resolve,
    create:createMaskedPromise,
};
