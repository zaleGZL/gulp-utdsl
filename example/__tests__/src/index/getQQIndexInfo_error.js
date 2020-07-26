import { getQQIndexInfo } from '../../../src/index.ts';
import * as dependent_046b from '../../../src/dependent';
import { mockErrorRequestQQIndexInfo } from '../../../src/test/data';

test('getQQIndexInfo_error', async () => {
    jest.clearAllMocks();

    jest.spyOn(dependent_046b, 'requestQQIndexInfo').mockImplementation(mockErrorRequestQQIndexInfo);
    return getQQIndexInfo({ data: { userId: 456 } }).then(
        (res) => {
            expect(true).toBe(false);
        },
        (res) => {
            expect(res).toEqual({ message: 'request fail' });
        }
    );
});
