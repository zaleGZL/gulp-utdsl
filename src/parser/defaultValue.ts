import { IMetaInfo, IOperationDesc } from '../typings/index.d';

export const defaultMetaInfo: IMetaInfo = {
    testType: '',
    fileName: '',
    exportType: '',
};

export const defaultOperationDesc: IOperationDesc = {
    isMeta: false,
    isComment: false,
    commentContent: '',
};
