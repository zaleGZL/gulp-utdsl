import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const requestQQIndexInfo = (params: any): any => {
    return axios.get('http://www.qq.com', params);
};
