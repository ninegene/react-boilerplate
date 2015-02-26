var path = require('path');
var gulp = require('gulp');
var del = require('del');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
// Static asset revisioning by appending content hash to filenames
// main.css →  main-098f6bcd.css
// Make sure to set the files to never expire for this to have an effect
var rev = require('gulp-rev');
var express = require('express');
var connect_livereload = require('connect-livereload');
var tiny_lr = require('tiny-lr');
var gutil = require('gulp-util');
var log = gutil.log;
var noop = gutil.noop;

// $ gulp --type production
var isProd = gutil.env.type == 'production';
var vendorPaths = [
  './node_modules/es5-shim/es5-sham.js',
  './node_modules/es5-shim/es5-shim.js',
  './src/js/vendor/ie10-viewport-bug-workaround.js',
  './node_modules/bootstrap/dist/css/bootstrap.css',
  './node_modules/bootstrap/dist/css/bootstrap.css.map'
];
var assetsPaths = [
  // all except html, js and css files
  'src/**/*',
  '!src/*.html',
  '!src/js', '!src/js/**/*',
  '!src/css', '!src/css/**/*'
];
var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');
if (isProd) {
  webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin());
  //webpackConfig.output.filename = '[name]-[hash].js';
}
var webpackCompiler = webpack(webpackConfig);

var httpPort = gutil.env.port ? gutil.env.port : 4000;

// *** Tasks ***

// pass in callback as argument as async run hints
// See: https://github.com/gulpjs/gulp/blob/master/docs/API.md#async-task-support
function cleanBuild(cb) {
  del(['dist/*'], cb);
}

function buildJS(cb) {
  webpackCompiler.run(function(err, stats) {
    var timeTaken = stats.endTime - stats.startTime;
    log("webpack takes " + (timeTaken / 1000) + " s" );
    log(stats.toString({colors: true}));

    if (err) {
      throw new gutil.PluginError('webpack', err);
    }
  });
  cb();
}

// return stream as async run hints
// See: https://github.com/gulpjs/gulp/blob/master/docs/API.md#async-task-support
function buildCSS() {
  var sassConfig = { includePaths: ['src/css'] };

  return gulp.src('src/css/main.sass')
    .pipe(sass(sassConfig).on('error', log))
    .pipe(isProd ? minifyCSS() : noop())
    //.pipe(isProd ? rev() : noop())
    .pipe(gulp.dest('dist/assets'));
}

function copyHTML() {
  return gulp.src('src/*.html')
    .pipe(gulp.dest('dist/'));
}

function copyVendor() {
  return gulp.src(vendorPaths)
    .pipe(gulp.dest('dist/assets/vendor'));
}

function copyOtherAssets() {
  return gulp.src(assetsPaths)
    .pipe(gulp.dest('dist/assets'));
}

if (isProd) {
  // wait for 'clean' task completion before running 'js', 'css', 'copy:*' tasks
  gulp.task('clean', cleanBuild);
  gulp.task('js', ['clean'], buildJS);
  gulp.task('css', ['clean'], buildCSS);
  gulp.task('copy:html', ['clean'], copyHTML);
  gulp.task('copy:vendor', ['clean'], copyVendor);
  gulp.task('copy:assets', ['clean'], copyOtherAssets);
  gulp.task('build', ['clean', 'js', 'css', 'copy:html', 'copy:vendor', 'copy:assets']);
} else {
  gulp.task('clean', cleanBuild);
  gulp.task('js', buildJS);
  gulp.task('css', buildCSS);
  gulp.task('copy:html', copyHTML);
  gulp.task('copy:vendor', copyVendor);
  gulp.task('copy:assets', copyOtherAssets);
  gulp.task('build', ['js', 'css', 'copy:html', 'copy:vendor', 'copy:assets']);
}

gulp.task('dev-server', ['build'], function () {
  var lrPort = 35729;
  liveReload = tiny_lr();
  liveReload.listen(lrPort, function () {
    log('LiveReload listening on', lrPort);
  });

  app = express();
  app.use(connect_livereload());
  app.use(express.static(path.resolve("./dist")));
  app.listen(httpPort, function () {
    log('HTTP server listening on', httpPort);
  });

  gulp.watch(['./src/**/*'], function (event) {
    gulp.run('build');
  });

  gulp.watch(['./dist/**/*'], function (event) {
    var fileName = event.path;
    log(gutil.colors.cyan(fileName), 'changed');
    liveReload.changed({
      body: { files: [fileName] }
    });
  });
});

gulp.task('default', function () {
  log("*********************************************************");
  log("* gulp build                   (development build)");
  log("* gulp clean                   (clean build: rm dist/**/*)");
  log("* gulp --type production build (production build)");
  log("* gulp dev-server               (build and run dev server)");
  log("*********************************************************");
});

// See package.json scripts property values
gulp.task('npm-run-help', function () {
  log("*********************************************************");
  log("* npm run dev-build            (development build)");
  log("* npm run clean                (clean build: rm dist/**/*)");
  log("* npm run build                (production build)");
  log("* npm run dev                  (build and run dev server)");
  log("*********************************************************");
});
