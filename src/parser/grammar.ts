import fs from 'fs-extra';
import { consoleOutput, isVariableExpressionsString, isRepeat } from './../common/utils';
import {
    ICommonObj,
    IOperationDesc,
    IParamsDesc,
    IDataParamsDesc,
    IIoListItem,
    TParseFuncParamsResult,
    IExpressOperationDesc,
    IMatchOperationListItem,
    IParse,
    IParsePrefixContentParams,
} from '../typings/index';
import _ from 'lodash';
import path from 'path';
import { getOutputTestFilePath, getImportFilePath } from '../common/file';
import {
    OPERATION,
    KEY_WORDS,
    EXPRESSION_OPERATION_NAME_LIST,
    FUNCTION_PARAMS_COMPARE_OPERATION,
    FUNCTION_PARAMS_COMPARE_OPERATION_MAP,
    INVOKE_TYPE_LIST,
    EXPRESSION_OPERATION_MAP,
} from '../common/constants';
import { parseToCode } from './template';
import { formatContentDescList } from './data-adapter';
import { prettierCode } from '../common/index';
import { parseMocks } from './mocks';

/**
 * 显示具体的错误信息
 * @param testDslAbsolutePath
 * @param caseConfig
 * @param error
 */
export const showErrorMessage = (
    testDslAbsolutePath = '',
    caseConfig: ICommonObj,
    errorMessage = '',
    paramName = ''
): void => {
    consoleOutput(
        [
            `测试 DSL 文件 ${testDslAbsolutePath} 的 ${caseConfig.name} 的 ${paramName} 参数解析错误!`,
            `详细信息：`,
            errorMessage,
        ].join('\n')
    );
};

/**
 * 解析 IO 参数
 * @param IO
 */
export const paraseIO = (io: string[] = []): IOperationDesc[] => {
    const ioResult: IOperationDesc = {
        operation: OPERATION.IO,
        ioList: [],
    };
    let operationList: IOperationDesc[] = [];

    // 如果没有 IO 参数（即长度为零，则意味着没有参数）
    if (io.length === 0) {
        return [ioResult, ...operationList];
    }

    // 解析 IO 参数
    io.forEach((expressionItem) => {
        const ioItem: IIoListItem = {
            inputs: [],
            output: undefined,
        };
        // 验证下参数类型是否正确
        if (!_.isString(expressionItem)) {
            throw new Error(`输入的 io 参数为 ${expressionItem}, 需要为字符串，请使用(' 或 ") 包裹语法表达式.`);
        }

        // 将输入和输出划分开
        let inputAndOutput: string[] = [];
        let compareOperation = '';

        // 根据参数比较符号进行分割
        if (expressionItem.includes(FUNCTION_PARAMS_COMPARE_OPERATION.EQUAL)) {
            compareOperation = FUNCTION_PARAMS_COMPARE_OPERATION_MAP.EQUAL;
            inputAndOutput = expressionItem.split(FUNCTION_PARAMS_COMPARE_OPERATION.EQUAL);
        } else if (expressionItem.includes(FUNCTION_PARAMS_COMPARE_OPERATION.IS)) {
            compareOperation = FUNCTION_PARAMS_COMPARE_OPERATION_MAP.IS;
            inputAndOutput = expressionItem.split(FUNCTION_PARAMS_COMPARE_OPERATION.IS);
        }

        if (inputAndOutput.length > 2) {
            throw new Error(
                `输入的 io 参数为 ${expressionItem}, 该表达式最多存在一个 ${compareOperation} 符号，如果是参数或表达式中含有该符号，请先从 data 的形式导入.`
            );
        }

        // 如果存在输入参数
        if (inputAndOutput.length >= 1) {
            const inputDescList = parseFuncParams(inputAndOutput[0].trim());
            if (inputDescList instanceof Error) {
                throw inputDescList;
            } else {
                ioItem.inputs = [...inputDescList.ioDescList];
                operationList = operationList.concat(inputDescList.operationList);
            }
        }

        // 如果存在输出参数
        if (inputAndOutput.length >= 2) {
            const outputDescList = parseFuncParams(inputAndOutput[1].trim());
            if (outputDescList instanceof Error) {
                throw outputDescList;
            } else {
                // 如果输出参数的个数不是一个，则抛出错误
                if (outputDescList.ioDescList.length !== 1) {
                    throw new Error(`输入的 io  ${expressionItem} 中如果存在输出参数，那么该输出参数只能是一个.`);
                }
                ioItem.output = outputDescList.ioDescList[0];
                operationList = operationList.concat(outputDescList.operationList);
            }
        }

        ioItem.ioCompareType = compareOperation;
        ioResult.ioList?.push(ioItem);
    });

    return [ioResult, ...operationList];
};

