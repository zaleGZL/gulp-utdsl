export const mockSuccessRequestQQIndexInfo = jest.fn(() => {
    return Promise.resolve({
        userId: 123,
        userName: 'tim',
    });
});

export const mockErrorRequestQQIndexInfo = jest.fn(() => {
    return Promise.reject({
        message: 'request fail',
    });
});
