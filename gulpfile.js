var path = require('path');
var gulp = require('gulp');
var del = require('del');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var concat = require('gulp-concat');
var express = require('express');
var connect_livereload = require('connect-livereload');
var tiny_lr = require('tiny-lr');
var gutil = require('gulp-util');
var log = gutil.log;
var noop = gutil.noop;

// $ gulp --type production
var isProd = gutil.env.type == 'production';
var vendorJsPaths = [
  './src/js/vendor/ie10-viewport-bug-workaround.js'
];
var vendorCssPaths = [
  './node_modules/bootstrap/dist/css/bootstrap.min.css'
];
var fontsPaths = [
  './src/fonts/*',
  './node_modules/bootstrap/dist/fonts/*'
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
console.log(webpackConfig.plugins);

var httpPort = gutil.env.port ? gutil.env.port : 4000;

// *** Tasks ***

// pass in callback as argument as async run hints
// See: https://github.com/gulpjs/gulp/blob/master/docs/API.md#async-task-support
function cleanBuild(cb) {
  del(['dist/*'], cb);
}

function buildJs(cb) {
  webpackCompiler.run(function(err, stats) {
    var timeTaken = stats.endTime - stats.startTime;
    //log(stats.toString({colors: true}));
    log("webpack takes " + (timeTaken / 1000) + " s" );

    if (err) {
      throw new gutil.PluginError('webpack', err);
    }
  });
  cb();
}

// return stream as async run hints
// See: https://github.com/gulpjs/gulp/blob/master/docs/API.md#async-task-support
function compileSass() {
  var sassConfig = { includePaths: ['src/css'] };

  return gulp.src('src/css/main.sass')
    .pipe(sass(sassConfig).on('error', log))
    .pipe(isProd ? minifyCSS() : noop())
    .pipe(gulp.dest('dist/assets/css/'));
}

function concatVendorJs() {
  return gulp.src(vendorJsPaths)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('dist/assets/js/'));
}

function concatVendorCss() {
  return gulp.src(vendorCssPaths)
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('dist/assets/css/'));
}

function copyHtml() {
  return gulp.src('src/*.html')
    .pipe(gulp.dest('dist/'));
}

function copyFonts() {
  return gulp.src(fontsPaths)
    .pipe(gulp.dest('dist/assets/fonts/'));
}

function copyAssets() {
  return gulp.src(assetsPaths)
    .pipe(gulp.dest('dist/assets/'));
}

gulp.task('clean', cleanBuild);

if (isProd) {
  // wait for 'clean' task completion before running 'js', 'css', 'copy:*' tasks
  gulp.task('js:main', ['clean'], buildJs);
  gulp.task('js:vendor', ['clean'], concatVendorJs);
  gulp.task('css:main', ['clean'], compileSass);
  gulp.task('css:vendor', ['clean'], concatVendorCss);
  gulp.task('copy:html', ['clean'], copyHtml);
  gulp.task('copy:fonts', ['clean'], copyFonts);
  gulp.task('copy:assets', ['clean'], copyAssets);
  gulp.task('build', ['clean', 'js:main', 'js:vendor', 'css:main', 'css:vendor', 'copy:html', 'copy:fonts', 'copy:assets']);
} else {
  gulp.task('js:main', buildJs);
  gulp.task('js:vendor', concatVendorJs);
  gulp.task('css:main', compileSass);
  gulp.task('css:vendor', concatVendorCss);
  gulp.task('copy:html', copyHtml);
  gulp.task('copy:fonts', copyFonts);
  gulp.task('copy:assets', copyAssets);
  gulp.task('build', ['js:main', 'js:vendor', 'css:main', 'css:vendor', 'copy:html', 'copy:fonts', 'copy:assets']);
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

  gulp.watch(['./src/**/*.js'], ['js:main']);
  gulp.watch(['./src/**/*.sass'], ['css:main']);

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
