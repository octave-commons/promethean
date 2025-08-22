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
const Javascript = { 
  symbol:Symbol("Javascript"),
  init( string = this.string ){ 
    
      this.string = string;
      return this;
    
   },
  makePretty(  ){ 
    
   },
  validate(  ){ 
    
   },
  eval( string = this.string ){ 
    
      "Evaluate as javascript the string contained with in this container";
      return Future.resolve(string).then((s) => {
      	
        console.log("string?", s);
        return s;
      
      }).then(vm.runInThisContext);
    
   },
  save( target = this.target ){ 
    
      return target.string = this.string;
    
   },
  saveFile( path = this.path ){ 
    
      return this.save(create(File)(path));
    
   },
  compile(  ){ 
    
   },
  load( source = this.source,js = source.js ){ 
    
      "return a module useing the string of this container as its source";
      return create(Module)(string);
    
   }
 };
exports.Javascript = Javascript;