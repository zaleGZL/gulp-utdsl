import through from 'through2';
import { utdslOption } from './typings/index.d';
import { add } from './common/utils';

const compile = (path: string, options: utdslOption) => {
    console.log('path', path);
    console.log('options', options);
    console.log(add(1, 2));
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
