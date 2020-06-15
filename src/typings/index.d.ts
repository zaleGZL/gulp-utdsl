export interface utdslOption {
    show: boolean;
}

export interface IUtdslConfig {
    commentMark: string;
}

export interface IMetaInfo {
    testType: string; // 测试类型  可选值: (default, fireEvent)
    fileName: string; // 导出的测试文件名称
    [key: string]: string;
}

export interface IOperationDesc {
    isMeta: boolean; // 是否是元信息
    isComment: boolean; // 是否是注释
    commentContent: string; // 注释内容
}
