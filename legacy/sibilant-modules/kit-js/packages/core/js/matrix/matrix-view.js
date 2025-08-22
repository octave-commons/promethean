var MatrixView = extend(Matrix, { 
  symbol:Symbol("MatrixView")
 });
mixin({ 
  offset:[ 0, 0 ],
  init( _matrix = this._matrix,width = this.width,height = this.height,offset = this.offset ){ 
    
      this._matrix = _matrix;this.width = width;this.height = height;this.offset = offset;
      return this;
    
   }
 }, MatrixView);
MatrixView.getIndex = (function MatrixView$getIndex$([ x, y ] = [ 0, 0 ], [ offx, offy ] = this.offset, width = (this.width + this._matrix.width)) {
  /* Matrix-view.get-index inc/core/function-expressions.sibilant:32:8 */

  "\n"+"Locate the index of an element with an offset, and a limit on width and height.\n"+"";
  return (((x + offx) * width) + (y + offy));
});
MatrixView.get = (function MatrixView$get$(x = this.x, y = this.y, width = this.width, height = this.height, [ offx, offy ] = this.offset) {
  /* Matrix-view.get inc/core/function-expressions.sibilant:32:8 */

  "retrieve an element of a matrix by its x and y coordinates ";
  return this._matrix.get((x + offx), (y + offy));
});
MatrixView.set = (function MatrixView$set$(x = this.x, y = this.y, value = this.value, width = this.width, height = this.height, [ offx, offy ] = this.offset) {
  /* Matrix-view.set inc/core/function-expressions.sibilant:32:8 */

  "change the value of an array using 2d coordinates.";
  return this._matrix.set((x + offx), (y + offy), value);
});
var matrixView = create(MatrixView);
exports.MatrixView = MatrixView;
exports.matrixView = matrixView;