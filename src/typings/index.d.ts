export interface utdslOption {
    show: boolean;
}

export interface IUtdslConfig {
    commentMark: string;
}

export interface ICommonObj {
    [key: string]: any;
}

export interface ITestFuncImportDesc {
    path: string; // 需要导入的文件的绝对路径
    moduleName: string; // 导入的模块名称
}

export interface IIoListItem {
    inputs: (IParamsDesc | IDataParamsDesc)[]; // 输入参数列表
    output: IParamsDesc | IDataParamsDesc | undefined; // 函数的输出值
    ioCompareType?: string; // IO 的判断类型
}

export interface IMockListItem {
    type: string; // mock 的类型
    targetPath?: string; // mock 的目标函数路径
    targetName?: string; // mock 的目标函数名称
    targetModuleName?: string; // mock 的目标模块导入名称
    mockPath?: string; // mock 的函数路径
    mockName?: string; // mock 的函数(或对象)名称
    mockExpression?: string; // mock 的函数对应的表达式
    needOriginModule?: boolean; // mock 类型为 file 时，可以选择是否要保留源模块的数据（其它的数据可以进行覆盖）
}

export interface IOperationDesc {
    operation: string; // 操作类型
    path?: string; // 路径
    variableName?: string; // 变量名称
    ioList?: IIoListItem[]; // IO 参数列表
    mockList?: IMockListItem[]; // mock 列表
    asName?: string; // 变量导入后需要替换的名称
    value?: string; // 操作所对应的值
    moduleAsName?: string; // 名称空间来引用导入模块的名称
}

export interface IParamsDesc {
    isJsVariable?: boolean; // 是否是 JS 表达式
    isExternalData?: boolean; // 是否是从外部导入的数据
    expression?: string; // JS 表达式的内容 (isJsVariable 为 true 时用到)
    variableName?: string; // 变量名称 (isExternalData 为 true 时用到)
    path?: string; // 变量导入路径 (isExternalData 为 true 时用到)
    asName?: string; // 变量导入后需要替换的名称
}

export interface IDataParamsDesc {
    isValidate: boolean; // 是否验证通过
    variableName?: string; // 变量名称
    path?: string; // 路径
    message?: string; // 错误信息
    asName?: string; // 变量导入后需要替换的名称
}

export interface IImportPathItem {
    variableName: string; // 变量导出的名字
    asName?: string; // 变量导入重命名的名字
    moduleAsName?: string; // 名称空间来引用导入模块的名称
}

export interface IImportPathMap {
    [key: string]: IImportPathItem[]; // key 路径名称，value 为对应的导入变量的数组
}

interface IParseFuncParamsCorrectResult {
    ioDescList: IParamsDesc[];
    operationList: IOperationDesc[];
}

export type TParseFuncParamsResult = IParseFuncParamsCorrectResult | Error;

export interface IFormatContentDescList {
    contentDescList: IOperationDesc[]; // 内容描述对象列表
    testFileAbsolutePath: string; // 输出的测试文件的绝对路径
    testDslAbsolutePath: string; // 测试 DSL 文件的绝对路径
    projectConfig: ICommonObj; // 项目的配置文件
}

export interface IGetImportFilePath {
    filePath: string; // 配置中指定的路径
    testFileAbsolutePath: string; // 输出的测试文件的绝对路径
    testDslAbsolutePath: string; // 测试 DSL 文件的绝对路径
    projectConfig: ICommonObj; // 项目的配置文件
}

export interface IGetFileImportPath {
    filePath: string; // 被测试的文件路径
    testDslAbsolutePath: string; // 测试 DSL 文件的绝对路径
    projectConfig: ICommonObj; // 项目的配置文件
    testCaseConfig: ICommonObj; // 测试 case 的配置
    outputFileExt?: string; // 输出文件的扩展名
}

export interface IExpressOperationDesc {
    value: string; // 操作的值
    [key: string]: any;
}

export interface IMatchOperationListItem {
    index: number; // 匹配的其实位置
    value: string; // 匹配的值
}

export interface IParse {
    testDslAbsolutePath: string; // 测试 DSL 文件的绝对路径
    projectConfig: ICommonObj; // 项目的配置文件
    testCaseConfig: ICommonObj; // 测试 case 的配置
    prettierConfig: ICommonObj; // prettier 的配置
}

export interface IMocksItem {
    target: string; // 被 mock 的对象
    mock: string; // mock 对象
    type: string; // mock 的类型
    needOriginModule: boolean; // mock 类型为 file 时，可以选择是否要保留源模块的数据（其它的数据可以进行覆盖）
}

export type TMock = IMocksItem[];

export interface IParseMocksTypesParams {
    targetOperationDesc: IExpressOperationDesc; // 被 mock 的对象的操作描述
    mockOperationDesc: IExpressOperationDesc; // mock 对象的操作描述
    mockItem: IMocksItem; // mock 参数
}

export interface IParseTypesReturn {
    mockDesc: IMockListItem; // mock 描述
    operationList: IOperationDesc[]; // 其它内容描述对象列表
}
