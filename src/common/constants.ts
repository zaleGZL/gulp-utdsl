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
    IS: '-->',
    EQUAL: '->',
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
export const EXPRESSION_OPERATION_NAME_LIST = ['from', 'as', 'expression', 'moduleAs'];

// expect 支持的类型
export const EXPECT_TYPE_LIST = ['call', 'hasProp', 'equal', 'is', '>', '>=', '<', '<='];

export const EXPECT_PROP_MAP = {
    TYPE: 'type',
    COMPARE: 'compare',
    POSITION: 'position',
};

// expect 类型
export const EXPECT_TYPE_MAP = {
    // default
    DEFAULT: 'default',
    // toBeCalledTimes
    TIME: 'time',
    // toHaveBeenCalledWith
    CALL: 'call',
};

export const EXPECT_COMPARE_MAP = {
    // toHaveProperty
    HAS_PROP: 'hasProp',
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

// 比较的方式对应的表达式
export const EXPECT_COMPARE_FUNC_MAP = {
    [EXPECT_COMPARE_MAP.HAS_PROP]: 'toHaveProperty',
    [EXPECT_COMPARE_MAP.EQUAL]: 'toEqual',
    [EXPECT_COMPARE_MAP.IS]: 'ToBe',
    [EXPECT_COMPARE_MAP.THAN]: 'toBeGreaterThan',
    [EXPECT_COMPARE_MAP.GREATER_THAN]: 'toBeGreaterThanOrEqual',
    [EXPECT_COMPARE_MAP.SMALL]: 'toBeLessThan',
    [EXPECT_COMPARE_MAP.LESS_THAN]: 'toBeLessThanOrEqual',
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
