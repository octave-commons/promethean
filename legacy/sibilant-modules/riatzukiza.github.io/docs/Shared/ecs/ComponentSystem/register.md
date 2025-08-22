# Shared.ecs.ComponentSystem.register

## arguments

no args

## description

Called by
`[[ComponentSystem]]`
sub classes by initializer function.
## Example Usage


```javascript
var NewComponent = Component.define("NewComponent", { 
  INeedSomthingFromMySystem( x ){ 
    
      return this.dependentProperty = (x + this.system.neededThing);
    
   }
 });
var NewSystem = ComponentSystem.define("NewSystem", { 
  register(  ){ 
    
      this.neededThing = [];
      return (function() {
        /* inc/loops.sibilant:26:8 */
      
        var $for = null;
        for (var i = 0;i < 10;++(i))
        {
        $for = (function() {
          /* inc/loops.sibilant:28:35 */
        
          return this.neededThing.push(Math.random());
        }).call(this);
        }
        ;
        return $for;
      }).call(this);
    
   }
 });


```
