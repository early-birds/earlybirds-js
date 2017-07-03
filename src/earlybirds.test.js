import Eb from './earlybirds';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

var mock = new MockAdapter(axios);
mock.onPost().reply(200, {});

test('Identify should return a promise', () => {
  const identifyReturnValue = new Eb().identify({});
  expect(identifyReturnValue.then).toBeDefined();
});
