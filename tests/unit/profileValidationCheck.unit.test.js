import {
  cookieDurationIsOutdated,
  cookieHashAndProfileMatch,
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
      expect(cookieHashAndProfileMatch({ hash: 'hash' }, defaultProfile)).toBeFalsy()
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
})
