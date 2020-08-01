import { requestQQUserInfo } from '../../../src/dependent.js';
import * as axios from 'axios';

jest.mock('axios', () => {
    const { mockAxios } = require('../../../src/test/data');
    return {
        ...mockAxios,
    };
});

test('requestQQUserInfo_0', async () => {
    jest.clearAllMocks();

    return requestQQUserInfo({ userId: 1 }).then(
        (res) => {
            expect(res).toEqual({ userId: 1 });
        },
        (res) => {
            expect(true).toBe(false);
        }
    );
});
