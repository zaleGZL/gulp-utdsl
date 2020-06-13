import { add } from '../common/utils';

describe('utils', () => {
    test('add', () => {
        expect(add(1, 2)).toBe(3);
    });
});
