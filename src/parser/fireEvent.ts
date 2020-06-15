import { defaultMetaInfo, defaultOperationDesc } from './defaultValue';
import { IMetaInfo, IOperationDesc, IUtdslConfig } from '../typings/index.d';
import { cloneDeepWith } from 'lodash';

/**
 * 解析 fireEvent 测试的语法
 *
 * @param {string[]} [grammar='']
 * @param {IUtdslConfig} config
 */
export const parseFireEventsTestGrammar = (grammar = '', config: IUtdslConfig): IOperationDesc => {
    const result: IOperationDesc = cloneDeepWith(defaultOperationDesc);

    // 注释语法
    if (grammar.startsWith('#')) {
        result.isComment = true;
        result.commentContent = grammar.slice(1).trim();
        return result;
    }

    // render 语法
    if (grammar.startsWith('render(')) {
    }

    return result;
};
