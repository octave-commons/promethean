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
import { 
  Interface
 } from "/shared/kit/interface/index.js";
import { 
  Database
 } from "/shared/database.js";
const dbs=(new Map());
var getDatabase = (function getDatabase$(name) {
  /* get-database eval.sibilant:8:0 */

  return (function() {
    if (dbs.has(name)) {
      return dbs.get(name);
    } else {
      var r = (function() {
        /* inc/misc.sibilant:1:1399 */
      
        return create(Database)(name);
      }).call(this);
      dbs.set(name, r);
      return r;
    }
  }).call(this);
});
var Saveable = Interface.define("Saveable", { 
  _nonSerializableKeys:[],
  get loadedInstances(  ){ 
    
      return (function() {
        if (this._loadedInstances) {
          return this._loadedInstances;
        } else {
          return this._loadedInstances = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return (new Map());
          }).call(this);
        }
      }).call(this);
    
   },
  get saveIndex(  ){ 
    
      return (function() {
        if (this._saveIndex) {
          return this._saveIndex;
        } else {
          return this._saveIndex = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return (function() {
              if (this.currentSaveIndex) {
                return ++(this.currentSaveIndex);
              } else {
                return this.currentSaveIndex = 0;
              }
            }).call(this);
          }).call(this);
        }
      }).call(this);
    
   },
  _filterSerializable( key,value ){ 
    
      return !(this._nonSerializableKeys.includes(key));
    
   },
  _injestionTarget(  ){ 
    
      return Object.create(this);
    
   },
  injestProperty( data = this.data ){ 
    
      return (function() {
        if (data.saveIndex) {
          const instance=_types[data.collectionName].load(saveName, data.saveIndex, database);
          (function() {
            if (instance.register) {
              return instance.register();
            }
          }).call(this);
          return instance;
        } else if (data.interfaceReference) {
          return _types[data.interfaceReference];
        } else if (Array.isArray(data)) {
          return data.map(((value) => {
          	return Saveable.injestProperty(value, saveName, database);
          }));
        } else if ((data instanceof Set)) {
          const set=(new Map());
          for (var value of data)
          {
          set.add(Saveable.injestProperty(value, data))
          }
          ;
          return map;
        } else if ((data instanceof Map)) {
          const map=(new Map());
          for (var [ key, value ] of data)
          {
          map.set(key, Saveable.injestProperty(value, data))
          }
          ;
          return map;
        } else {
          return data;
        }
      }).call(this);
    
   },
  injest( serializedObject = this.serializedObject,saveName = this.saveName,database = create(Database)(saveName),r = this._injestionTarget(),_types = this._types ){ 
    
      Object.keys(serializedObject).each(((key) => {
      	const data=serializedObject[key];
      return r[key] = Saveable.injestProperty(data);
      }));
      return r;
    
   },
  getSerializableProperties(  ){ 
    
      return Object.entries(Object.getOwnPropertyDescriptors(this)).filter((([ key, describer ]) => {
      	return (describer.hasOwnProperty("value") && typeof describer.value !== "function" && this._filterSerializable(key, describer.value));
      }));
    
   },
  getSaveableMembers(  ){ 
    
      `
      shared/saveable.md

      # shared.saveable

      ## arguments

      no args

      ## description

      get all property entries which implement the saveable interface.`

      ;
      return this.getSerializableProperties().filter((([ key, describer ]) => {
      	return ((Object.hasOwn(describer.value, "save") && Object.hasOwn(describer.value, "load")) || (Array.isArray(describer.value) && some(describer.value, value(), value.save)) || ((describer.value instanceof Map) && some(Array.from(describer.value.values()), value(), value.save)));
      })).map((([ key, describer ]) => {
      	return (function() {
        if ((describer.value instanceof Map)) {
          return Array.from(describer.value.values()).filter(((value) => {
          	return value.save;
          }));
        } else if (Array.isArray()) {
          return describer.value.filter(((value) => {
          	return value.save;
          }));
        } else {
          return describer.value;
        }
      }).call(this);
      })).flat();
    
   },
  serialize(  ){ 
    
      const serializedObject={ 
        typeName:this.name,
        saveId:this.saveId
       };
      return this.getSerializableProperties().reduce(((result, [ key, describer ]) => {
      	result[key] = (function() {
        if (describer.value.save) {
          return { 
            collectionName:describer.value.name,
            saveIndex:describer.value.saveIndex
           };
        } else if (describer.value.symbol) {
          return { 
            interfaceReference:describer.value.name
           };
        } else if ((describer.value instanceof Map)) {
          const map=(new Map());
          for (var [ key, value ] of describer.value)
          {
          map.set(key, (function() {
            if (value.serialize) {
              return value.serialize();
            } else {
              return value;
            }
          }).call(this))
          }
          ;
          return map;
        } else if (typeof describer.value !== "object") {
          return result[key] = describer.value;
        }
      }).call(this);
      return result;
      }), serializedObject);
    
   },
  save( saveName = this.saveName,database = create(Database)(saveName) ){ 
    
      database.put(this.name, this.serialize());
      return this.getSaveableMembers().each(((key, describer) => {
      	return describer.value.save(saveName, database);
      }));
    
   },
   async loadAll(  ){ 
  
    const r=[];
    for (var p of this.db.getCursor(this.name))
    {
    const obj=await p;;
    cache(this.loadedInstances, saveIndex, this.injest(obj))
    }
    ;
    return r;
  
 },
  load( saveName = this.saveName,saveIndex = 0,database = create(Database)(saveName) ){ 
    
      return cache(this.loadedInstances, saveIndex, database.get([ this.name, saveIndex ]).then(((data) => {
      	return this.injest(data, saveName, saveIndex, database);
      })));
    
   },
   async delete(  ){ 
  
 }
 });
export { 
  Saveable
 };