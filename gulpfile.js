// FOUNDATION FOR APPS TEMPLATE GULPFILE
// -------------------------------------
// This file processes all of the assets in the "client" folder, combines them with the Foundation
// for Apps assets, and outputs the finished files in the "build" folder as a finished app.

// 1. LIBRARIES
// - - - - - - - - - - - - - - -

var gulp       = require('gulp'),
    $          = require('gulp-load-plugins')(),
    rimraf     = require('rimraf'),
    sequence   = require('run-sequence'),
    path       = require('path'),
    modRewrite = require('connect-modrewrite'),
    router     = require('./bower_components/foundation-apps/bin/gulp-dynamic-routing');

// 2. SETTINGS VARIABLES
// - - - - - - - - - - - - - - -

// Sass will check these folders for files when you use @import.
var sassPaths = [
    'client/assets/scss',
    'bower_components/foundation-apps/scss',
    'bower_components/font-awesome/scss'
];
// These files include Foundation for Apps and its dependencies
var foundationJS = [
    'client/assets//js/libs/jquery-2.1.4.min.js',
    'bower_components/fastclick/lib/fastclick.js',
    'bower_components/viewport-units-buggyfill/viewport-units-buggyfill.js',
    'bower_components/tether/tether.js',
    'bower_components/angular/angular.js',
    'bower_components/angular-animate/angular-animate.js',
    'bower_components/angular-ui-router/release/angular-ui-router.js',
    'bower_components/angular-sanitize/angular-sanitize.js',
    'bower_components/angular-cookies/angular-cookies.js',
    'bower_components/angular-leaflet-directive/dist/angular-leaflet-directive.js',
    'bower_components/foundation-apps/js/vendor/**/*.js',
    'bower_components/foundation-apps/js/angular/**/*.js',
    '!bower_components/foundation-apps/js/angular/app.js',
    'bower_components/hammerjs/hammer.js',
    'bower_components/lodash/lodash.js',
    'bower_components/d3/d3.js',
    'bower_components/restangular/dist/restangular.js',
    'bower_components/angular-toArrayFilter/toArrayFilter.js',
    'bower_components/angular-ui-select/dist/select.js',
    'bower_components/angular-fullscreen/src/angular-fullscreen.js'
];
// CSS files from libraries and other external sources
// Currently not used. If this grows, build it into the gulpfile
var appLibs = [
    'client/assets/js/libs/leaflet-0.7.2/**/*.*',
    'bower_components/select2/*.*'
];
// These files are for your app's JavaScript
var appJS = [
    'client/assets/js/**/*.js'
];

// 3. TASKS
// - - - - - - - - - - - - - - -

// Cleans the build directory
gulp.task('clean', function(cb) {
    rimraf('./build', cb);
});

// Copies user-created files and Foundation assets
gulp.task('copy', function() {
    var dirs = [
        './client/**/*.*',
        '!./client/templates/**/*.*',
        '!./client/assets/{scss,js}/**/*.*'
    ];

    // Everything in the client folder except templates, Sass, and JS
    gulp.src(dirs, {
        base: './client/'
    })
        .pipe(gulp.dest('./build'));

    // Iconic SVG icons
    gulp.src('./bower_components/foundation-apps/iconic/**/*')
        .pipe(gulp.dest('./build/assets/img/iconic/'));

    // Foundation's Angular partials
    return gulp.src(['./bower_components/foundation-apps/js/angular/components/**/*.html'])
        .pipe(gulp.dest('./build/components/'));
});

// Compiles Sass
gulp.task('sass', function() {
    return gulp.src('client/assets/scss/app.scss')
        .pipe($.rubySass({
            loadPath: sassPaths,
            style: 'nested',
            bundleExec: true
        })).on('error', function(e) {
            console.log(e);
        })
        .pipe($.autoprefixer({
            browsers: ['last 2 versions', 'ie 10']
        }))
        .pipe(gulp.dest('./build/assets/css/'));
});

// Compiles and copies the Foundation for Apps JavaScript, as well as your app's custom JS
gulp.task('uglify', function() {
    // Foundation JavaScript
    gulp.src(foundationJS)
        .pipe($.uglify({
            beautify: true,
            mangle: false
        }).on('error', function(e) {
            console.log(e);
        }))
        .pipe($.concat('foundation.js'))
        .pipe(gulp.dest('./build/assets/js/'))
    ;

    // App JavaScript
    return gulp.src(appJS)
        //.pipe($.uglify({
        //  beautify: false,
        //  mangle: false
        //}).on('error', function(e) {
        //  console.log(e);
        //}))
        //.pipe($.concat('app.js'))
        .pipe(gulp.dest('./build/assets/js/'))
        ;
});

// Copies your app's page templates
gulp.task('copy-templates', ['copy'], function() {
    return gulp.src('./client/templates/**/*.html')
        // Foundation's dynamic routing. Disabled as it's
        // only useful for simple apps and prototypes
        //.pipe(router({
        //  path: 'build/assets/js/routes.js',
        //  root: 'client'
        //}))
        .pipe(gulp.dest('./build/templates'));
});

// Copies your app's static libraries
gulp.task('libs', function() {
    return gulp.src(appLibs)
        .pipe(gulp.dest('./build/assets/libs'));
});

// Starts a test server, which you can view at http://localhost:8080
gulp.task('server:start', function() {
    $.connect.server({
        root: './build',
        middleware: function() {
            return [
                modRewrite(['^[^\\.]*$ /index.html [L]'])
            ];
        },
    });
});

// Builds your entire app once, without starting a server
gulp.task('build', function() {
    sequence('clean', ['copy', 'sass', 'uglify'], 'copy-templates', 'libs', function() {
        console.log("Successfully built.");
    })
});

// Default task: builds your app, starts a server, and recompiles assets when they change
gulp.task('default', ['build'], function() {
    // Watch Sass
    gulp.watch(['./client/assets/scss/**/*', './scss/**/*'], ['sass']);

    // Watch JavaScript
    gulp.watch(['./client/assets/js/**/*', './js/**/*'], ['uglify']);

    // Watch static files
    gulp.watch(['./client/**/*.*', '!./client/templates/**/*.*', '!./client/assets/{scss,js}/**/*.*'], ['copy']);
    gulp.watch(['./client/assets/css/**/*', './css/**/*'], ['libs']);

    // Watch app templates
    gulp.watch(['./client/templates/**/*.html'], ['copy-templates']);
});
