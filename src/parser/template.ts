import { IOperationDesc, IImportPathMap } from '../typings/index';
import { OPERATION } from '../common/constants';

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
 * 解析 invokeType 为 default 时的函数调用 expect 代码
 * @param descList
 */
export const parseDefaultFuncInvokeExpectCode = (descList: IOperationDesc[] = []): string => {
    return '';
};

export const parseTestCaseMainCode = (descList: IOperationDesc[] = []): string => {
    return '';
};

/**
 * 解析操作描述对象到代码
 * @param descList
 */
export const parseToCode = (descList: IOperationDesc[] = []): string => {
    const result: string[] = [];

    // // zale TODO: test
    console.log('descList', JSON.stringify(descList, undefined, 2));

    // import 模块的代码
    result.push(
        parseToImportModuleCode(
            descList.filter((item) => {
                return item.operation === OPERATION.IMPORT;
            })
        )
    );

    // TODO: 前置内容

    // 函数主体代码
    result.push(parseTestCaseMainCode(descList));

    return result.join('\n');
};
