"use strict";
const port = (process.env.PORT || 8001);
const express = require("express");
const app = express();
const chokidar = require("chokidar");
const Path = require("path");
const Url = require("url");
const env = (process.env.NODE_ENV || "dev");
const exec = require("./exec.js");
const { Directory } = require("./lib/file-system");
const { Sibilant } = require("./lib/sibilant");
const { create } = require("./lib/util");
const http = require("http");
const server = http.Server(app);
const browserify = require("browserify");
const io = require("socket.io")(server);

server.listen(port);

var addRoutes = (function addRoutes$(game, bundle) {

  let htmlPath = Path.join(__dirname, "games/", game, "/html");
  let routePath= `/games/${game}/js/main.js`
  let playPath = `/games/${game}/play`

  console.log("Adding route for", 
  {game,htmlPath,routePath}
  )
  app.get(routePath, (req, res) => {
    return bundle.bundle().on("error", (...b) => {
      return console.log("bundle err", ...b);
    }).pipe(res);
    
  });
  return app.use(playPath, express.static(htmlPath));
});
var translatePath = (function translatePath$(path) {
  return path.replace(Path.sep + "sibilant" + Path.sep, Path.sep).replace(".sibilant", ".js");
});
var build = (function build$(path) {
  let target = translatePath(path);
  console.log("building", {path, target});
  return Sibilant.fromFile(path).transpile().saveFile(target);
});
Set.prototype.each = (function Set$prototype$each$(f) {
  this.forEach(f);
  return this;
});
var signalRefresh = (function signalRefresh$(game, connections) {
  return (promise) =>  promise
    .then((string) => connections.each((socket) => socket.emit("change")));
});
var initialBuild = (function initialBuild$(p, src, path) {
  console.log("initial build of", src, path);
  return Promise.resolve(p).then((nil) => {
    
    return src.each((name) => {
      
      return build(Path.join(path, name));
      
    });
    
  }).then((nil) => {
    
    return src.each((name) => {
      
      return build(Path.join(path, name));
      
    });
    
  });
});
const AutoCompiler = { 
  symbol:Symbol("AutoCompiler"),
  init( name = this.name,
    bundle = this.bundle,
    namespace = io.of(name),
    connections = (new Set()),
    sibilantPath = Path.join(__dirname, "games/", name, "/sibilant/js"),
    sourceWatcher = chokidar.watch(sibilantPath),
    src = create(Directory)(sibilantPath) ){ 
    
    this.name = name;
    this.bundle = bundle;
    this.namespace = namespace;
    this.connections = connections;
    this.sibilantPath = sibilantPath;
    this.sourceWatcher = sourceWatcher;
    this.src = src;

    initialBuild(null, src, sibilantPath);

    return this;
    
  },
  change( path = this.path,name = this.name,connections = this.connections ){ 
    
    return signalRefresh(name, connections)(build(path));
    
  },
  connect( namespace = this.namespace,connections = this.connections,sourceWatcher = this.sourceWatcher,bundle = this.bundle,name = this.name ){ 
    
    sourceWatcher.on("change", (path) => {
      
      return (function() {
        if (!(this._compiling)) {
          this._compiling = true;
          return this.change(path).then((branchName) => {
            return this._compiling = false;
          });
        }
      }).call(this);
      
    });
    return namespace.on("connection", (socket) => {
      
      connections.add(socket);
      return socket.on("disconnect", () => {
        
        return connections.delete(socket);
        
      });
      
    });
    
  }
};

var autoCompile = (function autoCompile$(game, bundle) {
  /* auto-compile index.sibilant:119:0 */

  return (function() {
    if (env === "dev") {
      let compiler = create(AutoCompiler)(game, bundle);
      return compiler.connect();
    }
  }).call(this);
});

var bulkBundle = (function bulkBundle$(dir, bundle) {

  console.log("bulk add on", dir.path);
  return dir.each((name) => {
    
    return dir.find(name).then((node) => {
      
      return (function() {
        if (!(name === "includes")) {
          return (function() {
            if (node.symbol === Directory.symbol) {
              console.log("was a directory", node.path)
              return bulkBundle(node, bundle);
            } else {
              console.log("adding", node.path, "to bundle");
              return bundle.add(node.path);
            }
          }).call(this);
        }
      }).call(this);
      
    });
    
  });
});

var addGame = (function addGame$(game) {
  /* add-game index.sibilant:134:0 */

  "sets up the middleware and build tools for a game's directory";
  var bundle = browserify(),
      jsPath = Path.join(__dirname, "games/", game, "/js");
      console.log({jsPath})

  var dir = create(Directory)(jsPath);

  addRoutes(game, bundle);

  return Promise.resolve(autoCompile(game, bundle))
    .then(() => bulkBundle(dir, bundle));
});
let games = create(Directory)("./games");
games.each(addGame).then((...b) => console.log("all games loaded", ...b));
