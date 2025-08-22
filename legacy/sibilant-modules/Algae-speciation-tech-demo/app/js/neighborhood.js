var mooreNeighborhood = (function mooreNeighborhood$(w = this.w, h = this.h, weight = 1, c = 0) {
  /* moore-neighborhood deps.sibilant:61:8 */

  let m = create(Matrix)([], w, h).dmap((function() {
    /* eval.sibilant:36:57 */
  
    return weight;
  }));
  m.array[matrixCenter(w, h)] = c;
  return m;
});
const Neighborhood = { 
  symbol:Symbol("Neighborhood"),
  init( width = this.width,height = this.height,weight = this.weight,kernel = mooreNeighborhood(width, height, weight) ){ 
    
      this.width = width;this.height = height;this.weight = weight;this.kernel = kernel;
      return this;
    
   },
  resize( w = this.w,h = this.h,weight = this.weight ){ 
    
      this.kernel = mooreNeighborhood(w, h, weight);
      this.width = w;
      this.height = h;
      return this.weight = weight;
    
   },
  sample( m = this.m,x = this.x,y = this.y,kernel = this.kernel ){ 
    
      var wr = ((kernel.width - 1) / 2),
          hr = ((kernel.height - 1) / 2),
          w = kernel.width,
          h = kernel.height;
      return m.submatrix((x - wr), (y - hr), w, h);
    
   },
  count( x = this.x,y = this.y,state = this.state,kernel = this.kernel ){ 
    
      var wr = ((kernel.width - 1) / 2),
          hr = ((kernel.height - 1) / 2),
          w = kernel.width,
          h = kernel.height;
      return state.convolveSub(kernel, (x - wr), (y - hr));
    
   }
 };