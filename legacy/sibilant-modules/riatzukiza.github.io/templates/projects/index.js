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
var navButton = (function navButton$(link, text) {
  /* nav-button eval.sibilant:15:0 */

  return create(HtmlElement)("html", {  }, [ create(HtmlElement)("span", { 'class': "bordered" }, [ create(HtmlElement)("a", { 'href': link }, [ text ]) ]) ]);
});
create(HtmlElement)("html", {  }, [ create(HtmlElement)("head", {  }, [ "\n"+"\n"+"\n"+"       <link rel='preconnect' href='https://fonts.googleapis.com'>\n"+"       <link rel='preconnect' href='https://fonts.gstatic.com' crossorigin>\n"+"       <link href='https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap' rel='stylesheet'>\n"+"", create(HtmlElement)("style", {  }, [ "\n"+"* {\n"+"                                       font-family: 'Source Code Pro', serif;\n"+"                                       font-optical-sizing: auto;\n"+"                                       font-weight: 400;\n"+"                                       font-style: normal;\n"+"}\n"+"\n"+"" ]), create(HtmlElement)("style", {  }, [ `
${".iframe-container"}{
  height:${"calc(50% - 2px)"};
  z-index:${"2"};
  display:${"inline-block"};
  position:${"relative"};
  width:${"calc(50% - 4px)"};
  float:${"left"};
}
`, `
${".iframe-container iframe"}{
  width:${"calc(100% - 16px)"};
  height:${"calc(100% - 16px)"};
  overflow:${"hidden"};
  pointer-events:${"none"};
  z-index:${"-100"};
}
`, `
${".panel"}{
  float:${"left"};
  border-style:${"solid"};
  border-width:${"1px"};
}
`, `
${".bordered"}{
  border-style:${"solid"};
  border-width:${"1px"};
  border-color:${"#75715e"};
}
`, `
${".focus-bordered"}{
  border-style:${"solid"};
  border-width:${"1px"};
  border-color:${"#99947c"};
}
`, `
${"body"}{
  background-color:${"#34352f"};
}
`, `
${"header"}{
  height:${"10%"};
  color:${"#f8f8f2"};
  background-color:${"#1e1f1c"};
}
`, `
${"main"}{
  height:${"80%"};
  color:${"#f8f8f2"};
  background-color:${"#1e1f1c"};
  margin-top:${"5px"};
  margin-bottom:${"3px"};
}
`, `
${"footer"}{
  height:${"10%"};
  color:${"#f8f8f2"};
  background-color:${"brown"};
  background-color:${"#1e1f1c"};
}
`, `
${"a"}{
  color:${"#cccccc"};
}
` ]), create(HtmlElement)("script", { 'src': "https://cdn.jsdelivr.net/quicksettings/3.0/quicksettings.min.js" }, []) ]), create(HtmlElement)("script", { 'src': "/socket.io/socket.io.js" }, []), create(HtmlElement)("body", {  }, [ create(HtmlElement)("header", { 'id': "header" }, [ create(HtmlElement)("h1", {  }, [ "Welcome to the Error Log" ]), create(HtmlElement)("nav", {  }, [ navButton("/projects", "My Projects"), navButton("/prior-work", "My work for others"), navButton("/about-me", "Who am I?"), navButton("/kanban/board.html", "My kanban"), navButton("/docs", "Documentation for Lith"), navButton("/blog", "My Blog") ]) ]), create(HtmlElement)("main", { 'id': "main" }, [ FileSystem.load("./static/client").find(".").then(((clientDir) => {
	return clientDir.map(((dir) => {
	return create(HtmlElement)("a", {
  'href': ("/projects/" + Path.basename(dir.path) + ".html"),
  'target': "_blank"
}, [ create(HtmlElement)("div", { 'class': "iframe-container" }, [ create(HtmlElement)("iframe", {
  'class': "project-preview",
  'frameborder': "0",
  'height': "100%",
  'width': "100%",
  'src': ("/projects/" + Path.basename(dir.path) + ".html"),
  'id': Path.basename(dir.path)
}, []) ]) ]);
}));
})) ]), create(HtmlElement)("footer", { 'id': "footer" }, [ create(HtmlElement)("section", { 'id': "links" }, [ create(HtmlElement)("a", { 'href': "https://www.linkedin.com/in/aaron-beavers-76b13aa7/" }, [ "linkedin" ]), create(HtmlElement)("a", { 'href': "https://x.com/anomalous_error" }, [ "Twitter/X" ]), create(HtmlElement)("a", { 'href': "https://bsky.app/profile/37707.bsky.social" }, [ "BlueSky" ]), create(HtmlElement)("a", { 'href': "https://github.com/riatzukiza" }, [ "github" ]), create(HtmlElement)("a", { 'href': "https://github.com/riatzukiza/riatzukiza.github.io" }, [ "Source code" ]), create(HtmlElement)("a", { 'href': "https://www.linkedin.com/in/aaron-beavers-76b13aa7/" }, [ "linkedin" ]) ]), create(HtmlElement)("section", { 'id': "contact-info" }, [ create(HtmlElement)("a", { 'href': "mailto:foamy125@gmail.com" }, []) ]) ]) ]) ]);