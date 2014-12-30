#!/usr/bin/env node

'use strict';

var browserify = require('browserify');
var watchify = require('watchify');
var ws = require('fs').createWriteStream;
var to5ify = require('6to5ify');
var lessify = require('node-lessify');

var bs = require('browser-sync');

var outDir = './public/';
var config = {
  browserify: {
    entryFile: './src/index.js',
    outFile: outDir + 'bundle.js',
    args: {
      // cache, packageCache and fullPaths are required for watchify
      cache: {},
      packageCache: {},
      fullPaths: true,
      paths: ['./src/'],
      debug: true
    }
  },
  browserSync: {
    server: {
      baseDir: outDir
    }
  }
};

var tasks = {
  build: function() {
    var args = {
      debug: false,
      fullPaths: false,
      paths: ['./src/']
    };

    browserify(args)
      .transform(to5ify.configure({
        experimental: true,
        modules: 'commonInterop'
      }))
      .transform(lessify)
      .add('6to5/polyfill')
      .require(config.browserify.entryFile, { entry: true })
      .transform({
        global: true
      }, 'uglifyify')
      .bundle()
      .on('error', console.error)
      .on('log', console.log)
      .pipe(ws(config.browserify.outFile));
  },
  watch: function() {
    var b = browserify(config.browserify.args)
      .transform(to5ify.configure({
        experimental: true,
        modules: 'commonInterop'
      }))
      .transform(lessify)
      .add('6to5/polyfill')
      .require(config.browserify.entryFile, { entry: true });

    var w = watchify(b);

    var rebundle = function() {
      w.bundle()
        .on('error', function(err) {
          var msg = '[browserify] ERROR: ' + err.message;
          if(bs.active) {
            // set a timeout, because the initial 'BrowserSync connected'
            // message helpfully squashes any other notifications on reload
            setTimeout(function() {
              bs.notify(msg, 10000);
            }, 1000);
          }
          console.error(msg);
        })
        .on('end', function() {
          if(bs.active) {
            bs.reload();
          }
        })
        .pipe(ws(config.browserify.outFile));
    };

    w.on('update', rebundle);
    w.on('log', console.log);

    rebundle();
  },
  serve: function() {
    bs(config.browserSync);
    tasks.watch();
  }
};

var task = process.argv.slice(2)[0];
if(!(task in tasks)) {
  console.log(
    'Invalid task! Possible tasks are:\n' +
    Object.keys(tasks).map(function(t) { return ' - ' + t; }).join('\n'));
}
else {
  tasks[task]();
}

