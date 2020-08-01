import axios from 'axios';

export const requestQQUserInfo = (params) => {
    return axios.get('http://www.qq.com', params);
};
