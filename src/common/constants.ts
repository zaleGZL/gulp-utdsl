export const OPERATION = {
    IMPORT: 'IMPORT', // import 导入
    IO: 'IO', // 输入和输出
    INVOKE_TYPE: 'INVOKE_TYPE', // 调用方式
    META: 'META', // 元信息
    MOCKS: 'MOCKS', // mock 数据的信息
};

// UTDSL 语法的关键字
export const KEY_WORDS = {
    FROM: ':from:', // 数据导入语法
    AS: ':as:', // 命名替换
    // EXPRESSION: ':expression:', // 直接执行代码
};

// 操作符号列表
export const EXPRESSION_OPERATION_NAME_LIST = [
    'from',
    'time',
    'as',
    'call',
    'hasProps',
    'equal',
    'is',
    '>',
    '>=',
    '<',
    '<=',
    'expression',
    'moduleAs',
];

export const EXPRESSION_OPERATION_MAP = {
    EXPRESSION: 'expression',
    FROM: 'from',
    MODULE_AS: 'moduleAs',
};

// 函数参数对比操作
export const FUNCTION_PARAMS_COMPARE_OPERATION = {
    IS: '->',
    EQUAL: '-->',
};
export const FUNCTION_PARAMS_COMPARE_OPERATION_MAP = {
    IS: 'IS',
    EQUAL: 'EQUAL',
};

// 支持的 invoke_type
export const INVOKE_TYPE_LIST = ['default', 'render', 'promise(resolve)', 'promise(reject)', 'async'];
export const INVOKE_TYPE_MAP = {
    DEFAULT: 'default',
    RENDER: 'render',
    PROMISE_RESOLVE: 'promise(resolve)',
    PROMISE_REJECT: 'promise(reject)',
    ASYNC: 'async',
};

// 函数调用的输入和输出参数对比形式
export const COMPARE_TYPE = {
    IS: 'toBe',
    EQUAL: 'toEqual',
};

// 支持的 mock 类型列表
export const MOCK_TYPE_LIST = ['function', 'file', 'variable'];

// mock 类型
export const MOCK_TYPE_MAP = {
    FUNCTION: 'function',
    FILE: 'file',
    VARIABLE: 'variable',
};
