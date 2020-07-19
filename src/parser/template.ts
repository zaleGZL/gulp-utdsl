import { IOperationDesc, IImportPathMap, ICommonObj, IImportPathItem } from '../typings/index';
import {
    OPERATION,
    COMPARE_TYPE,
    MOCK_TYPE_MAP,
    INVOKE_TYPE_VALUE_MAP,
    INVOKE_TYPE_PROPERTY_MAP,
    INVOKE_PLACEHOLDER,
    EXPECT_TYPE_MAP,
    EXPECT_COMPARE_FUNC_MAP,
} from '../common/constants';
import _ from 'lodash';

/**
 * 获取 test case 的代码
 * @param innerCode
 * @param title
 */
export const getWrapperTestCaseCode = (innerCode: string, title: string): string => {
    return `
        test('${title}', async () => {
            jest.clearAllMocks();
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
export const parseInvokeCode = (descList: IOperationDesc[], caseConfig: ICommonObj, expectCode = ''): string => {
    const result: string[] = [];

    const invokeTypeDesc = descList.find((item) => {
        return item.operation === OPERATION.INVOKE_TYPE;
    });
    const ioDesc = descList.find((item) => {
        return item.operation === OPERATION.IO;
    });
    const thisDesc = descList.find((item) => {
        return item.operation === OPERATION.THIS;
    });

    // 不存在 invokeType
    if (!invokeTypeDesc || !invokeTypeDesc.invokeType) {
        return '';
    }

    const { invokeType } = invokeTypeDesc;
    switch (invokeType.type) {
        // 同步调用函数，判断输出的参数与预期的相符
        case INVOKE_TYPE_VALUE_MAP.SYNC: {
            if (!ioDesc || ioDesc.ioList?.length === 0) {
                return '';
            }

            // 组装函数的调用参数
            ioDesc.ioList?.forEach((item) => {
                let invokeExpression = '';

                const inputs = item.inputs
                    .map((inputItem: ICommonObj) => {
                        return getParamsVariable(inputItem);
                    })
                    .filter((item) => !!item);
                const outputVariable = item.output ? getParamsVariable(item.output) : undefined;
                const compareTypeName = item.ioCompareType
                    ? (COMPARE_TYPE as any)[item.ioCompareType as string]
                    : undefined;

                // 调用函数的代码
                let callCode = '';
                if (thisDesc && thisDesc.value) {
                    callCode = `.call(${thisDesc.value} ${inputs.length > 0 ? ',' : ''} ${inputs.join(',')})`;
                } else {
                    callCode = `(${inputs.join(',')})`;
                }

                invokeExpression = `${caseConfig.target}${callCode}`;

                // 看下是否是自定义调用语法
                if (invokeType.custom) {
                    invokeExpression = invokeType.custom.replace(INVOKE_PLACEHOLDER, invokeExpression);
                }

                // 存在比较函数，根据对应的参数调用函数，并判断对应的输出是否符合预期
                if (compareTypeName) {
                    invokeExpression = `expect(${invokeExpression}).${compareTypeName}(${outputVariable})`;
                }

                result.push(invokeExpression);
            });

            // 同步调用，直接在下一行插入 expect 的代码
            result.push(expectCode);

            break;
        }
        // promise 的形式调用
        case INVOKE_TYPE_VALUE_MAP.PROMISE: {
            // 默认在 resolve 进行预期行为的判断
            let promiseThenCode = `.then((res) => {
                ${expectCode}
            }, (res) => {
                expect(true).toBe(false);
            });
            `;
            // 如果定义为 reject, 则在 reject 里面进行判断
            if (invokeType.promsieResult === INVOKE_TYPE_PROPERTY_MAP.REJECT) {
                promiseThenCode = `.then((res) => {
                    expect(true).toBe(false);
                }, (res) => {
                    ${expectCode}
                });
                `;
            }

            // 解析函数调用的参数
            const inputs = _.get(ioDesc, 'ioList.0.inputs', [])
                .map((inputItem: ICommonObj) => {
                    return getParamsVariable(inputItem);
                })
                .filter((item: any) => !!item);

            let callCode = '';
            if (thisDesc && thisDesc.value) {
                callCode = `${caseConfig.target}.call(${thisDesc.value} ${inputs.length > 0 ? ',' : ''} ${inputs.join(
                    ','
                )})`;
            } else {
                callCode = `${caseConfig.target}(${inputs.join(',')})`;
            }

            // 调用的代码
            let invokeCode = callCode;
            if (invokeType.custom) {
                invokeCode = invokeType.custom.replace(INVOKE_PLACEHOLDER, invokeCode);
            }

            result.push(`return ${invokeCode}${promiseThenCode}`);
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
 * 解析 expect 的代码
 * @param descList
 * @param caseConfig
 */
export const parseExpectCode = (descList: IOperationDesc[], caseConfig: ICommonObj): string => {
    const result: string[] = [];

    const expectDesc = descList.find((item) => {
        return item.operation === OPERATION.EXPECT;
    });
    const mockDesc = descList.find((item) => {
        return item.operation === OPERATION.MOCKS;
    });

    // 不存在 expect 语句 （有可能是直接比较输入输出）
    if (!expectDesc || !expectDesc.expectList || expectDesc.expectList?.length === 0) {
        return '';
    }

    expectDesc.expectList.forEach((item) => {
        // 预期的参数值
        const expectParamsList: any = _.get(item, 'expectParamsValue', []);
        const expectValue = expectParamsList
            .map((item: any) => {
                let value: any = '';
                if (item.isJsVariable) {
                    value = item.expression;
                }
                if (item.isExternalData) {
                    value = item.variableName;
                }
                return value;
            })
            .filter((item: any) => {
                return item !== '' && typeof item !== 'undefined';
            })
            .join(',');

        // 对应的比较表达式
        const compareFunc = EXPECT_COMPARE_FUNC_MAP[item.compare];

        // 如果是对 mock 文件的对象进行 expect, 需要获取到实际被 expect 的对象
        const targetModule = _.get(mockDesc, 'mockList', []).find((mockItem: any) => {
            return item.target && mockItem.targetName === item.target;
        });

        const target = targetModule ? `${targetModule.targetModuleName}.${item.target}` : item.target;

        switch (item.type) {
            // 默认
            case EXPECT_TYPE_MAP.DEFAULT: {
                result.push(`expect(${target}).${compareFunc}(${expectValue});`);
                break;
            }
            // 调用次数
            case EXPECT_TYPE_MAP.TIME: {
                result.push(`expect(${target}).toBeCalledTimes(${expectValue});`);
                break;
            }
            // 以xx参数的形式调用
            case EXPECT_TYPE_MAP.CALL: {
                // 指定了是第几次调用以及参数的位置
                if (item.position) {
                    result.push(`expect(${target}.mock.calls${item.position}).${compareFunc}(${expectValue});`);
                } else {
                    result.push(`expect(${target}).toHaveBeenCalledWith(${expectValue});`);
                }
                break;
            }
        }
    });

    return result.join('\n');
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

    // mocks 对象的代码 (type 为 function)
    const funMockCode = parseFuncTypeMockCode(descList, caseConfig);

    // mocks 对象的代码 (type 为 file)
    const fileMockCode = parseFileTypeMockCode(descList, caseConfig);

    // mocks 对象的代码 (type 为 variable)
    const variableMockCode = parseVariableTypeMockCode(descList, caseConfig);

    // expect 的代码
    const expectCode = parseExpectCode(descList, caseConfig);

    // 函数主体代码
    const invokeCode = parseInvokeCode(descList, caseConfig, expectCode);

    // 按顺序组合后的代码
    const mainCode = [variableMockCode, funMockCode, invokeCode];

    // 合并 testCase 中的代码
    testCaseCode = getWrapperTestCaseCode(mainCode.join('\n'), caseConfig.name);

    result.push(fileMockCode);
    // prefixContent 的代码
    result.push(parsePrefixContentCode(descList, caseConfig));
    result.push(testCaseCode);

    return result.join('\n');
};
