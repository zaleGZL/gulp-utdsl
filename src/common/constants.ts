export const OPERATION = {
    IMPORT: 'IMPORT', // import 导入
    IO: 'IO', // 输入和输出
    INVOKE_TYPE: 'INVOKE_TYPE', // 调用方式
    META: 'META', // 元信息
    MOCKS: 'MOCKS', // mock 数据的信息
    PREFIX_CONTENT: 'PREFIX_CONTENT', // 前置内容
    THIS: 'THIS', // this 内容
    EXPECT: 'EXPECT', // expect 内容
};

// UTDSL 语法的关键字
export const KEY_WORDS = {
    FROM: ':from:', // 数据导入语法
    AS: ':as:', // 命名替换
    // EXPRESSION: ':expression:', // 直接执行代码
};

// 子操作符号列表
export const EXPRESSION_SUB_OPERATION_NAME_LIST = ['from'];

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

// expect 支持的类型
export const EXPECT_TYPE_LIST = ['call', 'hasProps', 'equal', 'is', '>', '>=', '<', '<='];

// expect 类型
export const EXPECT_TYPE_MAP = {
    // toBeCalledTimes
    TIME: 'time',
    // toHaveBeenCalledWith
    CALL: 'call',
    // toHaveProperty
    HAS_PROPS: 'hasProps',
    // toEqual
    EQUAL: 'equal',
    // ToBe
    IS: 'is',
    // toBeGreaterThan
    THAN: '>',
    // toBeGreaterThanOrEqual
    GREATER_THAN: '>=',
    // toBeLessThan
    SMALL: '<',
    // toBeLessThanOrEqual
    LESS_THAN: '<=',
};

// 调用方式的属性
export const INVOKE_TYPE_PROPERTY_MAP = {
    RESOLVE: 'resolve',
    REJECT: 'reject',
    CUSTOM: 'custom',
};

export const INVOKE_TYPE_VALUE_MAP = {
    DEFAULT: 'default',
    PROMISE: 'promise',
    // RENDER: 'render',
    // ASYNC: 'async',
};

// expect 分隔符
export const EXPECT_SEPARATOR = '--->';

// 调用替换符号
export const INVOKE_PLACEHOLDER = '<invoke>';
