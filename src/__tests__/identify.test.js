import Eb from '../eb'
import Mock from '../../tests/mock'
import Cookies from '../utils/Cookies'
import { Encode } from '../utils/Utils'

beforeEach(() => {
  new Eb().reset()
  Mock.start()
})

afterEach(() => {
  Mock.restore()
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
      .identify(Mock.DEFAULT_PROFILE)
      .then(res => {
        expect(res).toEqual(Mock.DEFAULT_PROFILE);
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
      eb.identify(Mock.FAKE_PROFILE)
      expect(fetch).toBeCalled()
    })

    it('should set cookie', done => {
      expect.assertions(1)
      const eb = new Eb().getInstance('fakeTrackerKey')
      Cookies.setCookie = jest.fn()
      eb
        .identify(Mock.FAKE_PROFILE)
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
        hash: Encode(Mock.FAKE_PROFILE)
      }
      let fakeCookieExpected = JSON.stringify(expectedResult)

      const eb = new Eb().getInstance('fakeTrackerKey')
      eb
        .identify(Mock.FAKE_PROFILE)
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
        hash: Encode(Mock.FAKE_PROFILE)
      }
      let fakeCookieExpected = JSON.stringify(expectedResult)

      const eb = new Eb().getInstance('fakeTrackerKey')
      eb.hostname = 'fakeDomain'
      eb
        .identify(Mock.FAKE_PROFILE)
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
