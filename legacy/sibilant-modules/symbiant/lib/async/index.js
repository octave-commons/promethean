const { 
  create,
  extend,
  mixin
 } = require("../util");
const NodePromise = Promise;
const Future = { 
  symbol:Symbol("Future"),
  init( promise,value = null ){ 
    
      this.promise = promise;
      return this.value = value;
    
   },
  get contents(  ){ 
    
      return this.promise;
    
   },
  resolve( value = this.value,type = this ){ 
    
      return create(type)(Promise.resolve(value));
    
   },
  then( onSuccess = this.onSuccess,onFail = this.onFail ){ 
    
      return this.promise.then((value) => {
      	
        this.value = value;
        return onSuccess(value);
      
      }, onFail);
    
   },
  lift( f ){ 
    
      return (...args) => {
      	
        return create(this)((new Promise((success, fail) => {
        	
          var resolve = success,
              reject = fail;
          return f(...args, (err, value) => {
          	
            return (function() {
              if (err) {
                return fail(err);
              } else {
                return success(value);
              }
            }).call(this);
          
          });
        
        })));
      
      };
    
   },
  catch( onFail = this.onFail ){ 
    
      return this.promise.catch(onFail);
    
   }
 };
exports.Future = Future;
const FutureCollection = extend(Future, { 
  symbol:Symbol("FutureCollection"),
  each( callback = this.callback,promise = this.promise ){ 
    
      return promise.then((collection) => {
      	
        return collection.each(callback);
      
      });
    
   },
  map( callback = this.callback,promise = this.promise,all = this.all ){ 
    
      return promise.then((collection) => {
      	
        return all(collection.map(callback));
      
      });
    
   },
  reduce( callback = this.callback,initialValue = this.initialValue,promise = this.promise ){ 
    
      "resolves a future for a collection, when all values of the collection";
      console.log("reducing");
      return FutureCollection.resolve(promise).then((collection) => {
      	
        return Promise.all([ initialValue, collection ]);
      
      }).then(([ initialValue, collection ]) => {
      	
        return collection.reduce(callback, initialValue);
      
      });
    
   },
  mapAll( callback = this.callback,collection = this.collection ){ 
    
      "map over the resolution of all members of a collection";
      return FutureCollection.all(collection.map(callback));
    
   },
  resolve( collection = this.collection,self = this ){ 
    
      "resolve a collection, and all of its members";
      return create(self)(Promise.resolve(collection).then(self.all));
    
   },
  reduceAll( callback = this.callback,init = this.init,collection = this.collection ){ 
    
      "given a collection, return a promise for its reduction.";
      return collection.reduce((promise, x, k) => {
      	
        // promise.then(partialEnd(callback));
        return promise.then((result) => {
        	
          return callback(result, x, k, collection);
        
        });
      
      }, Promise.resolve((init || null)));
    
   }
 });
exports.Collection = FutureCollection;
const { 
  List
 } = require("../collection/list");
console.log("List.bind", List.bind);
const FutureArray = extend(FutureCollection, { 
  symbol:Symbol("FutureArray"),
  bind( callback = this.callback,promise = this.promise ){ 
    
      return FutureArray.resolve(promise).then((collection) => {
      	
        console.log("collection", collection);
        return List.bind(callback, collection, []);
      
      });
    
   },
  mapAllSerial( callback = this.callback,collection = this.collection ){ 
    
      return FutureArray.reduceAll(collection, (result, element, key) => {
      	
        return Promise.resolve(callback(element, key, collection)).then((element) => {
        	
          result.push(element);
          return result;
        
        });
      
      }, []);
    
   },
  mapSerial( callback = this.callback,promise = this.promise ){ 
    
      return FutureArray.reduce((result, element, key) => {
      	
        return Promise.resolve(callback(element, key, collection)).then((element) => {
        	
          result.push(element);
          return result;
        
        });
      
      }, [], promise);
    
   },
  resolve( value = this.value ){ 
    
      return create(FutureArray)(Promise.resolve(value).then((a) => {
      	
        return Promise.all(a);
      
      }));
    
   },
  all( array = this.array ){ 
    
      return create(FutureArray)(Promise.all(array));
    
   }
 });
exports.Array = FutureArray;
const FutureObject = extend(FutureCollection, { 
  symbol:Symbol("FutureObject"),
  all( object ){ 
    
      return FutureArray.all(Object.keys(object).map((k) => {
      	
        return Promise.resolve(object[k]).then((value) => {
        	
          return [ k, value ];
        
        });
      
      })).then((pair) => {
      	
        let o = pair.reduce((result = {  }, [ k, v ]) => {
        	
          result[k] = v;
          return result;
        
        }, {  });
        return o;
      
      });
    
   }
 });
exports.Object = FutureObject;