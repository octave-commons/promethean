var Matrix = {  };
mixin({ 
  init( width = this.width,height = this.height,array = [] ){ 
    
      this.width = width;this.height = height;this.array = array;
      return this;
    
   }
 }, Matrix);
Matrix.size = (function Matrix$size$(height = this.height, width = this.width) {
  /* Matrix.size inc/core/function-expressions.sibilant:32:8 */

  return (width * height);
});
Matrix.getIndex = (function Matrix$getIndex$([ i, j ] = [ 0, 0 ], width = this.width) {
  /* Matrix.get-index inc/core/function-expressions.sibilant:32:8 */

  "generate an index for an element in a 1d array from 2d coordinates.";
  return ((i * width) + j);
});
Matrix.get = (function Matrix$get$(x = this.x, y = this.y, width = this.width, height = this.height, array = this.array, getIndex = this.getIndex) {
  /* Matrix.get inc/core/function-expressions.sibilant:32:8 */

  "retrieve an element of a matrix by its x and y coordinates ";
  x = ((x + width) % width);
  y = ((y + height) % height);
  return array[getIndex([ x, y ], width)];
});
Matrix.set = (function Matrix$set$(x = this.x, y = this.y, value = this.value, width = this.width, height = this.height, array = this.array, getIndex = this.getIndex) {
  /* Matrix.set inc/core/function-expressions.sibilant:32:8 */

  "change the value of an array using 2d coordinates.";
  x = ((x + width) % width);
  y = ((y + height) % height);
  return array[getIndex([ x, y ], width)] = value;
});
Matrix.addToCell = (function Matrix$addToCell$(x = this.x, y = this.y, value = this.value, height = this.height, width = this.width, array = this.array) {
  /* Matrix.add-to-cell inc/core/function-expressions.sibilant:32:8 */

  "add a number to a value found with 2d coordinates";
  var i = this.getIndex([ x, y ]);
  return array[i] = (array[i] + value);
});
Matrix.add = (function Matrix$add$() {
  /* Matrix.add inc/core/function-expressions.sibilant:32:8 */

  
});
Matrix.scalarMultiply = (function Matrix$scalarMultiply$(scalar = this.scalar, m = this) {
  /* Matrix.scalar-multiply inc/core/function-expressions.sibilant:32:8 */

  return m.map((v) => {
  	
    return (v * scalar);
  
  });
});
Matrix.mult = (function Matrix$mult$(value = this.value, m = this) {
  /* Matrix.mult inc/core/function-expressions.sibilant:32:8 */

  return (function() {
    if (typeof value === "number") {
      return m.scalarMultiply(value);
    } else {
      return m.dotProduct(value);
    }
  }).call(this);
});
Matrix.transit = (function Matrix$transit$(target = this.target, f = this.f, matrix = this, height = this.height, width = this.width) {
  /* Matrix.transit inc/core/function-expressions.sibilant:32:8 */

  "Mapping operator. Performs a map over every element in a matrix, inserting the\n"+"map's results into a target matrix of the same dimensions as the originating matrix ";
  return matrix.map(f, matrix, height, width, target);
});
Matrix.dotProduct = (function Matrix$dotProduct$(B = this.B, A = this) {
  /* Matrix.dot-product inc/core/function-expressions.sibilant:32:8 */

  "Standard matrix multiplication, two matricies can only be multiplied\n"+"if the height of the second is equal to the width of the first.";
  return (function() {
    if (A.width === B.height) {
      return (function(m) {
        /* inc/macros.sibilant:165:9 */
      
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
      })(matrix(A.height, B.width));
    }
  }).call(this);
});
Matrix.each = (function Matrix$each$(f = this.f, width = this.width, height = this.height) {
  /* Matrix.each inc/core/function-expressions.sibilant:32:8 */

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
});
Matrix.map = (function Matrix$map$(f = this.f, m = this, width = this.width, height = this.height, result = create(this)(width, height)) {
  /* Matrix.map inc/core/function-expressions.sibilant:32:8 */

  "standard itterative operator, takes a produces a new Matrix from the successive\n"+"application of that function to every element of the input matrix";
  return (function(r) {
    /* inc/macros.sibilant:165:9 */
  
    m.each((v, x, y, m) => {
    	
      return r.set(x, y, (f(v, x, y, m) || 0));
    
    });
    return r;
  })(result);
});
Matrix.dmap = (function Matrix$dmap$(f = this.f, m = this, width = this.width, height = this.height) {
  /* Matrix.dmap inc/core/function-expressions.sibilant:32:8 */

  "short for destructive map, dmap takes a function and applies it to every\n"+"element of the matrix, swapping out the value of the functions return with its input. ";
  return m.map(f, m, width, height, m);
});
var matrix = create(Matrix);
exports.Matrix = Matrix;
exports.matrix = matrix;
// var assert = require("assert");// (function(m) {
//   /* inc/macros.sibilant:165:9 */
// 
//   return (function(x2Y2) {
//     /* inc/macros.sibilant:165:9 */
//   
//     assert.strictEqual(x2Y2, 3, ("it does not get!" + m.get(2, 2)));
//     m.set(2, 2, 10);
//     assert(m.get(2, 2) === 10);
//     return console.log("it is setted good", m.get(2, 2));
//   })(m.get(2, 2));
// })(matrix(5, 5, [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5 ]));