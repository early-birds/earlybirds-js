const Hashcode = require('./Hashcode');

test('Hashcode', () => {
  const fooBarHash = -884432774;
  const encoded = Hashcode.encode({
    foo: 'bar',
    bar: 'foo',
  });
  expect(encoded).toBe(fooBarHash);
});
