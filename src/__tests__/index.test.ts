import { add } from '../common/utils';
import { getGrammarFromContent } from '../common/template';
import { getMetaInfo, parse } from '../parser/index';

describe('utils', () => {
    test('add', () => {
        expect(add(1, 2)).toBe(3);
    });
    test('getGrammarFromContent 测试下默认的语法', () => {
        const comment = `
        /** utdsl
         * # 这是注释1
         * meta: fileName=xxxx, exportType=default
         *
         *    render(Example, {}, "text", "提示内容1");
         * fireEvent("click", "testId", "close-alert");
         *   waitHide("text", "提示内容1");
         *
         * # 另外一种，等待出现
         * waitShow("text", "提示1");
         */

        /** utdsl
         * # 这是注释2
         * meta: fileName=xxxx, exportType=default
         *
         * render(Example, {}, "text", "提示内容2");
         * fireEvent("click", "testId", "close-alert");
         * waitHide("text", "提示内容2");
         *
         * # 另外一种，等待出现
         * waitShow("text", "提示2");
         */
        `;

        const result = getGrammarFromContent(comment, {
            commentMark: 'utdsl',
        });

        expect(result).toStrictEqual([
            [
                '# 这是注释1',
                'meta: fileName=xxxx, exportType=default',
                'render(Example, {}, "text", "提示内容1")',
                'fireEvent("click", "testId", "close-alert")',
                'waitHide("text", "提示内容1")',
                '# 另外一种，等待出现',
                'waitShow("text", "提示1")',
            ],
            [
                '# 这是注释2',
                'meta: fileName=xxxx, exportType=default',
                'render(Example, {}, "text", "提示内容2")',
                'fireEvent("click", "testId", "close-alert")',
                'waitHide("text", "提示内容2")',
                '# 另外一种，等待出现',
                'waitShow("text", "提示2")',
            ],
        ]);
    });

    test('getMetaInfo 测试出现在首行的 meta 信息', () => {
        const result = getMetaInfo([
            '# 这是注释1',
            'meta: fileName=xxxx, exportType=name, testType=fireEvent',
            'render(Example, {}, "text", "提示内容1")',
            'fireEvent("click", "testId", "close-alert")',
            'waitHide("text", "提示内容1")',
            '# 另外一种，等待出现',
            'waitShow("text", "提示1")',
        ]);

        expect(result).toStrictEqual({
            testType: 'fireEvent',
            exportType: 'name',
            fileName: 'xxxx',
        });
    });

    test('解析注释', () => {
        const result = parse(['meta: fileName=xxxx, exportType=name, testType=fireEvent', '# 这是注释1'], {
            commentMark: 'utdsl',
        });

        expect(result).toStrictEqual([
            {
                isMeta: false,
                isComment: false,
                commentContent: '',
            },
            {
                isMeta: false,
                isComment: true,
                commentContent: '这是注释1',
            },
        ]);
    });
});
