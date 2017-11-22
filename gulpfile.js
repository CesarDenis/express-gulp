const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const runSequence = require('run-sequence');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

let dev = true;

gulp.task('styles', () => {
  return gulp.src('assets/styles/**/*.scss')
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.if(dev, $.sourcemaps.write()))
    .pipe($.if(!dev, $.cssnano({safe: true, autoprefixer: false})))
    .pipe(gulp.dest('src/public/styles'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
  return gulp.src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/bootstrap/dist/bootstrap.js',
    'assets/scripts/main.js'
  ])
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.concat('main.js'))
    .pipe($.babel())
    .pipe($.if(dev, $.sourcemaps.write('.')))
    .pipe($.if(!dev, $.uglify({compress: {drop_console: true}})))
    .pipe(gulp.dest('src/public/scripts'))
    .pipe(reload({stream: true}));
});

function lint(files) {
  return gulp.src(files)
    .pipe($.eslint({ fix: true }))
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint('assets/scripts/**/*.js')
    .pipe(gulp.dest('assets/scripts'));
});

gulp.task('images', () => {
  return gulp.src('assets/images/**/*')
    .pipe($.cache($.imagemin()))
    .pipe(gulp.dest('src/public/images'));
});

gulp.task('fonts', () => {
  return gulp.src('assets/fonts/**/*')
    .pipe(gulp.dest('src/public/fonts'));
});

gulp.task('clean', del.bind(null, [
  'src/public/fonts',
  'src/public/images',
  'src/public/scripts',
  'src/public/styles'
]));

gulp.task('serve', () => {
  runSequence(['clean'], ['styles', 'scripts', 'images', 'fonts'], () => {
    browserSync.init({
      notify: false,
      proxy: 'localhost:3000',
      port: 9000
    });

    gulp.watch([
      'src/views/**/*.pug',
      'src/public/images/**/*',
      'src/public/fonts/**/*'
    ]).on('change', reload);

    gulp.watch('assets/styles/**/*.scss', ['styles']);
    gulp.watch('assets/scripts/**/*.js', ['scripts']);
    gulp.watch('assets/images/**/*', ['images']);
    gulp.watch('assets/fonts/**/*', ['fonts']);
  });
});

gulp.task('serve:dist', ['default'], () => {
  browserSync.init({
    notify: false,
    proxy: 'localhost:3000',
    port: 9000
  });
});

gulp.task('default', () => {
  return new Promise(resolve => {
    dev = false;
    runSequence(['clean'], 'lint', 'styles', 'scripts', 'images', 'fonts', resolve);
  });
});
