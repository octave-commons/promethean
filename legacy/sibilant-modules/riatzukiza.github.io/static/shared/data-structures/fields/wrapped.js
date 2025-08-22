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
var WrappingVectorField = Interface.define("WrappingVectorField", { 
  init( columns = this.columns,rows = this.rows,_data = (new Array(columns)) ){ 
    
      this.columns = columns;this.rows = rows;this._data = _data;
      this.populate(columns, rows, _data);
      return this;
    
   },
  get data(  ){ 
    
      return this._data;
    
   },
  get( x = this.x,y = this.y,columns = this.columns,rows = this.rows ){ 
    
      return this.data[(Math.min(Math.max(Math.round(x), 0), (columns - 1)) || 0)][(Math.min(Math.max(Math.round(y), 0), (rows - 1)) || 0)];
    
   },
  each( f = this.f,columns = this.columns,rows = this.rows,data = this.data ){ 
    
      for (var x = 0;x < columns;++(x))
      {
      for (var y = 0;y < rows;++(y))
      {
      f(data[x][y], [ x, y ])
      }
      
      }
      ;
      return this;
    
   },
  traverse( start,end ){ 
    
   },
  populate( columns = this.columns,rows = this.rows,_data = this._data ){ 
    
      for (var x = 0;x < columns;++(x))
      {
      _data[x] = (new Array(rows));;
      for (var y = 0;y < rows;++(y))
      {
      field[x][y] = Vector.spawn(0, 0);
      }
      
      }
      ;
      return this;
    
   }
 });