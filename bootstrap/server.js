var config = require("getconfig");
require("./polyfill");

var database = require("./database")(config);
var http = require("http");
var httpserver = require("./httpserver");
var wsserver = require("./wsserver");

var appserver = require("./apps")();
var chatroom = require("./chatroom")(database.orm);
var userserver = require("./user");
//var matchmaker = require("./matchmaker");

var routePaths = {
  apps: '/apps',
  api: '/api',
  user: '/auth',
  match: '/match',
  index: '/temp'
};

console.log("Database finished");
userserver = userserver(database.orm);
userserver.collect(function(e,providers){
  if(e) throw e;
  console.log("UserServer finished");
  appserver.collect(function(e,applist){
    if(e) throw e;
    console.log("AppServer finished");

//      matchmaker = matchmaker();
    var test = require("./httpserver/test");
    database.connect(function(e){
      if(e) throw e;

      // -----------------
      // Enable Sessions and cookies
      // -----------------
      httpserver
      .get("/api.js",require("app/abstract/messageAPI.js"))
      .use(function(req,res,next){
        res.locals.routePaths = routePaths;
        next();
      })
      .use(userserver.middleware)
      .use(appserver.renderware)
      .use(userserver.renderware);
      test.middleware(httpserver);

      // listen for incoming http requests on the port as specified in our config
      httpserver
      .use(routePaths.apps,appserver.router)
      .use(routePaths.api,database.getRouter())
      .use(routePaths.user,userserver.router)
//      .use(routePaths.match,matchmaker.router)
      .use(routePaths.index, function(req,res,next){
        res.render("generic");
      });
      test.routes(httpserver);

      wsserver
      .use(userserver.middleware)
      .use(appserver.wsrouter);

      var server = new http.Server();
      server.on("request",httpserver);
      server.on("upgrade",wsserver.init);

      server.listen(config.http.port);
      console.log('HTTP and WebSocket is running at: http://localhost:' + config.http.port + '.');
    });
  });
});
