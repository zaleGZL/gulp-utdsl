// import fs from 'fs-extra';
import path from 'path';
import { ICommonObj, IGetImportFilePath, IGetFileImportPath } from '../typings/index';
import { transFilePathToDirectory } from './utils';

/**
 * 获取输出的测试文件路径
 * @param params
 */
export const getOutputTestFilePath = (params: IGetFileImportPath): string => {
    const { filePath, testDslAbsolutePath, projectConfig, testCaseConfig, outputFileExt = 'js' } = params;

    // 先获取被测试文件的绝对路径
    let absoluteFilePath = '';
    if (
        filePath.startsWith('.') ||
        filePath.startsWith('..') ||
        filePath.startsWith('/') ||
        filePath.startsWith('\\')
    ) {
        absoluteFilePath = path.resolve(path.dirname(testDslAbsolutePath), filePath);
    } else {
        absoluteFilePath = path.resolve(projectConfig.filePathAbsolutePathPrefix, filePath);
    }

    // 获取被测试文件的绝对路径
    const fileRelativePath = path.relative(projectConfig.filePathAbsolutePathPrefix, absoluteFilePath);
    const outputTestFileSuffixPath = path.resolve('/', fileRelativePath);
    // zale TODO: 看下这里 win10 系统是否有问题 ("`.${")
    const outputTestFileDirectory = transFilePathToDirectory(
        path.resolve(projectConfig.testOutputAbsolutePath, `.${outputTestFileSuffixPath}`)
    );
    const outputTestFilePath = path.resolve(outputTestFileDirectory, `${testCaseConfig.name}.${outputFileExt}`);

    return outputTestFilePath;
};

/**
 * 获取导入的文件路径
 */
export const getImportFilePath = (params: IGetImportFilePath, isRelativeTestFile = true): string => {
    const { filePath, testFileAbsolutePath, testDslAbsolutePath, projectConfig } = params;

    // 先获取要 import 的文件的绝对路径
    let absoluteFilePath = '';
    if (
        filePath.startsWith('.') ||
        filePath.startsWith('..') ||
        filePath.startsWith('/') ||
        filePath.startsWith('\\')
    ) {
        absoluteFilePath = path.resolve(path.dirname(testDslAbsolutePath), filePath);
    } else {
        absoluteFilePath = path.resolve(projectConfig.filePathAbsolutePathPrefix, filePath);
    }

    if (isRelativeTestFile) {
        return path.relative(path.dirname(testFileAbsolutePath), absoluteFilePath);
    } else {
        return absoluteFilePath;
    }
};

// /**
//  * 往文件中写入数据
//  * @param outputFilePath 输出的文件路径
//  * @param content 待写入的内容
//  */
// export const writeContentToFile = (outputFilePath: string, content: string) => {
//     const directoryPath = path.dirname(outputFilePath);

//     // 确保目录存在
//     fs.ensureDirSync(directoryPath);

//     // 写入
// }
