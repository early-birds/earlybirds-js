import Eb from '../../src/eb'
import Cookies from '../../src/utils/Cookies'
import { Encode } from '../../src/utils/Utils'
import {
  shouldInitiateIdentifyRequest } from '../../src/modules/profileValidationCheck'

const defaultProfile = {
  hash: null,
  lastIdentify: null,
}

describe('Earlybirds class', () => {
  beforeEach(() => {
    new Eb().reset()
  })
  describe('Class instantiated correctly', () => {
    beforeEach(() => {
      Cookies.getCookie = jest.fn(() => 'fakeCookie')
    })
    it('should be instanciable', () => {
      const ebInstance = new Eb().getInstance()
      expect(ebInstance).toBeDefined()
    })
    it('should be a singleton', () => {
      const a = new Eb().getInstance()
      const b = new Eb().getInstance()
      expect(a).toBe(b)
    })
    it('should have a default profile property that keeps hash and lastIdentify', () => {
      const eb = new Eb().getInstance()
      expect(eb.defaultProfile).toEqual({
        hash: null,
        lastIdentify: null
      })
    })
    it('should implement a retrieveEbProfile that return the eb-profile cookie content', () => {
      const eb = new Eb().getInstance()
      expect(eb.retrieveEbProfile).toBeDefined()
      expect(eb.retrieveEbProfile()).toEqual('fakeCookie')
    })
    it('should have a profile property that store the eb-profile cookie', () => {
      const eb = new Eb().getInstance()
      expect(eb.profile).toBeDefined()
      expect(eb.profile).toEqual('fakeCookie')
    })
    it('should implement a init method that set the trackerKey attribute with the given value', () => {
      const eb = new Eb().getInstance()
      expect(eb.init).toBeDefined()
      // tracker key null. should not define it
      eb.init()
      expect(eb.trackerKey).not.toBeDefined()

      eb.init('fakeTrackerKey')
      expect(eb.trackerKey).toEqual('fakeTrackerKey')
    })
    it('should accept a tracker key during instantiation', () => {
      const eb = new Eb().getInstance('fakeTrackerKey')
      expect(eb.trackerKey).toEqual('fakeTrackerKey')
    })
  })
  describe('Compliance to earlybirds API', () => {
    beforeEach(() => {
      global.eb = new Eb().getInstance()
    })
    afterEach(() => {
      delete global.eb
    })
    it('should implement an identify method', () => {
      expect(eb.identify).toBeDefined()
      expect(typeof eb.identify).toEqual('function')
    })
    it('should implement a getRecommendations method', () => {
      expect(eb.getRecommendations).toBeDefined()
      expect(typeof eb.getRecommendations).toEqual('function')
    })
    it('should implement a trackActivity method', () => {
      expect(eb.trackActivity).toBeDefined()
      expect(typeof eb.trackActivity).toEqual('function')
    })
  })
  describe('Identify', () => {
    describe('shouldInitiateIdentifyRequest', () => {
      beforeEach(() => {
        Date.prototype.getTime = jest.fn(() => 5)
      })
      afterEach(() => {
        Date.prototype.getTime.mockRestore()
      })
      it('should implement a "shouldInitiateIdentifyRequest" that checks if a new identify is required', () => {
        expect(shouldInitiateIdentifyRequest).toBeDefined()
      })
      it('should be truthy if eb profile cookie does not exist', () => {
        let cookie = undefined
        const res = shouldInitiateIdentifyRequest(cookie, defaultProfile)
        expect(res).toBeTruthy()
      })
      it('should be truthy if cookie is outdated', () => {
        const fakeCookie = {
          hash: null,
          lastIdentify: 0,
        }
        const fakeDuration = 1
        const res = shouldInitiateIdentifyRequest(fakeCookie, defaultProfile, fakeDuration)
        expect(res).toBeTruthy()
      })
      it('should be truthy if cookie hash and profile does not match', () => {
        const fakeCookie = {
          hash: 'fakeHash',
          lastIdentify: 50,
        }
        const res = shouldInitiateIdentifyRequest(fakeCookie, defaultProfile)
        expect(res).toBeTruthy()
      })
      it('should be falsy if cookie hash and profile matches', () => {
        const encodedDefaultProfile = Encode(defaultProfile)
        const fakeCookie = {
          hash: encodedDefaultProfile,
          lastIdentify: 5,
        }
        const res = shouldInitiateIdentifyRequest(fakeCookie, defaultProfile)
        expect(res).toBeFalsy()
      })
    })
    it('should return null if no profile is provided', () => {
      const eb = new Eb().getInstance()
      expect(eb.identify()).toEqual(null);
    })
    it('should return the current profile if identify is not needed', () => {
      let mock = jest.fn()
      Cookies.setCookie = mock
      const eb = new Eb().getInstance('fakeTrackerKey')
      expect(eb.identify(defaultProfile)).toEqual(defaultProfile);

      // should not set eb-profile cookie in this case
      expect(mock).not.toBeCalled()
    })
    it('should return null if trackerKey is not set', () => {
      const eb = new Eb().getInstance()
      const res = eb.identify({})
      expect(res).toEqual(null)
    })
    describe('should make a http request that returns a promise then set the eb-profile cookie if identify is outdated', () => {
      const fakeProfile = {
        hash: 'fakeHash',
        lastIdentify: 10
      }
      beforeEach(() => {
        global.fetch = require('jest-fetch-mock')
        fetch.mockResponse(JSON.stringify({}))
        Date.prototype.getTime = jest.fn(() => 0)
      })
      afterEach(() => {
        global.fetch.mockRestore()
        Date.prototype.getTime.mockRestore()
      })
      it('should call fetch', () => {
        const eb = new Eb().getInstance('fakeTrackerKey')
        eb.identify(fakeProfile)
        expect(fetch).toBeCalled()
      })
      it('should set cookie', () => {
        const eb = new Eb().getInstance('fakeTrackerKey')
        Cookies.setCookie = jest.fn()
        eb
          .identify(fakeProfile)
          .then(() => {
            expect(Cookies.setCookie).toBeCalled()
          })
          .catch(err => {
          })
      })
      it('should set cookie with the correct profile and update profile property', done => {
        Cookies.setCookie = jest.fn()
        //that's what the identify returns
        let fakeResponse = {
          profile: {
            id: 'fakeId'
          },
          cookie: {
            domain: ''
          }
        }
        fetch.mockResponse(JSON.stringify(fakeResponse))
        // the profile object built
        const expectedResult = {
          ...fakeResponse.profile,
          lastIdentify: 0,
          hash: Encode(fakeProfile)
        }
        let fakeCookieExpected = JSON.stringify(expectedResult)

        const eb = new Eb().getInstance('fakeTrackerKey')
        eb
          .identify(fakeProfile)
          .then(() => {
            console.log('roulite');
            expect(Cookies.setCookie).toBeCalledWith(fakeCookieExpected)
            //expect(eb.profile).toEqual(expectedResult)
            done()
          })
          .catch((err) => {
            console.log(err)
          })
      })
    })
  })
})
