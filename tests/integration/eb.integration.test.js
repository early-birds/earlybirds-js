import Eb from '../../src/eb'
import Cookies from '../../src/utils/Cookies'

describe('Earlybirds class', () => {
  describe('Class instantiated correctly', () => {
    beforeEach(() => {
      Cookies.getCookie = jest.fn(() => 'fakeCookie')
      new Eb().reset()
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
    describe('Identify', () => {
      it('should', () => {

      })
    })
  })
})
