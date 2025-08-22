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
  Component,
  System
 } from "/shared/ecs.js";
import { 
  config
 } from "/client/obstacles/config.js";
import { 
  debugView
 } from "/client/obstacles/dom.js";
var displayDecimal = (function displayDecimal$(d = this.d, n = 6) {
  /* display-decimal inc/core/function-expressions.sibilant:28:8 */

  return (Math.round((Math.pow(10, n) * d)) / Math.pow(10, n));
});
const views=(new Map());
var PropertyView = Component.define("PropertyView", { 
  register(  ){ 
    
      return this.panelId = ("entity-panel" + this.entity.id);
    
   },
  get parentView(  ){ 
    
      return this.system.contentView;
    
   },
  _clear(  ){ 
    
      return this.view().remove();
    
   },
  defView:view
 });
var ViewPanel = System.define("ViewPanel", { 
  interface:PropertyView,
  pageSize:10,
  page:0,
  cursor:0,
  title:"Entities",
  get hidden(  ){ 
    
      return this.view.style.display === "none";
    
   },
  get pages(  ){ 
    
      return Math.ceil((this.components.length / this.pageSize));
    
   },
  get debugView(  ){ 
    
      return debugView;
    
   },
  register(  ){ 
    
      this.debugView.append(this.containerView());
      this.updated__QUERY = true;
      return this.hide();
    
   },
  get nextPage(  ){ 
    
      return (() => {
      	return (function() {
        if (this.page < this.pages) {
          ((this.page)++);
          this.updated__QUERY = true;
          return this.pageNumberView().render(false);
        }
      }).call(this);
      });
    
   },
  get previousPage(  ){ 
    
      return (() => {
      	return (function() {
        if (this.page > 0) {
          ((this.page)--);
          this.updated__QUERY = true;
          return this.pageNumberView().render(false);
        }
      }).call(this);
      });
    
   },
  get hide(  ){ 
    
      return (() => {
      	(function() {
        if (this.hidden) {
          return this.view.style.display = "";
        } else {
          return this.view.style.display = "none";
        }
      }).call(this);
      return this.titleView().render(false);
      });
    
   },
  get view(  ){ 
    
      return this.contentView();
    
   },
  defView:settingsPanel,
  defView:pageNumberView,
  defView:titleView,
  defView:previousPageButton,
  defView:nextPageButton,
  defView:header,
  defView:containerView,
  defView:contentView,
  _prepare(  ){ 
    
      return this.cursor = 0;
    
   },
  _updateAll(  ){ 
    
      this.pageNumberView().render();
      return (function() {
        if ((!(this.hidden) && (this.updated__QUERY || (this.game.ticker.ticks % config.uiPollingRate) === 0))) {
          return System._updateAll.call(this);
        }
      }).call(this);
    
   },
  _updateComponent( c,t ){ 
    
      (function() {
        if (c.displayed__QUERY) {
          return c.view().remove();
        }
      }).call(this);
      c.displayed__QUERY = false;
      (function() {
        if (Math.floor((this.cursor / this.pageSize)) === this.page) {
          c.displayed__QUERY = true;
          c.entity.aspects.each(((a) => {
          	const c_=c.entity[a.interface.name];
          return (function() {
            if (c_.updateView__QUERY) {
              return c.view().append(c_.view());
            }
          }).call(this);
          }));
          return this.contentView().append(c.view());
        }
      }).call(this);
      return ((this.cursor)++);
    
   },
  _cleanup(  ){ 
    
      this.containerView().render();
      return this.updated__QUERY = false;
    
   }
 });
export { 
  ViewPanel
 };
export { 
  PropertyView
 };