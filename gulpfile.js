const gulp = require('gulp')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const sass = require('gulp-sass')
const maps = require('gulp-sourcemaps')
const del = require('del')
const autoprefixer = require('gulp-autoprefixer')
const cssmin = require('gulp-cssmin')

gulp.task('concatScripts', () => gulp.src([
	'src/Assets/js/jquery-3.3.1.slim.min.js',
	'src/Assets/js/popper.min.js',
	'src/Assets/js/bootstrap.min.js',
])
	.pipe(maps.init())
	.pipe(concat('scripts.js'))
	.pipe(maps.write('./'))
	.pipe(gulp.dest('src/Assets/tmp')))

gulp.task('minifyScripts', gulp.series([ 'concatScripts' ], () => gulp.src('src/Assets/tmp/scripts.js')
	.pipe(uglify())
	.pipe(rename('scripts.min.js'))
	.pipe(gulp.dest('public/js'))))

gulp.task('compileSass', () => gulp.src('src/Assets/css/main.scss')
	.pipe(maps.init({ loadMaps: true }))
	.pipe(sass().on('error', sass.logError))
	.pipe(autoprefixer())
	.pipe(maps.write('./'))
	.pipe(gulp.dest('src/Assets/css')))

gulp.task('minifyCss', () => Promise.all([
	gulp.src('src/Assets/css/main.css')
		.pipe(cssmin())
		.pipe(rename('styles.min.css'))
		.pipe(gulp.dest('public/css')),
	gulp.src('src/Assets/css/main.css.map')
		.pipe(rename('styles.min.css.map'))
		.pipe(gulp.dest('public/css')),
]))

gulp.task('clean', () => del([ 'public/js', 'public/css' ]))

gulp.task('postClean', () => del([ 'src/Assets/tmp' ]))

gulp.task('build', gulp.series([ 'clean', 'minifyScripts', 'compileSass', 'minifyCss', 'postClean' ]))

gulp.task('watch', gulp.series([ 'build' ], () => {
	gulp.watch('src/Assets/css/*/*.scss', gulp.series('compileSass'))
	gulp.watch('src/Assets/css/main.css', gulp.series('minifyCss'))
	gulp.watch('src/Assets/js/*.js', gulp.series('minifyScripts'))
}))
