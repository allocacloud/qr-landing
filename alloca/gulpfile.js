const gulp = require('gulp')
const nodemon = require('gulp-nodemon')
const replace = require('gulp-replace')
const rename = require('gulp-rename')
const sass = require('gulp-sass')(require('sass'))
const concat = require('gulp-concat')
const clean = require('gulp-clean')
const strip = require('gulp-strip-comments')
const rev = require('gulp-rev')
const uglify = require('gulp-uglify')
const include = require('gulp-include')

gulp.task('sass', cb => {
    return gulp.src([
            './sass/**/*.scss',
            '!./sass/assets/*.scss',
            '!./sass/components/**/*.scss'
        ])
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./static/styles'))
        .on('finish', cb)
})

gulp.task('sass:watch', cb => {
    gulp.watch('./sass/**/*.scss', gulp.parallel('sass'))
        .on('finish', cb)
})

gulp.task('js:concat', cb => {
    return gulp.src([
            './scripts/*.js',
            '!./scripts/service-worker.js'
        ])
        .pipe(include())
        .pipe(gulp.dest('./static/js'))
        .on('finish', cb)
})

gulp.task('js:watch', cb => {
    gulp.watch('./scripts/**/*.js', gulp.series('js:concat'))
        .on('finish', cb)
})

gulp.task('nodemon', cb => {
    let started = false
    return nodemon({
        script: 'server.js',
        env: {
            'NODE_ENV': 'development'
        },
        ext: 'js html'
    }).on('start', () => {
        if (!started) {
            cb()
            started = true
        }
    }).on('restart', () => {
        console.log('restarted!')
    })
})

gulp.task('js:concat-prod', cb => {
    gulp.src([
            './scripts/*.js',
            '!./scripts/service-worker.js'
        ])
        .pipe(include())
        .pipe(gulp.dest('./scripts/build'))
        .on('finish', cb)
})

gulp.task('sass:prod', cb => {
    gulp.src([
        './sass/**/*.scss',
        '!./sass/assets/*.scss',
        '!./sass/components/**/*.scss'
    ])
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rev())
        .pipe(gulp.dest('./static/styles'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./static/styles'))
        .on('finish', cb)
})

gulp.task('js:uglify', cb => {
    gulp.src('./scripts/build/*.js')
        .pipe(strip())
        .pipe(uglify().on('error', err => console.log(err)))
        .pipe(rev())
        .pipe(gulp.dest('./static/js'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./static/js'))
        .on('finish', cb)
})

gulp.task('clean', cb => {
    gulp.src(['./scripts/build/*', './static/js/*', './static/styles/*'])
        .pipe(clean())
        .on('finish', cb)
})

gulp.task('sw', cb => {
    var js = require('./static/js/rev-manifest.json')
    var css = require('./static/styles/rev-manifest.json')
    var files = [
        '/js/' + js['main.js'],
        '/styles/' + css['main/style.css'],
    ]
    gulp.src('./scripts/service-worker.js')
        .pipe(replace('{{version}}', new Date().getTime()))
        .pipe(replace('{{files}}', JSON.stringify(files)))
        .pipe(strip())
        .pipe(uglify().on('error', err => console.log(err)))
        .pipe(rename('sw.js'))
        .pipe(gulp.dest('./static/'))
        .on('finish', cb)
})



gulp.task('dev', gulp.parallel('sass', 'sass:watch', 'js:concat', 'js:watch', 'nodemon'))

gulp.task('deploy', gulp.series('clean', 'sass:prod', 'js:concat-prod', 'js:uglify', 'sw'))