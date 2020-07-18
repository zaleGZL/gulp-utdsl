import _ from 'lodash';
import { EXPRESSION_OPERATION_MAP, EXPRESSION_OPERATION_NAME_LIST, KEY_WORDS, OPERATION } from '../common/constants';
import { isRepeat, isVariableExpressionsString } from '../common/utils';
import {
    IDataParamsDesc,
    IExpressOperationDesc,
    IMatchOperationListItem,
    TParseFuncParamsResult,
} from '../typings/index';

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

    // 如果没有写括号，自动补齐括号
    if (!(dataDesc.startsWith('(') && dataDesc.endsWith(')'))) {
        dataDesc = `(${dataDesc})`;
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

/**
 * 解析表达式成操作描述对象
 * @param expression 表达式
 * @param operationNameList 支持的操作属性列表
 */
export const parserExpressionOperationDesc = (
    expression = '',
    operationNameList = EXPRESSION_OPERATION_NAME_LIST
): IExpressOperationDesc | Error => {
    // 获取表达式的值
    expression = expression.trim();
    const firstOperationIndex = expression.indexOf(':');
    const expressionValue = expression.slice(0, firstOperationIndex);
    const isExpressionString = isVariableExpressionsString(expression);

    // 不存在操作符，整个表达式即为值 (值只能是纯文本)
    if (isExpressionString || firstOperationIndex === -1) {
        return {
            value: expression,
        };
    }

    // 获取表达式中可能的操作索引值
    const matchOperationList: IMatchOperationListItem[] = [];
    const re = new RegExp(`:(${operationNameList.join('|')}):`, 'g');
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
            [matchOperationList[0].value]: operationValue === '' ? 'default' : operationValue,
        };
    } else {
        result.value = expressionValue;
        // 解析操作符
        matchOperationList.forEach((item, index) => {
            // 获取操作的值的索引位置
            const startIndex = item.index + item.value.length;
            const endIndex = matchOperationList[index + 1] ? matchOperationList[index + 1].index : expression.length;

            const operationValue = expression.slice(startIndex, endIndex);
            result[item.value] = operationValue === '' ? 'default' : operationValue;
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
