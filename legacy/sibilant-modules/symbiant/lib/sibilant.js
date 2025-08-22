const { 
  create,
  extend,
  mixin
 } = require("./util");
const { 
  File
 } = require("./file-system");
const { 
  Future
 } = require("./async");
const { 
  Module
 } = require("./module");
const { 
  Javascript
 } = require("./javascript");
const sibilant = require("sibilant");
const Sibilant = { 
  symbol:Symbol("Sibilant"),
  init( string = this.string ){ 
    
      this.string = string;
      return this;
    
   },
  _transpile:sibilant,
  from( container = this.container ){ 
    
      "create a new sibilant container from a string wrapped in another container";
      return create(Sibilant)(container.string);
    
   },
  fromFile( path = this.path ){ 
    
      "create a new sibilant container from a newly created file container";
      console.log("loading from file", path);
      let file = create(File)(path);
      let sib = Sibilant.from(file);
      sib.file = file;
      return sib;
    
   },
  load( here = this.here,sib = this ){ 
    
      "create a module from the transpilation of the string contained with in this container";
      return create(Module)(sib.transpile(), here).load();
    
   },
  transpile( string = this.string,_transpile = this._transpile ){ 
    
      "create a new javascript container from the transpilation\n" +
      "of the string contained with in this sibilant container";
      return create(Javascript)(Future.resolve(string).then(_transpile).then((s) => {
      	
        return s.js;
      
      }));
    
   }
 };
exports.Sibilant = Sibilant;