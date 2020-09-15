import pageLoader from '../src/index.js';

test('pageLoader', () => {
  expect(pageLoader()).toBe(3);
});
