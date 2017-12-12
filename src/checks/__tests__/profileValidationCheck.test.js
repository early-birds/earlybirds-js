import { Encode } from '../../utils/Utils'
import {
  shouldInitiateIdentifyRequest,
  cookieDurationIsOutdated,
  cookieHashAndProfileMatch,
  cookieDomainMatchGivenHost } from '../../checks/profileValidationCheck'

beforeEach(() => {
  global.DEFAULT_PROFILE = {
    hash: null,
    lastIdentify: null,
  }
})

describe('profileValidationCheck', () => {
  describe('ebCookieMatchProfile', () => {

    it('should be truthy if cookie hash and defaultProfile are the same', () => {
      expect(
        cookieHashAndProfileMatch(
          DEFAULT_PROFILE,
          { hash: Encode(DEFAULT_PROFILE) }
        )
      ).toBeTruthy()
    })
    it('should be falsy if cookie hash and defaultProfile are different', () => {
      expect(cookieHashAndProfileMatch(DEFAULT_PROFILE, { hash: 'hash' })).toBeFalsy()
    })
    it('should be falsy if hash is en empty object', () => {
      expect(cookieHashAndProfileMatch(DEFAULT_PROFILE, {})).toBeFalsy()
    })
    it('should be falsy if profile and cookie are different', () => {
      expect(cookieHashAndProfileMatch(-1711573533, {})).toBeFalsy()
    })
  })

  describe('cookieDurationIsOutdated', () => {

    it('should be truthy if cookie does not exist', () => {
      expect(cookieDurationIsOutdated(null)).toBeTruthy()
    })
    it('should be truthy if cookie.lastIdentify does not exist', () => {
      expect(cookieDurationIsOutdated({})).toBeTruthy()
    })
    it('should be truthy if lastIdentify > duration', () => {
      Date.prototype.getTime = () => 5
      const cookie = {
        lastIdentify: 0
      }
      expect(cookieDurationIsOutdated(cookie, 2)).toBeTruthy()
    })
    it('should be falsy if lastIdentify < duration', () => {
      Date.prototype.getTime = () => 0
      const cookie = {
        lastIdentify: 0
      }
      expect(cookieDurationIsOutdated(cookie, 2)).toBeFalsy()
    })
  })

  describe('cookieDomainMatchGivenHost', () => {
    it('should be falsy if cookie is null', () => {
      expect(cookieDomainMatchGivenHost(null, '')).toBeFalsy()
    })
    it('should be falsy if host is null', () => {
      expect(cookieDomainMatchGivenHost('', null)).toBeFalsy()
    })
    it('should be truthy if cookie match host', () => {
      const cookie = {
        domain: 'fakeDomain'
      }
      const fakeHost = 'fakeDomain'
      const res = cookieDomainMatchGivenHost(cookie, fakeHost)
      expect(res).toBeTruthy()
    })
    it('should be falsy if cookie does not match host', () => {
      const cookie = {
        domain: 'foobarfoo'
      }
      const fakeHost = 'fakeDomain'
      const res = cookieDomainMatchGivenHost(cookie, fakeHost)
      expect(res).toBeFalsy()
    })
  })
})

describe('shouldInitiateIdentifyRequest', () => {
  it('should implement a "shouldInitiateIdentifyRequest" that checks if a new identify is required', () => {
    expect.assertions(1)
    expect(shouldInitiateIdentifyRequest).toBeDefined()
  })

  it('should be truthy if eb profile cookie does not exist', () => {
    expect.assertions(1)
    let cookie = undefined
    const res = shouldInitiateIdentifyRequest(cookie, DEFAULT_PROFILE)
    expect(res).toBeTruthy()
  })
  it('should be truthy if cookie is outdated', () => {
    expect.assertions(1)
    const fakeCookie = {
      hash: null,
      lastIdentify: 0,
    }
    const fakeDuration = 1
    const res = shouldInitiateIdentifyRequest(fakeCookie, DEFAULT_PROFILE, fakeDuration)
    expect(res).toBeTruthy()
  })
  it('should be truthy if cookie hash and profile does not match', () => {
    expect.assertions(1)
    const fakeProfile = {
      hash: 'fakeHash',
      lastIdentify: 50,
    }
    const res = shouldInitiateIdentifyRequest(DEFAULT_PROFILE, fakeProfile)
    expect(res).toBeTruthy()
  })
  it('should be falsy if cookie hash and profile matches', () => {
    expect.assertions(1)
    const encodedDefaultProfile = Encode(DEFAULT_PROFILE)
    const fakeCookie = {
      hash: encodedDefaultProfile,
      lastIdentify: 5,
    }
    const res = shouldInitiateIdentifyRequest(fakeCookie, DEFAULT_PROFILE)
    expect(res).toBeFalsy()
  })
})
