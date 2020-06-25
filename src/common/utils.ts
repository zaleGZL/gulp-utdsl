import fs from 'fs-extra';
import path from 'path';
import { ICommonObj } from '../typings/index';

/**
 * 转换文件路径到目录 (比如: /qwe/index.js -> /qwe/index)
 * @param filePath 绝对路径
 */
export const transFilePathToDirectory = (filePath: string): string => {
    const name = path.parse(filePath).name;
    return path.resolve(path.dirname(filePath), name);
};

/**
 * 根据两个路径分析两者的相对路径
 *
 * @param {*} relative
 * @param {*} absolute
 * @returns
 */
export const relativeDir = (relative: string, absolute: string): string => {
    const rela = relative.split(/\\|\//);
    rela.shift();
    const abso = absolute.split(/\\|\//);
    abso.shift();

    let num = 0;

    for (let i = 0; i < rela.length; i++) {
        if (rela[i] === abso[i]) {
            num++;
        } else {
            break;
        }
    }

    rela.splice(0, num);
    abso.splice(0, num);

    let str = '';

    for (let j = 0; j < abso.length - 1; j++) {
        str += '../';
    }

    if (!str) {
        str += './';
    }

    str += rela.join('/');

    return str;
};

/**
 * 自定义控制台输出的内容
 * @param content 需要在控制台输出的内容
 */
export const consoleOutput = (content: string): void => {
    console.log('========UTDSL========');
    console.log(content);
    console.log('========UTDSL========');
};

/**
 * 判断下表达式是否是一个有效的 JS 变量
 * @param expression 表达式
 */
export const isVariableExpressionsString = (expression: string): boolean => {
    if (expression.length === 0) {
        return false;
    }

    try {
        eval(`temp = ${expression}`);
    } catch (error) {
        return false;
    }

    return true;
};
