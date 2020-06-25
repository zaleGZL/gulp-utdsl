import yaml from 'js-yaml';
import fs from 'fs';

/**
 * 解析 yaml 文件
 *
 * @param {string} filePath
 * @param {yaml.LoadOptions} options
 * @returns {*}
 */
export const parseYaml = (filePath: string): any => {
    let doc = null;

    try {
        doc = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        doc = e;
    }

    return doc;
};
