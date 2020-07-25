/* eslint-disable @typescript-eslint/no-var-requires */
const gulp = require('gulp');
const utdsl = require('gulp-utdsl');

const needUtdslFilePath = ['src/**/*.test.yaml', 'src/**/*.test.yml'];

gulp.task('utdsl', () => {
    return gulp.src(needUtdslFilePath).pipe(utdsl());
});

gulp.task(
    'utdsl:watch',
    gulp.series('utdsl', () => {
        return gulp.watch(needUtdslFilePath).on('change', function (obj) {
            return gulp.src(obj).pipe(utdsl());
        });
    })
);
