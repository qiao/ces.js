#!/usr/bin/env node

var fs         = require('fs'),
    path       = require('path'),
    uglify     = require('uglify-js'),
    browserify = require('browserify');

function build(dest, options) {
    options = options || {};

    var bundle = browserify({ exports: ['require'] });
    bundle.addEntry(__dirname + '/../index.js');

    var browserified = bundle.bundle();
    var namespaced   = 'var CES = (function() {' + browserified + 'return require("/index.js");})();';

    if (options.uglify) {
        fs.writeFileSync(dest, uglify.minify(namespaced, { fromString: true }).code);
    } else {
        fs.writeFileSync(dest, namespaced);
    }

    console.log('built', path.resolve(dest));
}

build(__dirname + '/../dist/ces-browser.js');
build(__dirname + '/../dist/ces-browser.min.js', { uglify: true });
