Array.prototype.each = (function Array$prototype$each$(f) {
  /* Array.prototype.each inc/misc.sibilant:1:1692 */

  this.forEach(f);
  return this;
});
Object.prototype.each = (function Object$prototype$each$(f) {
  /* Object.prototype.each inc/misc.sibilant:1:1754 */

  return Object.keys(this).forEach(((k) => {
  	
    return f(this[k], k);
  
  }));
});
var { 
  Component,
  System
 } = require("@shared/ecs.js"),
    config = require("@crash-landed/config.js");
var { 
  renderChildren,
  createDocumentNode,
  DocumentNode,
  DocumentBody,
  DocumentHead,
  DocumentRoot
 } = require("@shared/dom.js");
var displayDecimal = (function displayDecimal$(d = (typeof d !== "undefined") ? d : this.d;, n = (typeof n !== "undefined") ? n : 6;) {
  /* display-decimal inc/core/function-expressions.sibilant:29:8 */

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
  get views(  ){ 

      return (function() {
        if (this._views) {
          return this._views;
        } else {
          return this._views = (new Map());
        }
      }).call(this);

   },
  get view(  ){ 
  
    return (() => {
    	
      return (function() {
        if (this.views.has("view")) {
          return this.views.get("view");
        } else {
          var r = (function() {
            /* eval.sibilant:13:23 */
          
            return createDocumentNode("div", {
              'id': (() => {
              	
                return this.panelId;
              
              }),
              'className': "panel",
              'style': { 
                width:"99%"
               }
            }, [ createDocumentNode("div", {  }, [ "entity", this.entity.id ]) ]);
          }).call(this);
          this.views.set("view", r);
          return r;
        }
      }).call(this);
    
    });
  
 }
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
    
      return require("@crash-landed/dom.js").debugView;
    
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
  get views(  ){ 

      return (function() {
        if (this._views) {
          return this._views;
        } else {
          return this._views = (new Map());
        }
      }).call(this);

   },
  get settingsPanel(  ){ 
  
    return (() => {
    	
      return (function() {
        if (this.views.has("settingsPanel")) {
          return this.views.get("settingsPanel");
        } else {
          var r = (function() {
            /* eval.sibilant:13:23 */
          
            return createDocumentNode("div", { 'className': "panel" }, []);
          }).call(this);
          this.views.set("settingsPanel", r);
          return r;
        }
      }).call(this);
    
    });
  
 },
  get views(  ){ 

      return (function() {
        if (this._views) {
          return this._views;
        } else {
          return this._views = (new Map());
        }
      }).call(this);

   },
  get pageNumberView(  ){ 
  
    return (() => {
    	
      return (function() {
        if (this.views.has("pageNumberView")) {
          return this.views.get("pageNumberView");
        } else {
          var r = (function() {
            /* eval.sibilant:13:23 */
          
            return createDocumentNode("span", {  }, [ (() => {
            	
              return ((1 + this.page) + "/" + this.pages);
            
            }) ]);
          }).call(this);
          this.views.set("pageNumberView", r);
          return r;
        }
      }).call(this);
    
    });
  
 },
  get views(  ){ 

      return (function() {
        if (this._views) {
          return this._views;
        } else {
          return this._views = (new Map());
        }
      }).call(this);

   },
  get titleView(  ){ 
  
    return (() => {
    	
      return (function() {
        if (this.views.has("titleView")) {
          return this.views.get("titleView");
        } else {
          var r = (function() {
            /* eval.sibilant:13:23 */
          
            return createDocumentNode("b", { 'onclick': this.hide }, [ createDocumentNode("div", {
              'className': "panel",
              'style': { 
                width:"30%"
               }
            }, [ this.title ]), createDocumentNode("div", {
              'className': "panel",
              'style': { 
                width:20,
                height:20
               }
            }, [ (() => {
            	
              return (function() {
                if (this.hidden) {
                  return "+";
                } else {
                  return "-";
                }
              }).call(this);
            
            }) ]) ]);
          }).call(this);
          this.views.set("titleView", r);
          return r;
        }
      }).call(this);
    
    });
  
 },
  get views(  ){ 

      return (function() {
        if (this._views) {
          return this._views;
        } else {
          return this._views = (new Map());
        }
      }).call(this);

   },
  get previousPageButton(  ){ 
  
    return (() => {
    	
      return (function() {
        if (this.views.has("previousPageButton")) {
          return this.views.get("previousPageButton");
        } else {
          var r = (function() {
            /* eval.sibilant:13:23 */
          
            return createDocumentNode("button", { 'onclick': this.previousPage }, [ "prev" ]);
          }).call(this);
          this.views.set("previousPageButton", r);
          return r;
        }
      }).call(this);
    
    });
  
 },
  get views(  ){ 

      return (function() {
        if (this._views) {
          return this._views;
        } else {
          return this._views = (new Map());
        }
      }).call(this);

   },
  get nextPageButton(  ){ 
  
    return (() => {
    	
      return (function() {
        if (this.views.has("nextPageButton")) {
          return this.views.get("nextPageButton");
        } else {
          var r = (function() {
            /* eval.sibilant:13:23 */
          
            return createDocumentNode("button", { 'onclick': this.nextPage }, [ "next" ]);
          }).call(this);
          this.views.set("nextPageButton", r);
          return r;
        }
      }).call(this);
    
    });
  
 },
  get views(  ){ 

      return (function() {
        if (this._views) {
          return this._views;
        } else {
          return this._views = (new Map());
        }
      }).call(this);

   },
  get header(  ){ 
  
    return (() => {
    	
      return (function() {
        if (this.views.has("header")) {
          return this.views.get("header");
        } else {
          var r = (function() {
            /* eval.sibilant:13:23 */
          
            return createDocumentNode("div", {
              'className': "panel",
              'style': { 
                width:"100%"
               }
            }, [ createDocumentNode("div", {
              'className': "panel",
              'style': { 
                width:"100%"
               }
            }, [ this.titleView, this.nextPageButton, this.previousPageButton, this.pageNumberView ]), this.settingsPanel ]);
          }).call(this);
          this.views.set("header", r);
          return r;
        }
      }).call(this);
    
    });
  
 },
  get views(  ){ 

      return (function() {
        if (this._views) {
          return this._views;
        } else {
          return this._views = (new Map());
        }
      }).call(this);

   },
  get containerView(  ){ 
  
    return (() => {
    	
      return (function() {
        if (this.views.has("containerView")) {
          return this.views.get("containerView");
        } else {
          var r = (function() {
            /* eval.sibilant:13:23 */
          
            return createDocumentNode("div", {
              'id': (this.title + "-container"),
              'className': "panel",
              'style': { 
                width:"99%"
               }
            }, [ this.header, this.contentView ]);
          }).call(this);
          this.views.set("containerView", r);
          return r;
        }
      }).call(this);
    
    });
  
 },
  get views(  ){ 

      return (function() {
        if (this._views) {
          return this._views;
        } else {
          return this._views = (new Map());
        }
      }).call(this);

   },
  get contentView(  ){ 
  
    return (() => {
    	
      return (function() {
        if (this.views.has("contentView")) {
          return this.views.get("contentView");
        } else {
          var r = (function() {
            /* eval.sibilant:13:23 */
          
            return createDocumentNode("div", {
              'id': (this.title + "-content"),
              'style': { 
                "overflow-y":"scroll",
                "height":500,
                "width":"99%"
               }
            }, []);
          }).call(this);
          this.views.set("contentView", r);
          return r;
        }
      }).call(this);
    
    });
  
 },
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
          a().forEach((function(c.entity.aspects) {
            /* eval.sibilant:123:6 */
          
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
exports.ViewPanel = ViewPanel;
exports.PropertyView = PropertyView;