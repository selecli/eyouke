var gulp = require('gulp'),
	$ = require('gulp-load-plugins')({rename: {'gulp-rev-append': 'rev'}});

var pkg = require('./package.json');

var AUTOPREFIXER_BROWSERS = ["Android >= 4", "Explorer >= 10", "iOS >= 6"];

// 注释信息
var banner = '/*! <%= pkg.title %> v<%= pkg.version %> by YDCSS (c) ' +
	$.util.date(Date.now(), 'UTC:yyyy') + ' Licensed <%= pkg.license %>' + ' */ \n';

gulp.task('less', function () {
	gulp.src(['src/less/{ydui,main,photoswipe}.less'])
		.pipe($.plumber({errorHandler: $.notify.onError('Error: <%= error.message %>')}))
		.pipe($.less())
		.pipe($.autoprefixer({
			browsers: AUTOPREFIXER_BROWSERS, cascade: false
		}))
		.pipe(gulp.dest('src/css'))
		.pipe($.connect.reload())
		.pipe($.livereload());
});

gulp.task('concat', function () {
	gulp.src(['src/js/source/ydui.js', 'src/js/source/**/*.js'])
		.pipe($.concat('ydui.js'))
		.pipe(gulp.dest('src/js')).pipe($.connect.reload());//.pipe(connect.reload())
});

gulp.task('watch', function () {
	// $.livereload.listen();
	gulp.watch('src/less/**/*.less', ['less']);
	gulp.watch('src/js/source/**/*.js', ['concat']);
	gulp.watch(['src/html/**/*.html'], ['html']);
});

gulp.task('connect', function () {
	$.connect.server({
		// host: '192.168.1.172', //地址，可不写，不写的话，默认localhost
		port: 3000, //端口号，可不写，默认8000
		root: './src/', //当前项目主目录
		livereload: true //自动刷新
	});
});

gulp.task('build:css', function () {
	gulp.src(['src/less/{ydui,main,photoswipe}.less']).pipe($.sourcemaps.init())
		.pipe($.less())
		.pipe($.cssBase64({
			extensionsAllowed: ['.ttf']
		}))
		.pipe($.autoprefixer({
			browsers: AUTOPREFIXER_BROWSERS, cascade: false, remove: true
		}))
		.pipe($.sourcemaps.write('./'))
		.pipe($.cleanCss({keepSpecialComments: '*'}))
		.pipe($.header(banner, {pkg: pkg}))
		.pipe(gulp.dest('dist/css'));
});

gulp.task('html', function () {
	gulp.src(['src/html/**/*.html', 'src/index.html' ], {base: 'src'})
		.pipe($.connect.reload());
});


gulp.task('build:html', function () {
	gulp.src(['src/html/**/*.html', 'src/index.html' ], {base: 'src'})
	// .pipe($.rev())
		.pipe(gulp.dest('dist'));
});

gulp.task('build:images', function () {
	gulp.src(['src/images/*.*'], {base: 'src'})
		.pipe(gulp.dest('dist'));
});

gulp.task('build:uglify', function () {
	gulp.src(['src/js/{ydui.js,ydui.flexible.js,jquery.min.js,jquery.form.js,photoswipe.js,photoswipe-ui.js,fastclick.js}'])
		.pipe(gulp.dest('dist/js'));
});

gulp.task('dev', ['less', 'concat', 'watch','connect']);

gulp.task('default', ['build:css', 'build:uglify', 'build:html', 'build:images']);

// gulp.task('default', ['build:cssmin', 'build:uglify']);
