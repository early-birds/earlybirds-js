import Eb from '../../src/eb'
import Cookies from '../../src/utils/Cookies'
import Config from '../../config'
import { Encode } from '../../src/utils/Utils'
import {
  shouldInitiateIdentifyRequest } from '../../src/modules/profileValidationCheck'

const jasmineDefaultTimeoutInterval = jasmine.DEFAULT_TIMEOUT_INTERVAL

beforeEach(() => {

  // mute console.log when tests are running.
  console.log = () => {}

  // avoid using the same instance of Eb for each test
  new Eb().reset()

  // since all async tasks are mocked and should resolve instantly we don't need timeout
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 0;

  // some shortcuts...
  global.FAKE_PROFILE = {
    hash: 'fakeHash',
    lastIdentify: 10
  }

  global.DEFAULT_PROFILE = {
    hash: null,
    lastIdentify: null,
  }

  // mock http protocol
  Config.HTTP_PROTOCOL = 'fakeHttpProtocol/'
  Config.API_URL = 'fakeApiUrl'

  // fetch should resolve to an empty string by default.
  // mock response can be overriden in the test
  global.fetch = require('jest-fetch-mock')
  fetch.mockResponse(JSON.stringify({}))

  // returning the current date may prevent the tests from working properly.
  // should return the same value for all
  Date.prototype.getTime = jest.fn(() => 0)

  // spy cookies
  Cookies.setCookie = jest.fn()
  Cookies.getCookie = jest.fn()
})

afterEach(() => {
  Date.prototype.getTime.mockRestore()

  // reset spies and function implementation
  fetch.mockReset()
  fetch.mockRestore()
  Cookies.setCookie.mockRestore()
  Cookies.setCookie.mockReset()
  Cookies.getCookie.mockRestore()
  Cookies.getCookie.mockReset()
})

afterAll(() => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = jasmineDefaultTimeoutInterval
})

