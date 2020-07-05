import crypto from 'crypto';
import path from 'path';

/**
 * 对应文件的路径，生成一个带 hash 文件的模块引入名称
 * @param path 文件路径
 */
export const getHashNameFromFilePath = (filePath: string): string => {
    const fileName = path.basename(filePath).replace(path.extname(filePath), '');
    const hashPrefix = crypto.createHash('md5').update(filePath).digest('hex').slice(0, 4);
    return `${fileName}_${hashPrefix}`;
};
