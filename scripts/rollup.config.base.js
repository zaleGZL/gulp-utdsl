import path from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import { eslint } from 'rollup-plugin-eslint';
import replace from '@rollup/plugin-replace';
import projectConfig from './project.config';
import pkg from '../package.json';

const externalPackageList = Object.keys(pkg[projectConfig.externalPackage] || {});
const isDev = process.env.NODE_ENV === 'development';
const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const resolve = function (...args) {
    return path.resolve(__dirname, ...args);
};

export default {
    input: resolve('../src/index.ts'),
    external: projectConfig.useExternal ? externalPackageList : [],
    plugins: [
        // 验证导入的文件
        eslint({
            throwOnError: isDev ? false : true,
            throwOnWarning: false,
            include: ['src/**/*.ts'],
            exclude: ['node_modules/**'],
        }),
        typescript({
            tsconfig: path.resolve(__dirname, '../tsconfig.json'),
            exclude: 'node_modules/**',
            typescript: require('typescript'),
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        }),
        projectConfig.bundleNodeModules
            ? commonjs({
                  include: 'node_modules/**',
              })
            : null,
        projectConfig.bundleNodeModules
            ? nodeResolve({
                  extensions,
              })
            : null,
        babel({
            exclude: 'node_modules/**',
            extensions,
            babelHelpers: 'runtime',
        }),
    ].filter((item) => !!item),
};
