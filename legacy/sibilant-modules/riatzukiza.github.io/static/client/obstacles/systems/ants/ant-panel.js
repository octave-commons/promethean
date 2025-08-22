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
  PropertyView,
  ViewPanel
 } from "/client/obstacles/systems/property-view.js";
var AntsPropertyView = PropertyView.define("AntsPropertyView", { 
  
 });
var AntPanel = ViewPanel.define("AntPanel", { 
  pageSize:5,
  page:0,
  cursor:0,
  title:"Ants"
 });
export { 
  AntsPropertyView
 };
export { 
  AntPanel
 };