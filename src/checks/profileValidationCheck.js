import { isEqual, Encode } from '../utils/Utils';

// last identify is greater than duration
export const cookieDurationIsOutdated = (cookie, duration) => {
  if (!cookie) return true;
  if (cookie && cookie.lastIdentify === undefined) return true;
  return ((cookie.lastIdentify + duration) < new Date().getTime());
};

// the given cookie hash is different from the given profile
export const cookieHashAndProfileMatch =
  (profile, cookie) => {
    if (profile && cookie && cookie.hash) {
      return Encode(profile).toString() === cookie.hash.toString();
    }
    return false;
  };

export const cookieDomainMatchGivenHost = (cookie, host) => {
  if (!cookie || !host) return false;
  return (cookie && cookie.domain && host.indexOf(cookie.domain) >= 0);
};

export const shouldInitiateIdentifyRequest = (newProfile, currentProfile, duration) => {
  if (!newProfile || !currentProfile ||
      !cookieHashAndProfileMatch(newProfile, currentProfile) ||
      (duration && cookieDurationIsOutdated(currentProfile, duration))) {
    return true;
  }
  return false;
};
