import fs from 'fs-extra';
import { consoleOutput, isVariableExpressionsString } from './../common/utils';
import { ICommonObj, IOperationDesc, IParamsDesc, IDataParamsDesc, IIoListItem } from '../typings/index';
import _ from 'lodash';
import { getOutputTestFilePath, getImportFilePath } from '../common/file';
import { OPERATION, KEY_WORDS } from '../common/constants';

/**
 * 解析 IO 参数
 * @param IO
 */
export const paraseIO = (io: string[] = []): IOperationDesc => {
    const result: IOperationDesc = {
        operation: OPERATION.IO,
        ioList: [],
    };

    // 如果没有 IO 参数（即长度为零，则意味着没有参数）
    if (io.length === 0) {
        return result;
    }

    // 解析 IO 参数
    io.forEach((expressionItem) => {
        const ioItem: IIoListItem = {
            inputs: [],
            outputs: [],
        };
        // 验证下参数类型是否正确
        if (!_.isString(expressionItem)) {
            throw new Error(`输入的 io 参数为 ${io}, 需要为字符串，请使用(' 或 ") 包裹语法表达式.`);
        }

        // 将输入和输出划分开
        const inputAndOutput = expressionItem.split(KEY_WORDS.INPUT_TO_OUTPUT);

        if (inputAndOutput.length > 2) {
            throw new Error(
                `输入的 io 参数为 ${io}, 该表达式最多存在一个 ${KEY_WORDS.INPUT_TO_OUTPUT} 符号，如果是参数或表达式中含有该符号，请先从 data 的形式导入.`
            );
        }

        // 如果存在输入参数
        if (inputAndOutput.length >= 1) {
            const inputDescList = parseFuncParams(inputAndOutput[0].trim());
            if (inputDescList instanceof Error) {
                throw inputDescList;
            } else {
                ioItem.inputs = [...inputDescList];
            }
        }

        // 如果存在输出参数
        if (inputAndOutput.length >= 2) {
            const outputDescList = parseFuncParams(inputAndOutput[1].trim());
            if (outputDescList instanceof Error) {
                throw outputDescList;
            } else {
                ioItem.outputs = [...outputDescList];
            }
        }

        result.ioList?.push(ioItem);
    });

    return result;
};

/**
 * 解析数据描述语句
 * @param dataDesc 数据描述语句 如："({name: "zale"}, data:from:./data/data.js)"
 */
export const parseFuncParams = (dataDesc: string): IParamsDesc[] | Error => {
    const result: IParamsDesc[] = [];
    let lastRightSeparatorIndex = 0; // 最后一个正确的参数分隔符索引

    // 检查正确性
    if (!(dataDesc.startsWith('(') && dataDesc.endsWith(')'))) {
        return new Error(`参数语句： "${dataDesc}" 语法不正确，请修改。`);
    }

    for (let i = 1; i < dataDesc.length; i++) {
        if (dataDesc[i] !== ',' && i !== dataDesc.length - 1) {
            continue;
        }

        const expression = dataDesc.slice(lastRightSeparatorIndex + 1, i).trim();

        // 看下自从上一个分隔符到这里，是否是合法的 JS 表达式
        if (isVariableExpressionsString(expression)) {
            result.push({
                isJsVariable: true,
                expression,
            });
            lastRightSeparatorIndex = i;
            continue;
        }

        // 如果不是表达式，看看是否是外部数据导入的语法
        const dataParamsDesc = paraseDataParamsExpression(expression);
        if (dataParamsDesc.isValidate) {
            result.push({
                isExternalData: true,
                variableName: dataParamsDesc.variableName,
                path: dataParamsDesc.path,
            });
            lastRightSeparatorIndex = i;
            continue;
        }
    }

    // 有解析到参数
    if (result.length > 0) {
        if (lastRightSeparatorIndex === dataDesc.length - 1) {
            // 所有参数正确解析
            return result;
        } else {
            return new Error(`参数表达式 ${dataDesc} 存在无法解析的语法.`);
        }
    } else {
        if (dataDesc.slice(1, -1).trim().length > 0) {
            return new Error(`参数表达式 ${dataDesc} 存在无法解析的语法.`);
        } else {
            return result;
        }
    }
};

