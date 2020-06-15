import { IUtdslConfig, IMetaInfo, IOperationDesc } from '../typings/index.d';
import { defaultMetaInfo, defaultOperationDesc } from './defaultValue';
import { parseFireEventsTestGrammar } from './fireEvent';
import { cloneDeepWith } from 'lodash';

/**
 * 获取该测试用例的 meta 信息
 *
 * @param {string[]} [grammarList=[]]
 */
export const getMetaInfo = (grammarList: string[] = []): IMetaInfo => {
    const result: IMetaInfo = cloneDeepWith(defaultMetaInfo);

    const metaGrammar = grammarList.find((item) => {
        return item.startsWith('meta:');
    });

    if (!metaGrammar) {
        return result;
    }

    // 键值对字符串列表
    const keyValueList = metaGrammar
        .replace(/^\s*meta:\s*/, '')
        .split(',')
        .map((item) => {
            return item.trim();
        });

    // 将键值对字符串列表转换为对象的形式
    keyValueList.forEach((item) => {
        const [key, value] = item.split('=');
        result[key] = value;
    });

    return result;
};

/**
 * 解析 DSL 语法的入口, 生成对应的操作对象描述
 * @param {string[]} [grammarList=[]]
 * @param {IUtdslConfig} config
 */
export const parse = (grammarList: string[] = [], config: IUtdslConfig): IOperationDesc[] | null => {
    const metaInfo = getMetaInfo(grammarList);
    const result: IOperationDesc[] = [];

    // 如果没有测试类型，跳过这个测试用例的解析
    if (!metaInfo.testType) {
        return null;
    }

    // 解析语法
    grammarList.forEach((grammarItem) => {
        result.push(parseFireEventsTestGrammar(grammarItem, config));
    });

    return result;
};
