import makeSingleton from './utils/singleton'
import Cookies from './utils/Cookies'

class Eb {
  constructor(trackerKey) {
    this.defaultProfile = {
      hash: null,
      lastIdentify: null
    }
    this.profile = Cookies.getCookie('eb-profile')
    this.trackerKey = trackerKey || null
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
