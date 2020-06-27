import { IOperationDesc, IImportPathMap, ICommonObj } from '../typings/index';
import { OPERATION, INVOKE_TYPE_MAP, COMPARE_TYPE } from '../common/constants';

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

    // 格式化数据，并合并相同的路径变量导入
    ioDescList.forEach((item) => {
        const { path, variableName, asName } = item;

        // 路径或者变量名称有任何一个不存在，则跳过
        if (!(path && variableName)) {
            return;
        }

        const newDesc = {
            variableName,
            asName,
        };

        if (!importPathMap[path]) {
            importPathMap[path] = [newDesc];
            return;
        }

        const isExist = importPathMap[path].find((item) => {
            return item.variableName === variableName;
        });

        if (isExist) {
            return;
        } else {
            importPathMap[path].push(newDesc);
        }
    });

    Object.keys(importPathMap).forEach((pathItem) => {
        const variableList = importPathMap[pathItem];
        const pathCode = `"${pathItem}";`;
        let defaultImportCode = '';

        // 看下是否存在默认导出
        const defaultImport = variableList.find((item) => {
            return item.asName && item.variableName === 'default';
        });

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

        result.push(`import ${defaultImportCode} ${namedImportCode} from ${pathCode}`);
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

    // 函数主体代码
    const invokeTypeCode = parseInvokeTypeCode(descList, caseConfig);

    // 合并 testCase 中的代码
    testCaseCode = getWrapperTestCaseCode([invokeTypeCode].join('\n'), caseConfig.name);
    result.push(testCaseCode);

    return result.join('\n');
};
