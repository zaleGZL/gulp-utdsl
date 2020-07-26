import { getQQIndexInfo } from '../../../src/index.ts';
import * as dependent_046b from '../../../src/dependent';
import { mockSuccessRequestQQIndexInfo } from '../../../src/test/data';

test('getQQIndexInfo_success', async () => {
    jest.clearAllMocks();

    jest.spyOn(dependent_046b, 'requestQQIndexInfo').mockImplementation(mockSuccessRequestQQIndexInfo);
    return getQQIndexInfo({ data: { userId: 123 } }).then(
        (res) => {
            expect(res).toEqual({ userId: 123, userName: 'tim' });
        },
        (res) => {
            expect(true).toBe(false);
        }
    );
});
