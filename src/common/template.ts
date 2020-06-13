import { IUtdslConfig } from './../typings/index.d';

/**
 * 从文件内容中提取出 utdsl 的语法
 *
 * @param {string} fileContent 文件内容
 * @param {IUtdslConfig} config 配置文件
 */
const getGrammarFromContent = (fileContent: string, config: IUtdslConfig): Array<string> => {
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
                return item.trim();
            })
            .filter((item) => !!item);
    });
};