/**
 * 解析数据描述语句
 * @param dataDesc 数据描述语句 如："({name: "zale"}, data:from:./data/data.js)"
 */
export const parseFuncParams = (dataDesc: string): TParseFuncParamsResult => {
    const result: TParseFuncParamsResult = {
        ioDescList: [],
        operationList: [],
    };
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
            result.ioDescList.push({
                isJsVariable: true,
                expression,
            });
            lastRightSeparatorIndex = i;
            continue;
        }

        // 如果不是表达式，看看是否是外部数据导入的语法
        const dataParamsDesc = paraseDataParamsExpression(expression);
        if (dataParamsDesc.isValidate) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { isValidate: _isValidate, asName, ...others } = dataParamsDesc;
            result.ioDescList.push({
                isExternalData: true,
                variableName: dataParamsDesc.variableName,
                path: dataParamsDesc.path,
                asName,
            });
            result.operationList.push({
                operation: OPERATION.IMPORT,
                asName,
                ...others,
            });
            lastRightSeparatorIndex = i;
            continue;
        }
    }

    // 有解析到参数
    if (result.ioDescList.length > 0) {
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

/**
 * 解析调用方式数据
 * @param invokeType 调用方式
 */
export const parseInvokeType = (invokeType: string): IOperationDesc[] => {
    const result: IOperationDesc[] = [];

    // 检查下 invoke_type 是否合法
    if (!INVOKE_TYPE_LIST.includes(invokeType)) {
        throw new Error(`暂不支持所输入的 invokeType 参数 ${invokeType}.`);
    }

    result.push({
        operation: OPERATION.INVOKE_TYPE,
        value: invokeType,
    });

    return result;
};

/**
 * 解析前置内容语法
 * @param params
 */
export const parsePrefixContent = (params: IParsePrefixContentParams): IOperationDesc[] => {
    const { prefixContent, outputTestFilePath, projectConfig, testDslAbsolutePath } = params;

    let content: string[] = [];
    const result: string[] = [];
    // 根路径
    const rootDir = path.relative(path.dirname(outputTestFilePath), projectConfig.filePathAbsolutePathPrefix);

    if (_.isArray(prefixContent)) {
        content = prefixContent;
    } else if (prefixContent) {
        content.push(prefixContent);
    }

    if (content.length === 0) {
        return [];
    }

    content.forEach((item, index) => {
        // 检查参数是否合法
        if (!_.isString(item)) {
            throw new Error(`参数 prefixContent 中的第 ${index} 项的类型为 ${typeof item}, 目前只支持字符串.`);
        }

        // 操作描述
        const operationDesc = parserExpressionOperationDesc(item);

        if (operationDesc instanceof Error) {
            throw operationDesc;
        }

        // 前缀模板文件路径
        const contentPath = getImportFilePath(
            {
                filePath: operationDesc[`:${EXPRESSION_OPERATION_MAP.FROM}:`],
                testFileAbsolutePath: '',
                testDslAbsolutePath,
                projectConfig,
            },
            false
        );

        // 检查下模板文件是否存在
        const isExistContentFile = fs.existsSync(contentPath);

        if (!isExistContentFile) {
            throw new Error(`参数 prefixContent 所指的文件路径 ${contentPath} 不存在.`);
        }

        const formattedContent = String(fs.readFileSync(contentPath)).replace(/<rootDir>/g, rootDir);

        result.push(formattedContent);
    });

    return [
        {
            operation: OPERATION.PREFIX_CONTENT,
            value: result.join('\n'),
        },
    ];
};

/**
 * 解析 this 参数
 * @param thisContent
 */
export const parserThis = (thisContent: string): IOperationDesc[] => {
    // 如果存在参数，但是类型不正确
    if (thisContent && !_.isString(thisContent)) {
        throw new Error(`参数 this 只支持字符串, 详细语法见文档.`);
    }

    // 解析操作描述
    const operationDesc = parserExpressionOperationDesc(thisContent);

    if (operationDesc instanceof Error) {
        throw operationDesc;
    }

    return [
        {
            operation: OPERATION.THIS,
            variableName: operationDesc.value,
            path: operationDesc[`:${EXPRESSION_OPERATION_MAP.FROM}:`],
            expression: operationDesc[`:${EXPRESSION_OPERATION_MAP.EXPRESSION}:`],
        },
    ];
};

/**
 * 解析主函数
 * @param params
 */
export const parse = (params: IParse): void => {
    const { testDslAbsolutePath, projectConfig, testCaseConfig, prettierConfig } = params;

    // zale TODO: test
    // console.log('testDslAbsolutePath', testDslAbsolutePath);
    // console.log('projectConfig', projectConfig);

    // 公共必填参数检查
    if (!_.isString(testCaseConfig.path)) {
        consoleOutput(`测试文件 ${testDslAbsolutePath} 的参数 path 不正确，跳过测试文件的生成.`);
        return;
    }

    testCaseConfig.cases.forEach((caseConfig: ICommonObj) => {
        // 生成对测试文件的描述对象
        let contentDescList: IOperationDesc[] = [];

        // 输出的测试文件
        const outputTestFilePath = getOutputTestFilePath({
            filePath: testCaseConfig.path,
            testDslAbsolutePath,
            projectConfig,
            testCaseConfig: caseConfig,
        });

        // console.log('outputTestFilePath', outputTestFilePath);

        // 导入待测试的函数模块
        contentDescList.push({
            operation: OPERATION.IMPORT,
            path: testCaseConfig.path,
            variableName: caseConfig.target,
        });

        // 解析输出和输出 （IO）
        try {
            contentDescList = contentDescList.concat(paraseIO(caseConfig.io));
        } catch (error) {
            showErrorMessage(testDslAbsolutePath, caseConfig, error.message || '', 'io');
            return;
        }

        // 解析调用类型 (invokeType)
        try {
            contentDescList = contentDescList.concat(parseInvokeType(caseConfig.invokeType));
        } catch (error) {
            showErrorMessage(testDslAbsolutePath, caseConfig, error.message || '', 'invokeType');
            return;
        }

        // 解析 mock 数据 (mock)
        try {
            contentDescList = contentDescList.concat(parseMocks(caseConfig.mocks));
        } catch (error) {
            showErrorMessage(testDslAbsolutePath, caseConfig, error.message || '', 'mocks');
            return;
        }

        // 解析 prefixContent 参数
        try {
            contentDescList = contentDescList.concat(
                parsePrefixContent({
                    prefixContent: caseConfig.prefixContent,
                    outputTestFilePath,
                    projectConfig,
                    testDslAbsolutePath,
                })
            );
        } catch (error) {
            showErrorMessage(testDslAbsolutePath, caseConfig, error.message || '', 'prefixContent');
            return;
        }

        // 解析 this 参数
        try {
            contentDescList = contentDescList.concat(parserThis(caseConfig.this));
        } catch (error) {
            showErrorMessage(testDslAbsolutePath, caseConfig, error.message || '', 'this');
            return;
        }

        // 格式化测试描述对象（比如对路径进行转换）
        const formattedContentDescList = formatContentDescList({
            contentDescList,
            testFileAbsolutePath: outputTestFilePath,
            testDslAbsolutePath,
            projectConfig,
        });

        // zale TODO: test
        console.log('formattedContentDescList', JSON.stringify(formattedContentDescList, undefined, 2));

        // 解析测试文件的描述对象, 生成代码
        const code = parseToCode(formattedContentDescList, caseConfig);

        // 执行代码的格式化(可能会存在语法错误导致格式化失败)
        const prettieredCode = prettierCode(code, prettierConfig);

        // 代码写入文件
        fs.outputFileSync(outputTestFilePath, prettieredCode instanceof Error ? code : prettieredCode);
    });

    return;
};

/**
 * 解析表达式成操作描述对象
 * @param expression 表达式
 */
export const parserExpressionOperationDesc = (expression = ''): IExpressOperationDesc | Error => {
    // 获取表达式的值
    expression = expression.trim();
    const firstOperationIndex = expression.indexOf(':');
    const expressionValue = expression.slice(0, firstOperationIndex);

    // 不存在操作符，整个表达式即为值 (值只能是纯文本)
    if (firstOperationIndex === -1) {
        return {
            value: expression,
        };
    }

    // 获取表达式中可能的操作索引值
    const matchOperationList: IMatchOperationListItem[] = [];
    const re = new RegExp(`:(${EXPRESSION_OPERATION_NAME_LIST.join('|')}):`, 'g');
    let match = null;
    while ((match = re.exec(expression)) != null) {
        matchOperationList.push({
            index: match.index,
            value: match[0],
        });
    }

    // 如果操作列表为0，则表示填写的没有被支持
    if (matchOperationList.length === 0) {
        return new Error(`表达式 "${expression}" 中的操作符都不被支持.`);
    }

    // 检查下表达式的内容是否重复，如果有相同的 key, 则报错，存在语法错误
    if (isRepeat(matchOperationList.map((item) => item.value))) {
        return new Error(`表达式 "${expression}" 中存在多个相同的操作符.`);
    }

    let result: IExpressOperationDesc = {
        value: '',
    };

    // 只有一个操作符的情况
    if (matchOperationList.length === 1) {
        const [value, operationValue] = expression.split(matchOperationList[0].value);
        result = {
            value,
            [matchOperationList[0].value]: operationValue,
        };
    } else {
        result.value = expressionValue;
        // 解析操作符
        matchOperationList.forEach((item, index) => {
            // 获取操作的值的索引位置
            const startIndex = item.index + item.value.length;
            const endIndex = matchOperationList[index + 1] ? matchOperationList[index + 1].index : expression.length;

            const operationValue = expression.slice(startIndex, endIndex);
            result[item.value] = operationValue;
        });
    }

    // 如果存在 expression 操作符号，要检查下 expression 对应的值是否是 js 表达式
    const expressionOperationValue = result[`:${EXPRESSION_OPERATION_MAP.EXPRESSION}:`];
    if (expressionOperationValue) {
        if (!isVariableExpressionsString(expressionOperationValue)) {
            return new Error(`expression 参数的值 "${expressionOperationValue}" 不是一个可执行的 JS 表达式.`);
        }
    }

    return result;
};

/**
 * 将表达式作为数据导入参数
 * @param expression 表达式
 */
export const paraseDataParamsExpression = (expression = ''): IDataParamsDesc => {
    // 解析操作描述
    const operationDesc = parserExpressionOperationDesc(expression);

    if (operationDesc instanceof Error || _.isUndefined(operationDesc[KEY_WORDS.FROM])) {
        return {
            isValidate: false,
            message: `表达式 "${expression}" 解析错误或不存在数据从外部导入的语法`,
        };
    }
    return {
        isValidate: true,
        path: operationDesc[KEY_WORDS.FROM],
        variableName: operationDesc.value,
        asName: operationDesc[KEY_WORDS.AS],
    };
};
