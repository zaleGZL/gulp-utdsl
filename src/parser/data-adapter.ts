import { IFormatContentDescList, IOperationDesc, ICommonObj } from '../typings/index';
import { getImportFilePath } from '../common/file';
import _ from 'lodash';

/**
 * 对测试用例描述对象进行格式化，比如进行路径的转换
 * @param params
 */
export const formatContentDescList = (params: IFormatContentDescList): IOperationDesc[] => {
    const { contentDescList, testFileAbsolutePath, testDslAbsolutePath, projectConfig } = params;

    /**
     * 递归转换数据
     * @param object
     * @param key
     */
    const recursiveTransform = (object: any, key = ''): any => {
        if (_.isPlainObject(object)) {
            const result: any = {};
            Object.keys(object).forEach((key) => {
                result[key] = recursiveTransform(object[key], key);
            });
            return result;
        } else if (_.isArray(object)) {
            return object.map((item) => {
                return recursiveTransform(item);
            });
        } else {
            return transformData(key, object);
        }
    };

    /**
     * 获取转换后的路径
     * @param path
     */
    const transformData = (key: string, value: any): string => {
        // 路径转换
        if ((key === 'path' || key.endsWith('Path')) && value) {
            return getImportFilePath({
                filePath: value,
                testFileAbsolutePath,
                testDslAbsolutePath,
                projectConfig,
            });
        } else {
            return value;
        }
    };

    return recursiveTransform(contentDescList);
};
