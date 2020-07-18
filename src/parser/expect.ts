import _ from 'lodash';
import { EXPECT_TYPE_MAP, OPERATION } from '../common/constants';
import { IExpectListItem, IOperationDesc } from '../typings/index';
import { parseFuncParams, parserExpressionOperationDesc } from './common';

/**
 * 解析 expect 参数
 * @param expect
 */
export const parseExpect = (expect: string | string[]): IOperationDesc[] => {
    const expectList: IExpectListItem[] = [];
    let expectExpressionList: string[] = [];
    let extraOperationDesc: IOperationDesc[] = [];

    if (_.isArray(expect)) {
        expectExpressionList = expect;
    } else {
        expectExpressionList.push(expect);
    }

    if (expectExpressionList.length === 0) {
        return [];
    }

    expectExpressionList.forEach((item, index) => {
        // 参数检测
        if (!_.isString(item)) {
            throw new Error(`输入的 expect 参数的第 ${index} 项的类型为 ${typeof item}, 需要为字符串.`);
        }

        let firstExpression = item;
        let secondExpression = '';
        // 如果包含 '--->' 分隔符，则表明前面的值是被 expect 的对象，后面的值表示预期的值
        if (item.includes('--->')) {
            const expressionList = item.split('--->');
            firstExpression = expressionList[0].trim();
            secondExpression = expressionList[1].trim();
        }

        // 解析第一个操作表达式
        const firstDesc = parserExpressionOperationDesc(firstExpression.trim());
        if (firstDesc instanceof Error) {
            throw firstDesc;
        }

        // 第二个作为函数参数解析
        const funcParamsDesc = parseFuncParams(secondExpression);
        if (funcParamsDesc instanceof Error) {
            throw funcParamsDesc;
        }

        const expectItem: IExpectListItem = {
            type: '',
            target: firstDesc.value,
        };

        // 设置预期值数据
        expectItem.expectParamsValue = funcParamsDesc.ioDescList;

        // 设置 expect 的类型
        const expectType = Object.values(EXPECT_TYPE_MAP).find((item) => {
            return !_.isUndefined(firstDesc[`:${item}:`]);
        });
        if (!expectType) {
            throw new Error(
                `expect语句 "${item}" 中没有支持的 expect 类型， expect 目前仅支持 ${Object.values(
                    EXPECT_TYPE_MAP
                ).join('、')}`
            );
        }
        expectItem.type = expectType;

        // expect 为 call 时并且值为 [x][y] 格式的时候，需要解析出是第几次调用以及参数的位置
        const callValueReg = /\[\d+\]\[\d+\]/g;
        const callValue = (firstDesc[`:${EXPECT_TYPE_MAP.CALL}:`] || '').trim();
        if (expectItem.type === EXPECT_TYPE_MAP.CALL && callValue.length > 0 && callValueReg.test(callValue)) {
            expectItem.callTimeAndPosition = callValue;
        }

        expectList.push(expectItem);
        if (funcParamsDesc.operationList.length > 0) {
            extraOperationDesc = extraOperationDesc.concat(funcParamsDesc.operationList);
        }
    });

    return [
        {
            operation: OPERATION.EXPECT,
            expectList,
        },
        ...extraOperationDesc,
    ];
};
