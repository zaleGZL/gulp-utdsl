import { requestQQIndexInfo } from './dependent';

export const add = (a: number, b: number): number => {
    return a + b;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getQQIndexInfo = (params: any) => {
    const calculateParams = Object.assign(params);

    return requestQQIndexInfo(calculateParams).then(
        (res: any) => {
            // 执行某些操作
            return Promise.resolve(res);
        },
        (res: any) => {
            // 执行某些操作
            return Promise.reject(res);
        }
    );
};
