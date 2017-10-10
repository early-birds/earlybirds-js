const Hashcode = require('./Hashcode');

describe('Hashcode', () => {
  test('should encode an object properly', () => {
    const fooBarPrecalculatedHash = -884432774;
    const encoded = Hashcode.encode({
      foo: 'bar',
      bar: 'foo',
    });
    expect(encoded).toBe(fooBarPrecalculatedHash);
  });
});