describe('Earlybirds class', () => {

  describe('Class instantiated correctly', () => {

    it('should be instanciable', () => {
      expect.assertions(1)
      const ebInstance = new Eb().getInstance()
      expect(ebInstance).toBeDefined()
    })

    it('should be a singleton', () => {
      expect.assertions(1)
      const a = new Eb().getInstance()
      const b = new Eb().getInstance()
      expect(a).toBe(b)
    })

    it('should have a default profile property that keeps the hash and lastIdentify', () => {
      expect.assertions(1)
      const eb = new Eb().getInstance()
      expect(eb.defaultProfile).toEqual({
        hash: null,
        lastIdentify: null
      })
    })

    describe('retrieveEbProfile', () => {

      it('should implement a retrieveEbProfile method', () => {
        expect.assertions(1)

        const eb = new Eb().getInstance()
        expect(eb.retrieveEbProfile).toBeDefined()
      })

      it('should return the fakeCookie if eb-cookie exist', () => {
        expect.assertions(1)

        // mocking
        Cookies.getCookie = jest.fn(() => 'fakeCookie')

        const eb = new Eb().getInstance()
        expect(eb.retrieveEbProfile()).toEqual('fakeCookie')
      })

      it('should return null if eb-cookie does not exist', () => {
        expect.assertions(1)

        const eb = new Eb().getInstance()
        expect(eb.retrieveEbProfile()).toEqual(null)
      })
      it('should have a profile property that store the eb-profile cookie', () => {
        expect.assertions(2)

        // mocking
        Cookies.getCookie = jest.fn(() => 'fakeCookie')

        const eb = new Eb().getInstance()
        expect(eb.profile).toBeDefined()
        expect(eb.profile).toEqual('fakeCookie')
      })
    })
    it('should implement a init method that set the trackerKey attribute with the given value', () => {
      expect.assertions(3)

      const eb = new Eb().getInstance()
      expect(eb.init).toBeDefined()

      // tracker key null. should not define it
      eb.init()
      expect(eb.trackerKey).not.toBeDefined()

      // tracker key exist
      eb.init('fakeTrackerKey')
      expect(eb.trackerKey).toEqual('fakeTrackerKey')
    })

    it('should accept a tracker key during instantiation', () => {
      expect.assertions(1)

      const eb = new Eb().getInstance('fakeTrackerKey')
      expect(eb.trackerKey).toEqual('fakeTrackerKey')
    })
  })

  describe('Compliance to earlybirds API', () => {

    it('should implement an identify method', () => {
      expect.assertions(2)

      const eb = new Eb().getInstance()
      expect(eb.identify).toBeDefined()
      expect(typeof eb.identify).toEqual('function')
    })

    it('should implement a getRecommendations method', () => {

      expect.assertions(2)
      const eb = new Eb().getInstance()
      expect(eb.getRecommendations).toBeDefined()
      expect(typeof eb.getRecommendations).toEqual('function')
    })

    it('should implement a trackActivity method', () => {
      expect.assertions(2)

      const eb = new Eb().getInstance()
      expect(eb.trackActivity).toBeDefined()
      expect(typeof eb.trackActivity).toEqual('function')
    })
  })
  describe('Identify', () => {

    it('should return null if no profile is provided', () => {
      expect.assertions(1)

      const eb = new Eb().getInstance()
      expect(eb.identify()).toEqual(null);
    })

    it('should return a promise that resolves to the current profile if identify is not needed', () => {
      expect.assertions(2)

      const eb = new Eb().getInstance('fakeTrackerKey')
      eb.profile = { lastIdentify: 0 }
      eb
        .identify(DEFAULT_PROFILE)
        .then((res) => {
          expect(res).toEqual(DEFAULT_PROFILE);
        })
      expect(fetch).not.toBeCalled()
    })

    it('should return null if trackerKey is not set', () => {
      expect.assertions(1)

      const eb = new Eb().getInstance()
      const res = eb.identify({})
      expect(res).toEqual(null)
    })

    describe('should make a http request that returns a promise then set the eb-profile cookie if identify is outdated', () => {

      it('should call fetch', () => {
        expect.assertions(1)

        const eb = new Eb().getInstance('fakeTrackerKey')
        eb.identify(FAKE_PROFILE)
        expect(fetch).toBeCalled()
      })

      it('should set cookie', done => {
        expect.assertions(1)
        const eb = new Eb().getInstance('fakeTrackerKey')
        Cookies.setCookie = jest.fn()
        eb
          .identify(FAKE_PROFILE)
          .then(() => {
            expect(Cookies.setCookie).toBeCalled()
            done()
          })
      })

      it('should set cookie with the correct profile and update profile property', done => {
        expect.assertions(2)

        let fakeResponse = {
          profile: {
            id: 'fakeId'
          }
        }

        fetch.mockResponse(JSON.stringify(fakeResponse))
        const expectedResult = {
          ...fakeResponse.profile,
          lastIdentify: 0,
          hash: Encode(FAKE_PROFILE)
        }
        let fakeCookieExpected = JSON.stringify(expectedResult)

        const eb = new Eb().getInstance('fakeTrackerKey')
        eb
          .identify(FAKE_PROFILE)
          .then(response => {
            // set eb profile cookie
            expect(Cookies.setCookie)
              .toBeCalledWith('eb-profile', fakeCookieExpected, eb.defaultCookieConfig)
            // update eb profile
            expect(eb.profile).toEqual(expectedResult)
            done()
            return response;
          })
          .catch((err) => {
            console.log(err)
          })
      })
      // from old cdn:
      // if (result.cookie && result.cookie.domain && document.location.hostname.indexOf(result.cookie.domain) >= 0) eb.cookieConfig = result.cookie;
      it('should use cookie.domain to set eb-profile if cookie.domain match location.hostname', done => {
        expect.assertions(1)
        let fakeResponse = {
          profile: {
            id: 'fakeId'
          },
          cookie: {
            domain: 'fakeDomain',
            expires: 1
          }
        }
        fetch.mockResponse(JSON.stringify(fakeResponse))
        const expectedResult = {
          ...fakeResponse.profile,
          lastIdentify: 0,
          hash: Encode(FAKE_PROFILE)
        }
        let fakeCookieExpected = JSON.stringify(expectedResult)

        const eb = new Eb().getInstance('fakeTrackerKey')
        eb.hostname = 'fakeDomain'
        eb
          .identify(FAKE_PROFILE)
          .then(response => {
            expect(Cookies.setCookie)
              .toBeCalledWith('eb-profile', fakeCookieExpected, fakeResponse.cookie)
            done()
            return response;
          })
          .catch((err) => {
            console.log(err)
          })
      })
    })
  })

  describe('Track Activity', () => {

    it('should return false if not activities is provided', () => {
      expect.assertions(1)
      const eb = new Eb().getInstance()
      expect(eb.trackActivity()).toEqual(false);
    })

    it('should return false if originalId is missing in activity object', () => {
      expect.assertions(1)
      const eb = new Eb().getInstance()
      const fakeInputs = [
        {
          profile: 'FAKE_PROFILE',
          verb: 'FAKE_VERB'
        }
      ]
      expect(eb.trackActivity(fakeInputs)).toEqual(false);
    })

    it('should make a http request if inputs are ok then set the eb-lastactivity-hash cookie (happy path)', done => {
      expect.assertions(2)
      const eb = new Eb().getInstance('fakeTrackerKey')
      const fakeInputs = [
        {
          profile: 'FAKE_PROFILE',
          originalId: 'FAKE_ID',
          verb: 'FAKE_VERB'
        }
      ]
      const hash = Encode(JSON.stringify(fakeInputs))
      eb
        .trackActivity(fakeInputs)
        .then(() => {
          expect(Cookies.setCookie).toBeCalledWith('eb-lastactivity-hash', hash)
          done()
        })
      const url = `${Config.HTTP_PROTOCOL}${Config.API_URL}/tracker/fakeTrackerKey/activity`
      expect(fetch).toBeCalledWith(
        url,
        {
          method: 'post',
          body: JSON.stringify({
            activity: fakeInputs
          })
        }
      )
    })

    it('should not make an http request if eb-lastactivity-hash cookie is not new', () => {
      expect.assertions(1)
      const fakeInputs = [
        {
          profile: 'FAKE_PROFILE',
          originalId: 'FAKE_ID',
          verb: 'FAKE_VERB'
        }
      ]
      const fakeHash = Encode(JSON.stringify(fakeInputs))
      Cookies.getCookie = jest.fn(() => fakeHash)

      const eb = new Eb().getInstance()
      eb.trackActivity(fakeInputs)
      expect(fetch).not.toBeCalled()
    })

    it('should return an object with activities property', done => {
      expect.assertions(1)
      const fakeResponse = {}
      fakeResponse.json = () => (
        new Promise(r =>
          r({
            activities: [],
          })
        )
      )
      const fakeInputs = [
        {
          profile: 'FAKE_PROFILE',
          originalId: 'FAKE_ID',
          verb: 'FAKE_VERB'
        }
      ]
      fetch = jest.fn(() => (
        new Promise(r => r(fakeResponse))
      ))
      const eb = new Eb().getInstance()
      eb
        .trackActivity(fakeInputs)
        .then(response => {
          expect(response.activities).toBeDefined()
          done()
        })
    })

    it('should catch errors', () => {
      expect.assertions(1)
      const fakeInputs = [
        {
          profile: 'FAKE_PROFILE',
          originalId: 'FAKE_ID',
          verb: 'FAKE_VERB'
        }
      ]
      fetch = jest.fn(() => {
        return new Promise((resolve, reject) => reject('FAKE_ERROR'))
      })
      const eb = new Eb().getInstance()
      eb
        .trackActivity(fakeInputs)
        .catch(err => {
          expect(err).toBe('FAKE_ERROR')
        })
    })
  })

  describe('Recommendations', () => {
    it('should return a promise that reject with the\
    value "Earlybirds error: Not identified" if not identified yet', () => {
      const eb = new Eb().getInstance()
      eb
        .getRecommendations('fakeWidgetId')
        .catch(err => {
          expect(err).toBe('Earlybirds error: Not identified')
        })
    })
    it('should be falsy if no widgetId is provided', () => {
      const eb = new Eb().getInstance()
      const res = eb.getRecommendations()
      expect(res).toBe(false)
    })
    it('should make a http call (happy path)', () => {
      const eb = new Eb().getInstance('fakeTrackerKey')
      eb.profile = {}
      const res = eb.getRecommendations('fakeWidgetId')
      expect(fetch).toBeCalled()
    })
    it('should return an object with recommendations and widget', done => {
      expect.assertions(2)
      const fakeResponse = {}
      fakeResponse.json = () => (
        new Promise(r =>
          r({
            recommendations: {},
            widget: {}
          })
        )
      )
      fetch = jest.fn(() => (
        new Promise(r => r(fakeResponse))
      ))
      const eb = new Eb().getInstance()
      eb.profile = {}
      eb
        .getRecommendations('fakeWidgetId')
        .then(response => {
          expect(response.recommendations).toBeDefined()
          expect(response.widget).toBeDefined()
          done()
        })
    })
    it('should catch errors', () => {
      expect.assertions(1)
      fetch = jest.fn(() => {
        return new Promise((resolve, reject) => reject('FAKE_ERROR_RECOS'))
      })
      const eb = new Eb().getInstance()
      eb.profile = {}
      eb
        .getRecommendations('fakeWidgetId')
        .catch(err => {
          expect(err).toBe('FAKE_ERROR_RECOS')
        })
    })
  })
})

