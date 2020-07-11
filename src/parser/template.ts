import { IOperationDesc, IImportPathMap, ICommonObj, IImportPathItem } from '../typings/index';
import { OPERATION, INVOKE_TYPE_MAP, COMPARE_TYPE, MOCK_TYPE_MAP } from '../common/constants';
import _ from 'lodash';

/**
 * 获取 test case 的代码
 * @param innerCode
 * @param title
 */
export const getWrapperTestCaseCode = (innerCode: string, title: string): string => {
    return `
        test('${title}', () => {
            ${innerCode}
        })
    `;
};

/**
 * 解析描述对象到import模块的代码
 * @param descList
 */
export const parseToImportModuleCode = (ioDescList: IOperationDesc[] = []): string => {
    const result: string[] = [];
    const importPathMap: IImportPathMap = {};

    // zale TODO: test
    // console.log('ioDescList', ioDescList);

    // 格式化数据，并合并相同的路径变量导入
    ioDescList.forEach((item) => {
        const { path, variableName, asName, moduleAsName } = item;

        // 路径或者变量名称有任何一个不存在，则跳过
        if (!(path && (variableName || moduleAsName))) {
            return;
        }

        const newDesc = {
            variableName,
            moduleAsName,
            asName,
        };

        if (!importPathMap[path]) {
            importPathMap[path] = [newDesc as IImportPathItem];
            return;
        }

        const isExist = importPathMap[path].find((item) => {
            return item.variableName === variableName;
        });

        if (isExist) {
            return;
        } else {
            importPathMap[path].push(newDesc as IImportPathItem);
        }
    });

    // zale TODO: test
    // console.log('importPathMap', importPathMap);

    Object.keys(importPathMap).forEach((pathItem) => {
        const variableList = importPathMap[pathItem];
        const pathCode = `"${pathItem}";`;
        let defaultImportCode = '';
        let moduleNameSpaceImportCode = '';

        // 看下是否存在默认导出
        const defaultImport = variableList.find((item) => {
            return item.asName && item.variableName === 'default';
        });

        // 看下是否有命名空间导出
        const moduleImport = variableList.find((item) => {
            return !_.isUndefined(item.moduleAsName);
        });
        if (moduleImport) {
            moduleNameSpaceImportCode = `* as ${moduleImport.moduleAsName}`;
        }

        // 存在默认导出
        if (defaultImport) {
            defaultImportCode = `${defaultImport.asName}, `;
        }

        // 非默认导出的变量
        const noImportVariableCode = variableList
            .filter((item) => {
                return item.variableName !== 'default';
            })
            .map((item) => {
                return item.asName ? `${item.variableName} as ${item.asName}` : item.variableName;
            })
            .join(', ');
        const namedImportCode = noImportVariableCode ? `{ ${noImportVariableCode} }` : '';

        result.push(`import ${moduleNameSpaceImportCode} ${defaultImportCode} ${namedImportCode} from ${pathCode}`);
    });

    return result.join('\n');
};

/**
 * 获取参数变量
 * @param dataParam
 */
export const getParamsVariable = (dataParam: ICommonObj): any => {
    if (dataParam.isJsVariable) {
        return dataParam.expression;
    } else if (dataParam.isExternalData) {
        return dataParam.asName || dataParam.variableName;
    } else {
        return '';
    }
};

/**
 * 解析 invokeType 为 default 时的函数调用 expect 代码
 * @param descList
 */
export const parseInvokeTypeCode = (descList: IOperationDesc[], caseConfig: ICommonObj): string => {
    const result: string[] = [];

    const invokeTypeDesc = descList.find((item) => {
        return item.operation === OPERATION.INVOKE_TYPE;
    });

    // 不存在 invokeType
    if (!invokeTypeDesc) {
        return '';
    }

    switch (invokeTypeDesc.value) {
        // 同步调用函数，判断输出的参数与预期的相符
        case INVOKE_TYPE_MAP.DEFAULT: {
            const ioDesc = descList.find((item) => {
                return item.operation === OPERATION.IO;
            });

            if (!ioDesc || ioDesc.ioList?.length === 0) {
                return '';
            }

            // 组装函数的调用参数
            ioDesc.ioList?.forEach((item) => {
                const inputs = item.inputs
                    .map((inputItem: ICommonObj) => {
                        return getParamsVariable(inputItem);
                    })
                    .filter((item) => !!item);
                const outputVariable = item.output ? getParamsVariable(item.output) : undefined;
                const compareTypeName = item.ioCompareType
                    ? (COMPARE_TYPE as any)[item.ioCompareType as string]
                    : undefined;

                // 存在比较函数，根据对应的参数调用函数，并判断对应的输出是否符合预期
                if (compareTypeName) {
                    result.push(
                        `expect(${caseConfig.target}(${inputs.join(',')})).${compareTypeName}(${outputVariable})`
                    );
                }
            });

            break;
        }
    }

    return result.join('\n');
};

/**
 * 解析 mock （类型为 type）的描述对象到代码
 * @param descList
 * @param caseConfig
 */
