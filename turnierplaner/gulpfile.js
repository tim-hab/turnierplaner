const gulp = require('gulp');
const inline = require('gulp-inline');

gulp.task('default', () => {
  return gulp.src('./dist/*/*/index.html').pipe(inline()).pipe(gulp.dest('./dist-single'));
});
