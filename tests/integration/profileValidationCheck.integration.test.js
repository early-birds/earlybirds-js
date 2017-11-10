import { Encode } from '../../src/utils/Utils'
import {
  shouldInitiateIdentifyRequest } from '../../src/modules/profileValidationCheck'

beforeEach(() => {
  global.DEFAULT_PROFILE = {
    hash: null,
    lastIdentify: null,
  }
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
  it('should use identify second parameter to set the duration', () => {
  })
})
