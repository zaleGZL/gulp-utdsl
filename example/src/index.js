import { requestQQUserInfo } from './dependent';

export const add = (a, b) => {
    return a + b;
};

export const getQQUserInfo = (params) => {
    const calculateParams = Object.assign(params);

    return requestQQUserInfo(calculateParams).then(
        (res) => {
            // 执行某些操作
            return Promise.resolve(res);
        },
        (res) => {
            // 执行某些操作
            return Promise.reject(res);
        }
    );
};

// 格式化用户列表数据
export const formatUserListInfo = (userList = []) => {
    if (!Array.isArray(userList) || userList.length === 0) {
        return [];
    }

    return userList.map((item) => {
        return {
            ...item,
            info: `${item.name} ${item.age}`,
        };
    });
};
