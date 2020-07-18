import { getUtdslConfigInfo, getPrettierConfig } from './common/index';
import { consoleOutput } from './common/utils';
import { defaultUtdslConfig, formatConfigData, combineDefaultTestCaseConfig } from './common/config';
import { parseYaml } from './parser/yml';
import { parse } from './parser/grammar';

const processPath = process.cwd();
const prettierConfig = getPrettierConfig(processPath);

/**
 * 编译生成案例
 * @param path 测试用例配置文件
 */
export const compiler = (path: string): void => {
    // 获取配置
    let utdslConfig = getUtdslConfigInfo(processPath);
    if (!utdslConfig) {
        consoleOutput('未找到 utdsl.config.json 配置文件，使用默认的配置文件');
        utdslConfig = formatConfigData(
            {
                ...defaultUtdslConfig,
            },
            processPath
        );
    } else {
        // 追加默认配置, 用户自定义的将会覆盖默认的
        utdslConfig = formatConfigData(
            {
                ...defaultUtdslConfig,
                ...utdslConfig,
            },
            processPath
        );
    }

    // 解析 *.yaml / *.yml 测试语言
    let testCaseConfig = parseYaml(path);
    if (testCaseConfig instanceof Error) {
        consoleOutput(`解析 ${path} 出错，存在语法错误，请检查文档修改文件内容.`);
        console.log(testCaseConfig.message);
        return;
    } else {
        // 注入默认数据
        testCaseConfig = combineDefaultTestCaseConfig(testCaseConfig);
    }

    // 解析并生成测试用例
    parse({
        testDslAbsolutePath: path,
        projectConfig: utdslConfig,
        testCaseConfig,
        prettierConfig,
    });
};
