import { parseYaml } from './parser/yml';
import path from 'path';
import through from 'through2';
import { utdslOption } from './typings/index.d';
import { compiler } from './compiler';

const compile = (path: string, options: utdslOption) => {
    compiler(path);
};

module.exports = function (options: utdslOption) {
    const stream = through.obj(function (file, encoding, callback) {
        // 如果file类型不是buffer 退出不做处理
        if (!file.isBuffer()) {
            return callback();
        }

        compile(file.path, options || {});

        // 告诉stream引擎，已经处理完成
        callback();
    });

    return stream;
};

// const doc = parseYaml('/Users/guozeling/workspace/git/gulp-utdsl/src/__tests__/data/default-example.yaml');
// console.log(doc);
