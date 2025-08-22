var Kernel = extend(Matrix, { 
  symbol:Symbol("Kernel")
 });
var kernel = create(Kernel);
mixin({ 
  init( width = this.width,height = this.height,_kernel = (function(r) {
    /* inc/macros.sibilant:165:9 */
  
    for (var x = 0;x < width;++(x))
    {
    r.push([])
    }
    ;
    return r;
  })([]) ){ 
    
      this.width = width;this.height = height;this._kernel = _kernel;
      return this;
    
   },
  get _matrix(  ){ 
    
      return this._kernel;
    
   },
  get array(  ){ 
    
      return this._kernel;
    
   }
 }, Kernel);
Kernel.get = (function Kernel$get$(x = this.x, y = this.y, width = this.width, height = this.height, _kernel = this._kernel) {
  /* Kernel.get inc/core/function-expressions.sibilant:32:8 */

  "retrieve an element of a matrix by its x and y coordinates";
  return _kernel[x][y];
});
Kernel.set = (function Kernel$set$(x = this.x, y = this.y, value = this.value, _kernel = this._kernel) {
  /* Kernel.set inc/core/function-expressions.sibilant:32:8 */

  "change the value of an array using 2d coordinates.";
  return _kernel[x][y] = value;
});
Kernel.convolve = (function Kernel$convolve$(B = this.B, A = this, height = this.height, width = this.width) {
  /* Kernel.convolve inc/core/function-expressions.sibilant:32:8 */

  "perform a kernel filter convolution of two matricies '";
  return (function(m) {
    /* inc/macros.sibilant:165:9 */
  
    for (var x = 0;x < width;++(x))
    {
    for (var y = 0;y < height;++(y))
    {
    m = (m + (A.get(x, y) * B.get(x, y)));
    }
    
    }
    ;
    return m;
  })(0);
});
Kernel.identity = (function Kernel$identity$(w, h) {
  /* Kernel.identity src/matrix/kernel.sibilant:34:0 */

  return kernel(w, h).dmap(() => {
  	
    return 1;
  
  });
});
exports.Kernel = Kernel;
exports.kernel = kernel;