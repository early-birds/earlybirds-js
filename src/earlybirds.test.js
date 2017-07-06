import axios from 'axios';
import sinon from 'sinon';
import { isEqual } from 'lodash/fp';

import Eb from './earlybirds';
import Cookies from './utils/Cookies';
import Hashcode from './utils/Hashcode';
import MockAdapter from 'axios-mock-adapter';
import Config from '../config';

const HTTP_PROTOCOL     = (document.location.protocol == 'https:' ? 'https://' : 'http://');

var mock = new MockAdapter(axios);

/*
function mockIdentify() {
  let fakeTrackerKey = 'fakeTrackerKey';
  mock.onPost(`${HTTP_PROTOCOL}${Config.API_URL}/tracker/${this.trackerKey}/activity`).reply(200, {});
  const eb = new Eb();
  eb.init(fakeTrackerKey);
  return eb.identify(...arguments);
}
*/

describe('init()', () => {
  test('should initialize tracker key', () => {
    const eb = new Eb();
    const res = eb.init('fakeTrackerKey');
    expect(eb.trackerKey).toEqual('fakeTrackerKey');
  });
  
  test('should be chainable', () => {
    const eb = new Eb();
    const res = eb.init('whatever');
    expect(res).toEqual(eb);
  });
});

describe('noCookie()', () => {

  test('should be truthy if given ebProfile is the same as defaultProfile', () => {
    const profileExample = {
      hash: null,
      lastIdentify: null,
    };
    const eb = new Eb();
    expect(eb.noCookieEbProfile(profileExample)).toBeTruthy();
  });
  test('should be falsy if given ebProfile is the different from defaultProfile', () => {
    const profileExample = 'fake';
    const eb = new Eb();
    expect(eb.noCookieEbProfile(profileExample)).toBeFalsy();
  });
});

describe('lastIdentifyIsOutdated()', () => {

  const eb = new Eb();
  const fakeCookie = { lastIdentify: 10 }

  beforeEach(() => {
    Date = jest.fn();
    Date.prototype.getTime = function() { return 20; }
  });

  test('should be truthy if lastIdentify is greater than duration', () => {
    const res = eb.lastIdentifyIsOutdated(fakeCookie, 5);
    expect(res).toBeTruthy();
  });

  test('should be falsy if lastIdentify is lower than duration', () => {
    const res = eb.lastIdentifyIsOutdated(fakeCookie, 20);
    expect(res).toBeFalsy();
  });
});

describe('profileHasChanged()', () => {

  const eb = new Eb();
  Hashcode.encode = jest.fn(() => { return 'fakeHash' });

  test('should be falsy if given profile hash matches cookie hash', () => {
    const res = eb.profileHasChanged({ hash: 'fakeHash' }, '');
    expect(res).toBeFalsy();
  });
  test('should be truthy if given profile hash doesn\'t matches cookie hash', () => {
    const res = eb.profileHasChanged({ hash: 'differentFakeHash' }, '');
    expect(res).toBeTruthy();
  });
});

describe('identify()', () => {

  beforeEach(() => {
    Cookies.getCookie = jest.fn();
    Cookies.setCookie = jest.fn();
  });

  test('should return a promise', () => {
    const eb = new Eb();
    const res = eb.identify();
    expect(res.then).toBeDefined();
  });

});

describe('getRecommendations()', () => {
});
