import Eb from '../../src/eb'
import Cookies from '../../src/utils/Cookies'
import Config from '../../config'
import { Encode } from '../../src/utils/Utils'

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
        expect(eb.retrieveEbProfile()).toEqual({"hash": undefined, "id": "fakeCookie", "lastIdentify": undefined})
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
        expect(eb.profile).toEqual({"hash": undefined, "id": "fakeCookie", "lastIdentify": undefined})
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

})

