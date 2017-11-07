import makeSingleton from './utils/singleton'
import Cookies from './utils/Cookies'
import {
  cookieMatchProfile,
  lastIdentifyOutdated,
  profileHasChanged } from './modules/profileValidationCheck'

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
  identify() {
    
  }
  getRecommendations() {
  }
  trackActivity() {
  }
}

export default makeSingleton(Eb)
