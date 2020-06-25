import filesize from 'rollup-plugin-filesize';
import baseConfig from './rollup.config.base';
import pkg from '../package.json';
import projectConfig from './project.config';
import path from 'path';

const packageName = projectConfig.libraryName || pkg.name.replace('-', '_').toUpperCase();

export default [
    {
        ...baseConfig,
        output: [
            {
                file: path.resolve(__dirname, '../', projectConfig.libPath, 'index.js'),
                format: projectConfig.defaultFormat,
                name: packageName,
                strict: false,
            },
            projectConfig.enabledOutputCjs
                ? {
                      file: path.resolve(__dirname, '../', projectConfig.libPath, 'index.cjs.js'),

                      format: 'cjs',
                      name: packageName,
                      strict: false,
                  }
                : null,
            {
                file: path.resolve(__dirname, '../', projectConfig.libPath, 'index.esm.js'),
                format: 'es',
                name: packageName,
                strict: false,
            },
        ].filter((item) => !!item),
        plugins: [...baseConfig.plugins, filesize()],
    },
];
