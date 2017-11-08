import makeSingleton from './utils/singleton'
import Cookies from './utils/Cookies'
import Config from '../config'
import { Encode } from './utils/Utils'
import {
  shouldInitiateIdentifyRequest } from './modules/profileValidationCheck'

const HTTP_PROTOCOL     = (document.location.protocol == 'https:' ? 'https://' : 'http://');

class Eb {
  constructor(trackerKey) {
    this.defaultProfile = {
      hash: null,
      lastIdentify: null
    }
    this.profile = this.retrieveEbProfile()
    this.trackerKey = trackerKey || null
  }
  retrieveEbProfile() {
    return Cookies.getCookie('eb-profile') || this.defaultProfile
  }
  init(trackerKey) {
    this.trackerKey = trackerKey
  }
  identify(profile) {
    if (profile === undefined) return null;
    if (!this.trackerKey) return null;
    if (shouldInitiateIdentifyRequest(profile, this.defaultProfile)) {
      return fetch(`${HTTP_PROTOCOL}${Config.API_URL}/tracker/${this.trackerKey}/identify`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      })
      .then(x => x.json())
      .then(response => {
        const newProfile = {
          ...response.profile,
          lastIdentify: new Date().getTime(),
          hash: Encode(profile)
        }
        Cookies.setCookie(JSON.stringify(newProfile));
        //this.profile = newProfile
        return response;
      })
      .catch(console.log)
    }
    return this.defaultProfile;
  }
  getRecommendations() {
  }
  trackActivity() {
  }
}

export default makeSingleton(Eb)
