import { add } from '../../../src/index.js';

test('add_two_number', async () => {
    jest.clearAllMocks();

    expect(add(1, 2)).toBe(3);
    expect(add(3, 4)).toBe(7);
});
