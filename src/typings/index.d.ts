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
    outputs: (IParamsDesc | IDataParamsDesc)[]; // 输出参数列表
}

export interface IOperationDesc {
    operation: string; // 操作类型
    path?: string; // 路径
    variableName?: string; // 变量名称
    ioList?: IIoListItem[]; // IO 参数列表
}

export interface IParamsDesc {
    isJsVariable?: boolean; // 是否是 JS 表达式
    isExternalData?: boolean; // 是否是从外部导入的数据
    expression?: string; // JS 表达式的内容 (isJsVariable 为 true 时用到)
    variableName?: string; // 变量名称 (isExternalData 为 true 时用到)
    path?: string; // 变量导入路径 (isExternalData 为 true 时用到)
}

export interface IDataParamsDesc {
    isValidate: boolean; // 是否验证通过
    variableName?: string; // 变量名称
    path?: string; // 路径
    message?: string; // 错误信息
}
