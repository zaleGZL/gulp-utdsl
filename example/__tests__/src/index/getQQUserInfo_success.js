import { getQQUserInfo } from '../../../src/index.js';
import * as dependent_046b from '../../../src/dependent';
import { mockSuccessRequestQQUserInfo } from '../../../src/test/data';

test('getQQUserInfo_success', async () => {
    jest.clearAllMocks();

    jest.spyOn(dependent_046b, 'requestQQUserInfo').mockImplementation(mockSuccessRequestQQUserInfo);
    return getQQUserInfo({ userId: 123 }).then(
        (res) => {
            expect(res).toEqual({ userId: 123, userName: 'tim' });
        },
        (res) => {
            expect(true).toBe(false);
        }
    );
});
