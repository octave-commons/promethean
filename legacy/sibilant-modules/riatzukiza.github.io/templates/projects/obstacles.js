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
create(HtmlElement)("html", {  }, [ create(HtmlElement)("head", {  }, [ create(HtmlElement)("style", {  }, [ "\n"+"        .panel {\n"+"            float: left;\n"+"            border-style: solid;\n"+"            border-width: 1px;\n"+"        }\n"+"        .bordered {\n"+"            border-style: solid;\n"+"            border-width: 1px;\n"+"        }\n"+"img {\n"+"position:absolute;\n"+"}\n"+"\n"+"" ]), create(HtmlElement)("script", { 'src': "https://cdn.jsdelivr.net/quicksettings/3.0/quicksettings.min.js" }, []) ]), create(HtmlElement)("body", {  }, [ create(HtmlElement)("img", {
  'id': "ant-texture",
  'src': "/ant.png",
  'hidden': "true"
}, []), create(HtmlElement)("img", {
  'id': "rock-texture",
  'src': "/rock.png",
  'hidden': "true"
}, []) ]), create(HtmlElement)("script", {
  'src': "/client/obstacles/main.js",
  'type': "module"
}, []) ]);