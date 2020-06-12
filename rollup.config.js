import path from 'path';
import babel from 'rollup-plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import pkg from './package.json';
import { uglify } from 'rollup-plugin-uglify';
import merge from 'lodash.merge';

const extensions = ['.js', '.ts'];

const resolve = function (...args) {
    return path.resolve(__dirname, ...args);
};

// 打包任务的个性化配置
const jobs = {
    esm: {
        output: {
            format: 'esm',
            file: resolve(pkg.module),
        },
    },
    umd: {
        output: {
            format: 'umd',
            file: resolve(pkg.main),
            name: 'rem',
        },
    },
    min: {
        output: {
            format: 'umd',
            file: resolve(pkg.main.replace(/(.\w+)$/, '.min$1')),
            name: 'rem',
        },
        plugins: [uglify()],
    },
};

// 从环境变量获取打包特征
const mergeConfig = jobs[process.env.FORMAT || 'esm'];

module.exports = merge(
    {
        input: resolve('./src/index.ts'),
        output: {},
        plugins: [
            nodeResolve({
                extensions,
                modulesOnly: true,
            }),
            babel({
                exclude: 'node_modules/**',
                extensions,
            }),
        ],
    },
    mergeConfig
);
