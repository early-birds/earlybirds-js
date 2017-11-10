import makeSingleton from './utils/singleton'
import Cookies from './utils/Cookies'
import Config from '../config'
import { Encode } from './utils/Utils'
import {
  cookieDomainMatchGivenHost,
  shouldInitiateIdentifyRequest } from './modules/profileValidationCheck'

const HTTP_PROTOCOL     = (document.location.protocol == 'https:' ? 'https://' : 'http://');

class Eb {
  constructor(trackerKey) {
    this.defaultProfile = {
      hash: null,
      lastIdentify: null
    }
    this.defaultCookieConfig = {
      expires: 365
    }
    this.hostname = document.location.hostname
    this.profile = this.retrieveEbProfile()
    this.trackerKey = trackerKey || null
  }
  retrieveEbProfile() {
    return Cookies.getCookie('eb-profile') || null
  }
  init(trackerKey) {
    this.trackerKey = trackerKey
  }
  identify(newProfile, options = {
    cookieDuration: 90
  }) {
    if (newProfile === undefined) return null;
    if (!this.trackerKey) return null;
    if (shouldInitiateIdentifyRequest(newProfile, this.profile)) {
      return this.identifyRequest(newProfile)
      .then(response => {
        const profile = {
          ...response.profile,
          lastIdentify: new Date().getTime(),
          hash: Encode(newProfile)
        }
        const cookieConfig =
          cookieDomainMatchGivenHost(response.cookie, this.hostname) ?
          response.cookie : this.defaultCookieConfig

        Cookies.setCookie('eb-profile', JSON.stringify(profile), cookieConfig);
        this.profile = profile
        return response;
      })
      .catch(console.log)
    }
    return this.defaultProfile;
  }
  identifyRequest(profile) {
    const url = `${HTTP_PROTOCOL}${Config.API_URL}/tracker/${this.trackerKey}/identify`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profile)
    })
    .then(x => x.json())
  }
  getRecommendations(widgetId) {
    if (!this.profile) {
      return new Promise((r, j) => j('no profile'));
    }
    return fetch(`${HTTP_PROTOCOL}${Config.API_URL}/widget/${widgetId}/recommendations/${this.profile.id}?nocache=true`)
      .then(x => x.json())
  }
  trackActivity(activity) {
    return fetch(`${HTTP_PROTOCOL}${Config.API_URL}/tracker/${this.trackerKey}/activity`, {
      method: 'post',
      body: JSON.stringify({
        activity: [{
          original_id: activity.original_id,
          verb: activity.verb,
          profile: this.profile.id,
        }],
      })
    }).then(x => x.json())
  }
}

export default makeSingleton(Eb)
