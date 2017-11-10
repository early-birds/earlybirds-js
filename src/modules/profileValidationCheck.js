import { isEqual, Encode } from '../utils/Utils'

// last identify is greater than duration
export const cookieDurationIsOutdated = (cookie, duration) => {
  if (!cookie) return true;
  if (cookie && cookie.lastIdentify == undefined) return true;
  return (new Date().getTime() - cookie.lastIdentify > duration)
}

// the given cookie hash is different from the given profile
export const cookieHashAndProfileMatch  =
  (profile, cookie) =>
    isEqual(Encode(profile), cookie.hash)

export const cookieDomainMatchGivenHost = (cookie, host) => {
  if (!cookie || !host) return false;
  return (cookie && cookie.domain && host.indexOf(cookie.domain) >= 0)
}

export const shouldInitiateIdentifyRequest = (newProfile, currentProfile, duration) => {
  if (!newProfile) return true;
  if (!currentProfile) {
    return true
  }
  if (!cookieHashAndProfileMatch(newProfile, currentProfile)) {
    return true
  }
  if (duration && cookieDurationIsOutdated(currentProfile, duration)) {
    return true
  }
  return false
}
