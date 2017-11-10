import {
  cookieDurationIsOutdated,
  cookieHashAndProfileMatch,
  cookieDomainMatchGivenHost,
  shouldInitiateIdentifyRequest } from '../../src/modules/profileValidationCheck'
import { Encode } from '../../src/utils/Utils'

const defaultProfile = {
  hash: null,
  lastIdentify: null,
}

describe('profileValidationCheck', () => {
  describe('ebCookieMatchProfile', () => {

    it('should be truthy if cookie hash and defaultProfile are the same', () => {
      expect(cookieHashAndProfileMatch({ hash: Encode(defaultProfile) }, defaultProfile)).toBeTruthy()
    })
    it('should be falsy if cookie hash and defaultProfile are different', () => {
      expect(cookieHashAndProfileMatch(defaultProfile, { hash: 'hash' })).toBeFalsy()
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
