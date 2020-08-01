import { formatUserListInfo } from '../../../src/index.js';

test('formatUserListInfo_3', async () => {
    jest.clearAllMocks();

    expect(formatUserListInfo()).toEqual([]);
    expect(formatUserListInfo({})).toEqual([]);
    expect(formatUserListInfo([])).toEqual([]);
    expect(formatUserListInfo(undefined)).toEqual([]);
    expect(formatUserListInfo([{ name: 'Jim', age: 10 }])).toEqual([{ name: 'Jim', age: 10, info: 'Jim 10' }]);
});
