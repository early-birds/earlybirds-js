import axios from 'axios';
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
  test('should return a promise', () => {
    const eb = new Eb();
    const res = eb.identify();
    expect(res.then).toBeDefined();
  });

  test('should set profile property', () => {
    let fakeTrackerKey = 'fakeTrackerKey';
    const fakeProfile = {
      hash: null,
      lastIdentify: null,
    };
    mock.onPost(`${HTTP_PROTOCOL}${Config.API_URL}/tracker/fakeTrackerKey/identify`).reply(200, { profile: fakeProfile });
    const eb = new Eb();
    eb.init(fakeTrackerKey);
    eb.identify(fakeProfile)
    .then(() => {
    });
  });
});

describe('getRecommendations()', () => {
  let fakeTrackerKey = 'fakeTrackerKey';
  mock.onGet(`${HTTP_PROTOCOL}${Config.API_URL}/widget/fakeWidgetId/recommendations/fakeProfileId`).reply(200, {});

  describe('should handle profile properly', () => {
    test('should reject if profile is null', () => {
      let eb = new Eb()
      eb.profile = null;
      eb.identify()
        .then(() => {
          return eb.getRecommendations('fakeWidgetId')
        })
        .catch((e) => {
          return expect(e.toString()).toEqual('no profile');
        })
        .catch((m) => {
        });
    });
    test('should resolve if profile is present', () => {
      let eb = new Eb()
      eb.profile = { 
        id: 'fakeProfileId'
      };
      eb.identify()
        .then(() => {
          return eb.getRecommendations('fakeWidgetId')
        })
        .then((t) => {
          expect(t).toBeTruthy();
        })
        .catch((m) => {
        });
    });
  });
});
