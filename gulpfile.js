'use strict';
/* eslint-env node */

const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const eslint = require('gulp-eslint');
const jasmine = require('gulp-jasmine-phantom');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');

gulp.task('default', ['styles', 'copy-html',
 'copy-images', 'scripts'], function() {
    gulp.watch('css/**/*.css', ['styles']);
    gulp.watch('js/**/*.js', ['scripts']);
    gulp.watch('/*.html', ['copy-html']);
    gulp.watch('img/*', ['copy-images']);

    browserSync.init({
        server: './',
    });
});

gulp.task('styles', function() {
    gulp.src('sass/**/*.scss')
        .pipe(sass({
            outputStyle: 'compressed',
        }).on('error', sass.logError))
        .pipe(
            autoprefixer({
                browsers: ['last 2 versions'],
            })
        )
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.stream());
});

gulp.task('copy-html', function() {
    gulp.src('./*.html')
        .pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function() {
    gulp.src('img/*')
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()],
        }))
        .pipe(gulp.dest('./dist/img'));
});

gulp.task('lint', function() {
    return (
        gulp
        .src(['js/**/*.js'])
        // eslint() attaches the lint output to the eslint property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failOnError last.
        .pipe(eslint.failOnError())
    );
});

gulp.task('scripts', function() {
    gulp.src('js/**/*.js')
        .pipe(babel())
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('tests', function() {
    gulp.src('jasmine/spec/restaurant.js').pipe(
        jasmine({
            integration: true,
            vendor: 'js/**/*.js',
        })
    );
});
