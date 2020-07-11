import _ from 'lodash';
import { EXPECT_TYPE_MAP, OPERATION } from '../common/constants';
import { IExpectListItem, IOperationDesc } from '../typings/index';
import { parserExpressionOperationDesc } from './grammar';

/**
 * 解析 expect 参数
 * @param expect
 */
export const parseExpect = (expect: string | string[]): IOperationDesc[] => {
    const expectList: IExpectListItem[] = [];
    let expectExpressionList: string[] = [];
    const extraOperationDesc: IOperationDesc[] = [];

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

        // 解析表达式
        // const expectDesc = parserExpressionOperationDesc(item.trim());

        // if (expectDesc instanceof Error) {
        //     throw expectDesc;
        // }

        // const expectItem: IExpectListItem = {
        //     target: expectDesc.value,
        //     type: '',
        // };

        // 如果存在 call 参数，并且参数的值为 [x][y] 的形式
        // const callValueReg = /\[\d+\]\[\d+\]/g;
        // const callValue = (expectDesc[`:${EXPECT_TYPE_MAP.CALL}:`] || '').trim();
        // if (callValue && callValueReg.test(callValue)) {
        //     expectItem.target = `${expectDesc.value}.mock.calls${callValue}`;
        // }

        // console.log('expectDesc', expectDesc);
    });

    return [
        {
            operation: OPERATION.EXPECT,
            expectList,
        },
        ...extraOperationDesc,
    ];
};
