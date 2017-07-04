import Eb from './earlybirds';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

var mock = new MockAdapter(axios);

describe('test test', () => {

  function fakeIdentify() {
    let fakeTrackerKey = 'fakeTrackerKey';
    mock.onPost(`http://api.early-birds.fr/tracker/fakeTrackerKey/identify`).reply(200, {});
    const eb = new Eb();
    eb.init(fakeTrackerKey);
    return eb.identify(...arguments);
  }

  test('Identify should return a promise', () => {
    const identifyReturnValue = fakeIdentify({});
    expect(identifyReturnValue.then).toBeDefined();
  });
});
