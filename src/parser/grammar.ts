import fs from 'fs-extra';
import { consoleOutput } from './../common/utils';
import {
    ICommonObj,
    IOperationDesc,
    IIoListItem,
    IParse,
    IParsePrefixContentParams,
    IInvokeType,
} from '../typings/index';
import _ from 'lodash';
import path from 'path';
import { getOutputTestFilePath, getImportFilePath } from '../common/file';
import {
    OPERATION,
    FUNCTION_PARAMS_COMPARE_OPERATION,
    FUNCTION_PARAMS_COMPARE_OPERATION_MAP,
    EXPRESSION_OPERATION_MAP,
    INVOKE_TYPE_PROPERTY_MAP,
    INVOKE_TYPE_VALUE_MAP,
    INVOKE_PLACEHOLDER,
} from '../common/constants';
import { parseToCode } from './template';
import { formatContentDescList } from './data-adapter';
import { prettierCode } from '../common/index';
import { parseMocks } from './mocks';
import { parseExpect } from './expect';
import { parseFuncParams, parserExpressionOperationDesc } from './common';

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
export const paraseIO = (io: string | string[]): IOperationDesc[] => {
    let ioList: string[] = [];
    const ioResult: IOperationDesc = {
        operation: OPERATION.IO,
        ioList: [],
    };
    let operationList: IOperationDesc[] = [];

    if (_.isArray(io)) {
        ioList = io;
    } else {
        ioList.push(io);
    }

    // 如果没有 IO 参数（即长度为零，则意味着没有参数）
    if (ioList.length === 0) {
        return [ioResult, ...operationList];
    }

    // 解析 IO 参数
    ioList.forEach((expressionItem) => {
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
        if (expressionItem.includes(FUNCTION_PARAMS_COMPARE_OPERATION.IS)) {
            compareOperation = FUNCTION_PARAMS_COMPARE_OPERATION_MAP.IS;
            inputAndOutput = expressionItem.split(FUNCTION_PARAMS_COMPARE_OPERATION.IS);
        } else if (expressionItem.includes(FUNCTION_PARAMS_COMPARE_OPERATION.EQUAL)) {
            compareOperation = FUNCTION_PARAMS_COMPARE_OPERATION_MAP.EQUAL;
            inputAndOutput = expressionItem.split(FUNCTION_PARAMS_COMPARE_OPERATION.EQUAL);
        } else {
            inputAndOutput = [expressionItem];
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
 * 解析调用方式数据
 * @param invokeType 调用方式
 */
export const parseInvokeType = (invokeType: string): IOperationDesc[] => {
    const result: IOperationDesc[] = [];

    if (!_.isString(invokeType)) {
        throw new Error(`输入的 invokeType 参数需要为字符串.`);
    }

    // 解析表达式
    const operationDesc = parserExpressionOperationDesc(invokeType.trim(), Object.values(INVOKE_TYPE_PROPERTY_MAP));

    if (operationDesc instanceof Error) {
        throw operationDesc;
    }

    // 检查下 value 是否被支持
    if (!Object.values(INVOKE_TYPE_VALUE_MAP).includes(operationDesc.value)) {
        throw new Error(
            `暂不支持输入的 invokeType "${operationDesc.value}", 目前仅支持 ${Object.values(INVOKE_TYPE_VALUE_MAP).join(
                ','
            )}`
        );
    }

    const customValue = operationDesc[`:${INVOKE_TYPE_PROPERTY_MAP.CUSTOM}:`] || undefined;
    const invokeTypeDesc: IInvokeType = {
        type: operationDesc.value,
        custom: customValue,
    };

    if (customValue && !customValue.includes(INVOKE_PLACEHOLDER)) {
        throw new Error(`invokeType 中的 custom 参数缺少 ${INVOKE_PLACEHOLDER} 字符串.`);
    }

    if (!_.isUndefined(operationDesc[`:${INVOKE_TYPE_PROPERTY_MAP.RESOLVE}:`])) {
        invokeTypeDesc.promsieResult = INVOKE_TYPE_PROPERTY_MAP.RESOLVE;
    }
    if (!_.isUndefined(operationDesc[`:${INVOKE_TYPE_PROPERTY_MAP.REJECT}:`])) {
        invokeTypeDesc.promsieResult = INVOKE_TYPE_PROPERTY_MAP.REJECT;
    }

    result.push({
        operation: OPERATION.INVOKE_TYPE,
        invokeType: invokeTypeDesc,
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

    const IOperationDesc: IOperationDesc[] = [
        {
            operation: OPERATION.THIS,
            value: operationDesc.value,
        },
    ];

    // 外部数据导入，需要添加 import
    if (operationDesc[`:${EXPRESSION_OPERATION_MAP.FROM}:`]) {
        IOperationDesc.push({
            operation: OPERATION.IMPORT,
            variableName: operationDesc.value,
            path: operationDesc[`:${EXPRESSION_OPERATION_MAP.FROM}:`],
        });
    }

    return IOperationDesc;
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

        // 解析 expect 参数
        try {
            contentDescList = contentDescList.concat(parseExpect(caseConfig.expect));
        } catch (error) {
            showErrorMessage(testDslAbsolutePath, caseConfig, error.message || '', 'expect');
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
        // console.log('formattedContentDescList', JSON.stringify(formattedContentDescList, undefined, 2));

        // 解析测试文件的描述对象, 生成代码
        const code = parseToCode(formattedContentDescList, caseConfig);

        // 执行代码的格式化(可能会存在语法错误导致格式化失败)
        const prettieredCode = prettierCode(code, prettierConfig);

        // 代码写入文件
        fs.outputFileSync(outputTestFilePath, prettieredCode instanceof Error ? code : prettieredCode);
    });

    return;
};
