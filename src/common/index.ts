import fs from 'fs-extra';
import path from 'path';
import { ICommonObj } from '../typings/index';
import prettier from 'prettier';
import { defaultPrettierConfig } from './config';

/**
 * 获取 utdsl 的配置信息
 * 1. 先从 package.json 中获取 utdsl
 * 2. 如果 package.json 中没有，则查找 utdsl.config.js
 * @param projectPath 项目起始路径
 */
export const getUtdslConfigInfo = (projectPath: string): ICommonObj | null => {
    let config = null;

    const packageJsonFileExist = fs.existsSync(path.resolve(projectPath, 'package.json'));
    const utdslConfigExist = fs.existsSync(path.resolve(projectPath, 'utdsl.config.js'));

    if (utdslConfigExist) {
        config = require(path.resolve(projectPath, 'utdsl.config.js'));
    }

    if (packageJsonFileExist) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        config = require(path.resolve(projectPath, 'package.json')).utdsl || config || null;
    }

    return config;
};

/**
 * 获取 prettier 的配置（如果没有，使用 utdsl 默认的配置）
 * @param projectPath
 */
export const getPrettierConfig = (projectPath: string): ICommonObj => {
    const prettierJsFileList = [
        path.resolve(projectPath, 'prettier.config.js'),
        path.resolve(projectPath, '.prettierrc.js'),
    ];

    // 先从用户项目里面的获取 prettier 配置
    for (let i = 0; i < prettierJsFileList.length; i++) {
        const fileExist = fs.existsSync(prettierJsFileList[i]);
        if (fileExist) {
            return require(prettierJsFileList[i]);
        }
    }

    return defaultPrettierConfig;
};

/**
 * 利用 prettier 格式化代码
 * @param content
 * @param prettierConfig
 */
export const prettierCode = (content: string, prettierConfig: ICommonObj): any => {
    let formatCode = null;

    try {
        formatCode = prettier.format(content, {
            ...prettierConfig,
            parser: 'babel',
        });
    } catch (error) {
        formatCode = error;
    }

    return formatCode;
};
