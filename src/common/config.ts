import path from 'path';
import _ from 'lodash';
import { ICommonObj } from './../typings/index.d';

export const defaultUtdslConfig = {
    // 测试文件的导出路径
    outputPath: './__utdsl__tests__',
    // 被测试的文件相当于项目的路径 (大部分无需修改)
    fileRelativePath: './',
};

/**
 * 格式化配置文件，便于后面能够直接使用，无需再次转换
 * @param config 配置文件
 * @param processPath 项目路径
 */
export const formatConfigData = (config: ICommonObj, processPath: string): ICommonObj => {
    return {
        testOutputAbsolutePath: path.resolve(processPath, config.outputPath),
        filePathAbsolutePathPrefix: path.resolve(processPath, config.fileRelativePath),
    };
};

/**
 * 结合默认 testCase 的默认配置
 * @param documentConfig
 */
export const combineDefaultTestCaseConfig = (_documentConfig: ICommonObj): ICommonObj | Error => {
    const documentConfig = _.isPlainObject(_documentConfig) ? _documentConfig : {};
    const cases = _.isArray(documentConfig.cases) ? documentConfig.cases : [];
    return {
        // 是否是 ES 模块(默认值为 true)
        isEsModule: true,
        // 是否单个文件的形式
        isSingleFile: true,
        ...documentConfig,
        cases: cases.map((_caseItem: ICommonObj, index: number) => {
            const caseItem = _.isPlainObject(_caseItem) ? _caseItem : {};
            const mocks = _.isArray(caseItem.mocks) ? caseItem.mocks : [];
            const target = caseItem.target || 'default';
            const name = caseItem.name || `${target}_${index}`;
            return {
                // 测试的对象（默认为测试文件的默认导出，即 default, 如果是要测试文件内的命名导出对象，则填写该对象的名称）
                target,
                // 测试文件名称（同时也会作为文件名称），同一个模块下的每个测试名称都要是不同，如果没有提供，则使用案例的 target 加上索引值作为文件名称
                name,
                // 函数的输入和输出
                io: [],
                // 调用函数时的 this 对象
                this: undefined,
                // 前置内容
                prefixContent: '',
                // 调用方式
                invokeType: 'default',
                // 预期的行为
                expect: [],
                ...caseItem,
                // 需要 mock 的模块、函数等
                mocks: mocks.map((_mockCase: ICommonObj) => {
                    const mockCase = _.isPlainObject(_mockCase) ? _mockCase : {};
                    return {
                        // mock 类型（默认为 mock 单个导出函数）可选值：function, file, global
                        type: 'function',
                        // mock 类型为 file 时，可以选择是否要保留源模块的数据（其它的数据可以进行覆盖）
                        needOriginModule: false,
                        ...mockCase,
                    };
                }),
            };
        }),
    };
};

export const defaultPrettierConfig = {
    // 一行最多 120 字符
    printWidth: 120,
    // 使用 4 个空格缩进
    tabWidth: 4,
    // 不使用缩进符，而使用空格
    useTabs: false,
    // 行尾需要有分号
    semi: true,
    // 使用单引号
    singleQuote: true,
    // 对象的 key 仅在必要时用引号
    quoteProps: 'as-needed',
    // jsx 不使用单引号，而使用双引号
    jsxSingleQuote: false,
    // 末尾需要逗号
    trailingComma: 'es5',
    // 大括号内的首尾需要空格
    bracketSpacing: true,
    // jsx 标签的反尖括号需要换行
    jsxBracketSameLine: false,
    // 箭头函数，只有一个参数的时候，也需要括号
    arrowParens: 'always',
    // 每个文件格式化的范围是文件的全部内容
    rangeStart: 0,
    rangeEnd: Infinity,
    // 不需要写文件开头的 @prettier
    requirePragma: false,
    // 不需要自动在文件开头插入 @prettier
    insertPragma: false,
    // 使用默认的折行标准
    proseWrap: 'preserve',
    // 根据显示样式决定 html 要不要折行
    htmlWhitespaceSensitivity: 'css',
    // 换行符使用 lf
    endOfLine: 'lf',
};
