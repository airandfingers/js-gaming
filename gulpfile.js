'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');
var reactify = require('reactify');
var concat = require('gulp-concat');
var child_process = require('child_process');
var livereload = require('gulp-livereload');

var livereload_options = { start: true, reloadPage: 'temp.html' };

var bundler = browserify({
  entries: ['./client/app.js'],
  transform: reactify,
  debug: true, //source maps
  cache: {}, packageCache: {}, fullPaths: true //required by watchify
});
var watcher = watchify(bundler);

gulp.task('js', bundleJS); // so you can run `gulp js` to build the file
watcher.on('update', bundleJS); // on any dep update, runs the bundler
watcher.on('log', gutil.log); // output build logs to terminal

function bundleJS() {
  return watcher.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./public/js'))
    .pipe(livereload(livereload_options));
}

gulp.task('css', bundleCSS);
gulp.watch('styles/**/*.css', bundleCSS);
function bundleCSS() {
  return gulp.src('styles/**/*.css')
    .pipe(concat('bundle.css'))
    .pipe(gulp.dest('./public/css/'))
    .pipe(livereload(livereload_options));
}

gulp.task('server', function() {
  var server = child_process.spawn('node', ['bootstrap/server.js']);
  server.stdout.pipe(process.stdin);
  server.stderr.pipe(process.stdin);
});

gulp.task('default', ['js', 'css', 'server']);