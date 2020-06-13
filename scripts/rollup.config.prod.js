import filesize from 'rollup-plugin-filesize';
import { uglify } from 'rollup-plugin-uglify';
import { terser } from 'rollup-plugin-terser';
import baseConfig from './rollup.config.base';
import projectConfig from './project.config';
import pkg from '../package.json';
import path from 'path';

const packageName = projectConfig.libraryName || pkg.name.replace('-', '_').toUpperCase();

const banner =
    `${'/*!\n' + ' * '}${pkg.name}.js v${pkg.version}\n` +
    ` * (c) 2020-${new Date().getFullYear()} ${pkg.author}\n` +
    ` * Released under the MIT License.\n` +
    ` */`;

export default [
    // 非压缩版本
    {
        ...baseConfig,
        output: [
            {
                file: path.resolve(__dirname, '../', projectConfig.libPath, 'index.js'),
                format: 'umd',
                name: packageName,
                banner,
                sourcemap: true,
            },
            projectConfig.enabledOutputCjs
                ? {
                      file: path.resolve(__dirname, '../', projectConfig.libPath, 'index.cjs.js'),

                      format: 'cjs',
                      name: packageName,
                      banner,
                  }
                : null,
            {
                file: path.resolve(__dirname, '../', projectConfig.libPath, 'index.esm.js'),
                format: 'es',
                name: packageName,
                banner,
            },
        ].filter((item) => !!item),
        plugins: [...baseConfig.plugins, filesize()],
    },
    // 压缩版本
    projectConfig.isWebModule
        ? {
              ...baseConfig,
              output: [
                  {
                      file: path.resolve(__dirname, '../', projectConfig.libPath, 'index.min.js'),

                      format: 'umd',
                      name: packageName,
                      banner,
                  },
              ],
              plugins: [
                  ...baseConfig.plugins,
                  uglify({
                      compress: {
                          drop_console: true,
                      },
                  }),
                  terser(),
                  filesize(),
              ],
          }
        : null,
].filter((item) => !!item);
