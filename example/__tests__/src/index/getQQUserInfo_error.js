import { getQQUserInfo } from '../../../src/index.js';
import * as dependent_046b from '../../../src/dependent';
import { mockErrorRequestQQUserInfo } from '../../../src/test/data';

test('getQQUserInfo_error', async () => {
    jest.clearAllMocks();

    jest.spyOn(dependent_046b, 'requestQQUserInfo').mockImplementation(mockErrorRequestQQUserInfo);
    return getQQUserInfo({ userId: 456 }).then(
        (res) => {
            expect(true).toBe(false);
        },
        (res) => {
            expect(res).toEqual({ message: 'request fail' });
        }
    );
});
