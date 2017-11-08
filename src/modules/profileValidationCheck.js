import { isEqual, Encode } from '../utils/Utils'

// last identify is greater than duration
export const cookieDurationIsOutdated = (cookie, duration) => {
  if (!cookie) return true;
  if (cookie && cookie.lastIdentify == undefined) return true;
  return (new Date().getTime() - cookie.lastIdentify) > duration
}

// the given cookie hash is different from the given profile
export const cookieHashAndProfileMatch  =
  (cookie, profile) =>
    isEqual(cookie.hash, Encode(profile))

export const shouldInitiateIdentifyRequest = (cookie, profile, duration) => {
  if (!cookie)
    return true
  if (!cookieHashAndProfileMatch(cookie, profile))
    return true
  if (duration && cookieDurationIsOutdated(cookie, duration))
    return true
  return false
}
