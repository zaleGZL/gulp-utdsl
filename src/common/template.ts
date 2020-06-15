import { IUtdslConfig } from './../typings/index.d';

/**
 * 从文件内容中提取出 utdsl 的语法
 *
 * @param {string} fileContent 文件内容
 * @param {IUtdslConfig} config 配置文件
 */
export const getGrammarFromContent = (fileContent: string, config: IUtdslConfig): string[][] => {
    // 匹配对应注释的正则
    const commentReg = new RegExp(`\\/\\*\\*\\s?${config.commentMark}[\\s\\S]*?\\*\\/`, 'ig');
    const commentList = (fileContent || '').match(commentReg);

    if (!commentList || commentList.length === 0) {
        return [];
    }

    // 按行分割注释
    const commentLineList = commentList.map((comment) => {
        return comment
            .split(/\r?\n/)
            .map((item) => {
                let result = item.trim();

                // 去掉开头的 '*' 部分
                result = result.replace(/^\**/, '').trim();

                // 去掉尾部的 ';' 字符
                if (result.endsWith(';')) {
                    result = result.slice(0, result.length - 1);
                }

                return result;
            })
            .filter((item) => !!item)
            .slice(1, -1);
    });

    return commentLineList;
};
