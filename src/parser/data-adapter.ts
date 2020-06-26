import { IFormatContentDescList, IOperationDesc } from '../typings/index';
import { getImportFilePath } from '../common/file';

/**
 * 对测试用例描述对象进行格式化，比如进行路径的转换
 * @param params
 */
export const formatContentDescList = (params: IFormatContentDescList): IOperationDesc[] => {
    const { contentDescList, testFileAbsolutePath, testDslAbsolutePath, projectConfig } = params;
    return contentDescList.map((item) => {
        const result = {
            ...item,
        };

        // path 路径转换
        const needTransPathKey = ['path'];
        Object.keys(result).forEach((key) => {
            const value = (result as any)[key];
            if (needTransPathKey.includes(key) && value) {
                (result as any)[key] = getImportFilePath({
                    filePath: value,
                    testFileAbsolutePath,
                    testDslAbsolutePath,
                    projectConfig,
                });
            }
        });

        return result;
    });
};
