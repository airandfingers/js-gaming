var passport = require("passport");
var express = require("express");
var session = require("express-session");
var config = require("getconfig");

module.exports.renderware = function(req,res,next){
  res.locals.user = req.user;
  res.locals.authTypes= this.providers;
  next();
};

module.exports.middleware = [
    require("cookie-parser")(config.session.secret),
    session({
      secret: config.session.secret,
      store: new session.MemoryStore()
    }),
    passport.initialize(),
    passport.session(),
];

module.exports.router = function(provider){
  var router = express.Router();
  router.param("authtype",function(req,res,next){
    var l = provider.providers.length;
    while(l--){
      if(req.params.authtype == provider.providers[l]) break;
    }
    if(l == provider.providers.length){
      return next(new Error("Not an accepted Authtype"));
    }
    req.provider = provider.providers[l];
    next();
  }).get("/self", function(req,res){
    if(req.user) return res.send(req.user.toJSON());
    res.send({
      displayName: "Anonymous"+Date.now(),
      loggedIn: false
    });
  }).get('/api', function(req,res){
    res.status(200).setHeader("content-type","application/javascript");
    provider.clientAPI.pipe(res);
  }).get("/login", function(req,res){
    res.render(provider.renderPath+"/index");
  }).get('/logout', function(req, res, next){
    req.user.loggedIn = false;
    req.user.save(function(err){
      if(err) return next(err);
      req.logout();
      res.redirect(req.baseUrl+'/login');
    });
  }).get('/:authtype',function(req,res,next){

  }).get('/:authtype/icon',function(req,res,next){
    if(!req.provider.icon) return next();
    res.sendFile(req.provider.icon);
  }).get('/:authtype/login', function(req, res, next){
    if(req.isAuthenticated()){
      return next(new Error("You are already Authenticated"));
    }
    passport.authenticate(req.params.authtype)(req,res,next);
  }).all('/:authtype/callback', function(req,res,next){
    if(req.isAuthenticated()){
      return next(new Error('You are already Authorized'));
    }
    passport.authenticate(req.params.authtype,function(err,user,info){
      if(err) return next(err);
      if(!user) return res.redirect(req.baseUrl+'/login');
      user.loggedIn = true;
      req.logIn(user, function(err){
        if(err) return next(err);
        res.statusCode = 201;
        res.redirect(req.baseUrl+"/login");
      });
    })(req,res,next);
  });
  return router;
};