interface IParse {
    testDslAbsolutePath: string; // 测试 DSL 文件的绝对路径
    projectConfig: ICommonObj; // 项目的配置文件
    testCaseConfig: ICommonObj; // 测试 case 的配置
    prettierConfig: ICommonObj; // prettier 的配置
}

export const parse = (params: IParse): void => {
    const { testDslAbsolutePath, projectConfig, testCaseConfig, prettierConfig } = params;

    // zale TODO: test
    // console.log('params', JSON.stringify(params, undefined, 2));

    // 公共必填参数检查
    if (!_.isString(testCaseConfig.path)) {
        consoleOutput(`测试文件 ${testDslAbsolutePath} 的参数 path 不正确，跳过测试文件的生成.`);
        return;
    }

    testCaseConfig.cases.forEach((caseConfig: ICommonObj) => {
        // 生成的测试文件内容
        const contentDescList: IOperationDesc[] = [];

        // 输出的测试文件
        const outputTestFilePath = getOutputTestFilePath({
            filePath: testCaseConfig.path,
            testDslAbsolutePath,
            projectConfig,
            testCaseConfig: caseConfig,
        });

        // 获取待测试模块的路径
        const mainTestFileAbsolutePath = getImportFilePath({
            filePath: testCaseConfig.path,
            testFileAbsolutePath: outputTestFilePath,
            testDslAbsolutePath,
            projectConfig,
        });

        // 导入待测试的函数模块
        contentDescList.push({
            operation: OPERATION.IMPORT,
            path: mainTestFileAbsolutePath,
            variableName: caseConfig.name,
        });

        // 解析输出和输出 （IO）
        try {
            contentDescList.push(paraseIO(caseConfig.io));
        } catch (error) {
            consoleOutput(
                [
                    `测试 DSL 文件 ${testDslAbsolutePath} 的 ${caseConfig.name} 的 io 参数解析错误!`,
                    `详细信息：`,
                    error.message || '',
                ].join('\n')
            );
            return;
        }

        console.log('contentDescList', JSON.stringify(contentDescList, undefined, 2));
        // console.log('outputTestFilePath', outputTestFilePath);
        // console.log('mainTestFileAbsolutePath', mainTestFileAbsolutePath);

        // fs.outputFileSync(outputTestFilePath, content);

        // 看下文件是否存在，如果不存在则创建

        // const testPath = getImportFilePath({
        //     filePath: 'src/data/data.js',
        //     testFileAbsolutePath: outputTestFilePath,
        //     testDslAbsolutePath: testDslAbsolutePath,
        //     projectConfig,
        // });

        // console.log('outputTestFilePath', outputTestFilePath);
        // console.log('testPath', testPath);
    });

    return;
};

/**
 * 将表达式作为数据导入参数
 * @param expression 表达式
 */
export const paraseDataParamsExpression = (expression = ''): IDataParamsDesc => {
    if (expression.includes(KEY_WORDS.FROM)) {
        const splitList = expression.split(KEY_WORDS.FROM);
        const variableName = splitList[0];
        const dataPath = splitList[1];

        if (
            splitList.length === 2 &&
            typeof variableName === 'string' &&
            variableName.length > 0 &&
            typeof dataPath === 'string' &&
            dataPath.length > 0
        ) {
            return {
                isValidate: true,
                variableName,
                path: dataPath,
            };
        } else {
            return {
                isValidate: false,
                message: `表达式 "${expression}" 语法有误`,
            };
        }
    } else {
        return {
            isValidate: false,
            message: `表达式 "${expression}" 不存在数据从外部导入的语法`,
        };
    }
};
