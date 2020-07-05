/**
 * mock 参数解析器
 */
import {
    IMocksItem,
    IOperationDesc,
    IParseFunctionTypesParams,
    IExpressOperationDesc,
    IParseTypesReturn,
    IMockListItem,
} from '../typings/index';
import _ from 'lodash';
import { OPERATION, MOCK_TYPE_LIST, MOCK_TYPE_MAP, EXPRESSION_OPERATION_MAP } from '../common/constants';
import { parserExpressionOperationDesc } from './grammar';
import { getHashNameFromFilePath } from '../common/parser';

/**
 * 解析 type 为 function 的 mock 语法
 * @param params
 */
export const parseFunctionTypes = (params: IParseFunctionTypesParams): IParseTypesReturn => {
    const { targetOperationDesc, mockOperationDesc, mockItem } = params;

    // 路径及模块名称解析
    const targetPath = targetOperationDesc[`:${EXPRESSION_OPERATION_MAP.FROM}:`];
    const moduleName =
        targetOperationDesc[`:${EXPRESSION_OPERATION_MAP.MODULE_AS}:`] || getHashNameFromFilePath(targetPath);

    const mockDesc = {
        type: MOCK_TYPE_MAP.FUNCTION,
        targetPath,
        targetModuleName: moduleName,
        targetName: targetOperationDesc.value,
        mockPath: mockOperationDesc[`:${EXPRESSION_OPERATION_MAP.FROM}:`],
        mockName: mockOperationDesc.value,
        mockExpression: mockOperationDesc[`:${EXPRESSION_OPERATION_MAP.EXPRESSION}:`],
    };
    const operationList: IOperationDesc[] = [
        {
            operation: OPERATION.IMPORT,
            path: targetPath,
            moduleAsName: moduleName,
        },
    ];

    // 如果 mock 的文件是从外部导入的， 不是内联表达式
    if (mockDesc.mockPath) {
        operationList.push({
            operation: OPERATION.IMPORT,
            path: mockDesc.mockPath,
            variableName: mockDesc.mockName,
        });
    }

    return {
        mockDesc,
        operationList,
    };
};

/**
 * 解析 mocks 参数
 * @param mocks
 */
export const parseMocks = (mocks: IMocksItem[]): IOperationDesc[] => {
    // zale TODO: test
    // console.log('mocks', mocks);

    const mockOperation: IOperationDesc = {
        operation: OPERATION.MOCKS,
        mockList: [],
    };
    let extraOperationList: IOperationDesc[] = [];

    // 没有 Mock 数据
    if (mocks.length === 0) {
        return [mockOperation];
    }

    // 解析 mocks 参数
    mocks.forEach((mockItem) => {
        const { target, mock, type, needOriginModule } = mockItem;

        // 参数验证
        if (!_.isString(target)) {
            throw new Error(`输入的 target 参数类型为 ${typeof target}, 需要为字符串.`);
        }
        if (!_.isString(mock)) {
            throw new Error(`输入的 mock 参数类型为 ${typeof mock}, 需要为字符串.`);
        }
        if (!MOCK_TYPE_LIST.includes(type)) {
            throw new Error(`输入的参数 type 有误（"${type}"），目前仅支持 ${MOCK_TYPE_LIST.join('、')}.`);
        }
        if (!_.isBoolean(needOriginModule)) {
            throw new Error(`输入的 needOriginModule 参数类型为 ${typeof mock}, 需要为布尔值.`);
        }

        // 解析 taget 和 mock 语句语法
        const targetOperationDesc = parserExpressionOperationDesc(target.trim());
        const mockOperationDesc = parserExpressionOperationDesc(mock.trim());

        // 如果解析存在错误，抛出错误
        [targetOperationDesc, mockOperationDesc].forEach((item) => {
            if (item instanceof Error) {
                throw item;
            }
        });

        switch (type) {
            // mock 类型为函数
            case MOCK_TYPE_MAP.FUNCTION: {
                const { mockDesc, operationList } = parseFunctionTypes({
                    targetOperationDesc: targetOperationDesc as IExpressOperationDesc,
                    mockOperationDesc: mockOperationDesc as IExpressOperationDesc,
                    mockItem,
                });
                (mockOperation.mockList as IMockListItem[]).push(mockDesc);
                extraOperationList = operationList;
                break;
            }
            // TODO: mock 类型为 file
            // TODO: mock 类型为 variable
        }
    });

    return [mockOperation, ...extraOperationList];
};
