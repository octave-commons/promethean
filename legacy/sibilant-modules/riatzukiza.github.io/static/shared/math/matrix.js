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
 } from "../kit/interface/index.js";
var Matrix = Interface.define("Matrix", { 
  init( width = this.width,height = this.height,array = [] ){ 
    
      this.width = width;this.height = height;this.array = array;
      return this;
    
   },
  size( height = this.height,width = this.width ){ 
    
      return (width * height);
    
   },
  getIndex( [ i, j ] = [ 0, 0 ],width = this.width ){ 
    
      "generate an index for an element in a 1d array from 2d coordinates.";
      return ((i * width) + j);
    
   },
  convolve( B = this.B,A = this,height = this.height,width = this.width ){ 
    
      "perform a kernel filter convolution of two matricies '";
      return (function(m) {
        /* inc/misc.sibilant:1:1508 */
      
        for (var x = 0;x < width;++(x))
        {
        for (var y = 0;y < height;++(y))
        {
        m = (m + (A.get(x, y) * B.get(x, y)));
        }
        
        }
        ;
        return m;
      }).call(this, 0);
    
   },
  get( x = this.x,y = this.y,width = this.width,height = this.height,array = this.array,getIndex = this.getIndex ){ 
    
      "retrieve an element of a matrix by its x and y coordinates ";
      x = ((x + width) % width);
      y = ((y + height) % height);
      return array[getIndex([ x, y ], width)];
    
   },
  set( x = this.x,y = this.y,value = this.value,width = this.width,height = this.height,array = this.array,getIndex = this.getIndex ){ 
    
      "change the value of an array using 2d coordinates.";
      x = ((x + width) % width);
      y = ((y + height) % height);
      return array[getIndex([ x, y ], width)] = value;
    
   },
  addToCell( x = this.x,y = this.y,value = this.value,height = this.height,width = this.width,array = this.array ){ 
    
      "add a number to a value found with 2d coordinates";
      var i = this.getIndex([ x, y ]);
      return array[i] = (array[i] + value);
    
   },
  add(  ){ 
    
   },
  scalarMultiply( scalar = this.scalar,m = this ){ 
    
      return m.map(((v) => {
      	return (v * scalar);
      }));
    
   },
  mult( value = this.value,m = this ){ 
    
      return (function() {
        if (typeof value === "number") {
          return m.scalarMultiply(value);
        } else {
          return m.dotProduct(value);
        }
      }).call(this);
    
   },
  transit( target = this.target,f = this.f,matrix = this,height = this.height,width = this.width ){ 
    
      "Mapping operator. Performs a map over every element in a matrix, inserting the\n"+"map's results into a target matrix of the same dimensions as the originating matrix ";
      return matrix.map(f, matrix, height, width, target);
    
   },
  dotProduct( B = this.B,A = this ){ 
    
      "Standard matrix multiplication, two matricies can only be multiplied\n"+"if the height of the second is equal to the width of the first.";
      return (function() {
        if (A.width === B.height) {
          return (function(m) {
            /* inc/misc.sibilant:1:1508 */
          
            for (var r = 0;r < A.width;++(r))
            {
            for (var c = 0;c < B.height;++(c))
            {
            m.set(r, c, 0);
            for (var i = 0;i < A.height;++(i))
            {
            m.addToCell(r, c, (A.get(r, i) * B.get(i, c)))
            }
            
            }
            
            }
            ;
            return m;
          }).call(this, matrix(A.height, B.width));
        }
      }).call(this);
    
   },
  each( f = this.f,width = this.width,height = this.height ){ 
    
      "standard itterative operator, accepts a function and applies it to every\n"+"element of the matrix";
      var r = this;
      for (var x = 0;x < width;++(x))
      {
      for (var y = 0;y < height;++(y))
      {
      f(r.get(x, y), x, y, r)
      }
      
      }
      ;
      return r;
    
   },
  map( f = this.f,m = this,width = this.width,height = this.height,result = create(Matrix)(width, height) ){ 
    
      "standard itterative operator, takes a produces a new Matrix from the successive\n"+"application of that function to every element of the input matrix";
      return (function(r) {
        /* inc/misc.sibilant:1:1508 */
      
        m.each(((v, x, y, m) => {
        	return r.set(x, y, (f(v, x, y, m) || 0));
        }));
        return r;
      }).call(this, result);
    
   },
  dmap( f = this.f,m = this,width = this.width,height = this.height ){ 
    
      "short for destructive map, dmap takes a function and applies it to every\n"+"element of the matrix, swapping out the value of the functions return with its input. ";
      return m.map(f, m, width, height, m);
    
   }
 });
var matrix = create(Matrix);
export { 
  Matrix
 };
export { 
  matrix
 };
// var assert = require("assert");// (function(m) {
//   /* inc/scope.sibilant:12:9 */
// 
//   return (function(x2Y2) {
//     /* inc/scope.sibilant:12:9 */
//   
//     assert.strictEqual(x2Y2, 3, ("it does not get!" + m.get(2, 2)));
//     m.set(2, 2, 10);
//     assert(m.get(2, 2) === 10);
//     return console.log("it is setted good", m.get(2, 2));
//   })(m.get(2, 2));
// })(matrix(5, 5, [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5 ]));