export const parseFuncTypeMockCode = (descList: IOperationDesc[], caseConfig: ICommonObj): string => {
    const result: string[] = [];
    const mockDesc = descList.find((item) => {
        return item.operation === OPERATION.MOCKS;
    });

    // 不存在 mock 语法
    if (!mockDesc) {
        return '';
    }

    // 解析 mock 类型为函数的列表
    (mockDesc.mockList || [])
        .filter((item) => {
            return item.type === MOCK_TYPE_MAP.FUNCTION;
        })
        .forEach((mockItem) => {
            const { targetModuleName, targetName, mockExpression, mockName } = mockItem;

            if (mockExpression) {
                // 内联的 Mock 表达式
                result.push(`jest.spyOn(${targetModuleName}, '${targetName}').mockImplementation(${mockExpression})`);
            } else if (mockName) {
                // 外部导入的 Mock 函数
                result.push(`jest.spyOn(${targetModuleName}, '${targetName}').mockImplementation(${mockName})`);
            }
        });

    return result.join('\n');
};

/**
 * 解析 mock （类型为 type）的描述对象到代码
 * @param descList
 * @param caseConfig
 */
export const parseFileTypeMockCode = (descList: IOperationDesc[], caseConfig: ICommonObj): string => {
    const result: string[] = [];
    const mockDesc = descList.find((item) => {
        return item.operation === OPERATION.MOCKS;
    });

    // 不存在 mock 语法
    if (!mockDesc) {
        return '';
    }

    // 解析 mock 类型为文件
    (mockDesc.mockList || [])
        .filter((item) => {
            return item.type === MOCK_TYPE_MAP.FILE;
        })
        .forEach((mockItem) => {
            const { targetPath, needOriginModule, mockName, mockExpression } = mockItem;
            let mockModuleContent = '{}';

            if (mockExpression) {
                mockModuleContent = mockExpression;
            } else {
                mockModuleContent = mockName || mockModuleContent;
            }

            result.push(`
                jest.mock('${targetPath}', () => {
                    return {
                        ${needOriginModule ? `...(jest.requireActual('${targetPath}')),` : ''}
                        ...${mockModuleContent},
                    }
                })
            `);
        });

    return result.join('\n');
};

/**
 * 解析 mock （类型为 variable）的描述对象到代码
 * @param descList
 * @param caseConfig
 */
export const parseVariableTypeMockCode = (descList: IOperationDesc[], caseConfig: ICommonObj): string => {
    const result: string[] = [];
    const mockDesc = descList.find((item) => {
        return item.operation === OPERATION.MOCKS;
    });

    // 不存在 mock 语法
    if (!mockDesc) {
        return '';
    }

    // 解析 mock 类型为函数的列表
    (mockDesc.mockList || [])
        .filter((item) => {
            return item.type === MOCK_TYPE_MAP.VARIABLE;
        })
        .forEach((mockItem) => {
            const { targetName, mockName, mockExpression } = mockItem;

            if (mockExpression) {
                // 内联的 Mock 表达式
                result.push(`${targetName} = jest.fn(${mockExpression})`);
            } else if (mockName) {
                result.push(`${targetName} = jest.fn(${mockName})`);
            }
        });

    return result.join('\n');
};

/**
 * 解析前缀内容代码
 * @param descList
 * @param caseConfig
 */
export const parsePrefixContentCode = (descList: IOperationDesc[], caseConfig: ICommonObj): string => {
    const desc = descList.find((item) => {
        return item.operation === OPERATION.PREFIX_CONTENT;
    });

    if (desc) {
        return desc.value || '';
    } else {
        return '';
    }
};

/**
 * 解析操作描述对象到代码
 * @param descList
 */
export const parseToCode = (descList: IOperationDesc[] = [], caseConfig: ICommonObj): string => {
    const result: string[] = [];
    let testCaseCode = '';

    // zale TODO: test
    // console.log('descList', JSON.stringify(descList, undefined, 2));
    // console.log('caseConfig', JSON.stringify(caseConfig, undefined, 2));

    // import 模块的代码
    result.push(
        parseToImportModuleCode(
            descList.filter((item) => {
                return item.operation === OPERATION.IMPORT;
            })
        )
    );

    // prefixContent 的代码
    result.push(parsePrefixContentCode(descList, caseConfig));

    // mocks 对象的代码 (type 为 function)
    const funMockCode = parseFuncTypeMockCode(descList, caseConfig);

    // mocks 对象的代码 (type 为 file)
    const fileMockCode = parseFileTypeMockCode(descList, caseConfig);

    // mocks 对象的代码 (type 为 variable)
    const variableMockCode = parseVariableTypeMockCode(descList, caseConfig);

    // 函数主体代码
    const invokeTypeCode = parseInvokeTypeCode(descList, caseConfig);

    // 按顺序组合后的代码
    const mainCode = [variableMockCode, funMockCode, invokeTypeCode];

    // 合并 testCase 中的代码
    testCaseCode = getWrapperTestCaseCode(mainCode.join('\n'), caseConfig.name);

    result.push(fileMockCode);
    result.push(testCaseCode);

    return result.join('\n');
};
