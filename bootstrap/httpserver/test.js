var config = require('getconfig');
var serveStatic = require('serve-static');
var semiStatic = require('semi-static');
var path = require('path');

// a little helper for fixing paths for various environments
var fixPath = function (pathString) {
  return path.resolve(path.normalize(pathString));
};

module.exports.middleware = function(app) {
  // in order to test this with spacemonkey we need frames
  if (! config.isDev) {
    app.use(helmet.xframe());
  }
  app.use(serveStatic(fixPath('test/assets')));
  app.use(serveStatic(fixPath('test/spacemonkey')));
};


module.exports.routes = function(app) {
  // -----------------
  // Enable the functional test site in development
  // -----------------
  if (config.isDev) {
    app.get('/test*', semiStatic({
      folderPath: fixPath('test'),
      root: '/test'
    }));
  }

/*
  // ---------------------------------------------------
  // Configure Moonboots to serve our client application
  // ---------------------------------------------------
  new Moonboots({
    moonboots: {
      jsFileName: 'js-gaming',
      cssFileName: 'js-gaming',
      main: fixPath('client/app.js'),
      developmentMode: config.isDev,
      libraries: [
      ],
      stylesheets: [
      fixPath('public/css/bootstrap.css'),
      fixPath('public/css/app.css')
      ],
      browserify: {
        debug: true,
        transform: ['reactify']
      },
      beforeBuildJS: function () {
        // This re-builds our template files from jade each time the app's main
        // js file is requested. Which means you can seamlessly change jade and
        // refresh in your browser to get new templates.
        if (config.isDev) {
          templatizer(fixPath('templates'), fixPath('client/templates.js'));
        }
      },
      beforeBuildCSS: function (done) {
        // This re-builds css from stylus each time the app's main
        // css file is requested. Which means you can seamlessly change stylus files
        // and see new styles on refresh.
        if (config.isDev) {
          stylizer({
            infile: fixPath('public/css/app.styl'),
            outfile: fixPath('public/css/app.css'),
            development: true
          }, done);
        } else {
          done();
        }
      }
    },
    server: app
  });*/
};
