'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');

var codePaths = ['src/**/*.js'];
var lintCodePaths = codePaths.concat(['test/**/*.js']);
var mochaOpts = { reporter: 'spec' };
var istanbulOpts = {};

// Register babel for JSX support
require('babel/register');
istanbulOpts.instrumenter = require('istanbul-react').Instrumenter;

gulp.task('lint', function() {
    return gulp.src(lintCodePaths)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('coveragePrepare', function() {
    return gulp.src(codePaths)
        .pipe(istanbul(istanbulOpts))
        .pipe(istanbul.hookRequire());
});

gulp.task('coverage', ['coveragePrepare'], function() {
    return getMochaStream().pipe(istanbul.writeReports());
});

gulp.task('mocha', getMochaStream);

gulp.task('test', ['lint', 'mocha']);
gulp.task('default', ['test']);

function getMochaStream() {
    return gulp.src('test/**/*.test.js')
        .pipe(mocha(mochaOpts));
}
