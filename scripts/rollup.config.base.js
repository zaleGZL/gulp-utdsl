import path from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import replace from '@rollup/plugin-replace';
import projectConfig from './project.config';

const extensions = ['.js', '.ts'];
const resolve = function (...args) {
    return path.resolve(__dirname, ...args);
};

export default {
    input: resolve('../src/index.ts'),
    plugins: [
        typescript({
            tsconfig: path.resolve(__dirname, '../tsconfig.json'),
            exclude: 'node_modules/**',
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        }),
        projectConfig.bundleNodeModules
            ? nodeResolve({
                  extensions,
              })
            : null,
        projectConfig.bundleNodeModules
            ? commonjs({
                  include: 'node_modules/**',
              })
            : null,
        babel({
            exclude: 'node_modules/**',
            extensions,
            babelHelpers: 'runtime',
        }),
    ].filter((item) => !!item),
};
