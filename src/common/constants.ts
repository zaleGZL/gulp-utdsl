export const OPERATION = {
    IMPORT: 'IMPORT', // import 导入
    IO: 'IO', // 输入和输出
};

// UTDSL 语法的关键字
export const KEY_WORDS = {
    FROM: ':from:', // 数据导入语法
    AS: ':as:', // 命名替换
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
];

// 函数参数对比操作
export const FUNCTION_PARAMS_COMPARE_OPERATION = {
    IS: '->',
    EQUAL: '-->',
};
export const FUNCTION_PARAMS_COMPARE_OPERATION_MAP = {
    IS: 'IS',
    EQUAL: 'EQUAL',
};
