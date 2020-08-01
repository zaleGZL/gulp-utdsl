export const mockSuccessRequestQQUserInfo = jest.fn((params) => {
    if (params.userId === 123) {
        return Promise.resolve({
            userId: 123,
            userName: 'tim',
        });
    }
});
export const mockErrorRequestQQUserInfo = jest.fn((params) => {
    if (params.userId === 456) {
        return Promise.reject({
            message: 'request fail',
        });
    }
});
export const mockAxios = {
    get: jest.fn((_url, params) => {
        return Promise.resolve(params);
    }),
};
