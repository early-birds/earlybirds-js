import axios from 'axios';
import isEqual from 'lodash.isequal';
import Config from '../config';
import Cookies from './utils/Cookies';
import Hashcode from './utils/Hashcode';

const HTTP_PROTOCOL     = (document.location.protocol == 'https:' ? 'https://' : 'http://');

let instance = null;
class Eb {

  constructor(options) {
    if (instance) {
      return instance; 
    }
    instance = this;
    this.trackerKey = null;
    this.defaultProfile = {
      hash: null,
      lastIdentify: null,
    };
    this.profile = Cookies.getCookie('eb-profile');
    if (options && options.trackerKey) {
      this.init(options.trackerKey)
    }
  }

  // public

  init(trackerKey) {
    this.trackerKey = trackerKey;
    return this;
  }

  identify(profile, options = {
    cookieDuration: 90  // default to 3 months
  }) {
    console.log('identify')
    const cookie = Cookies.getCookie('eb-profile') || this.defaultProfile;
    if (this.noCookieEbProfile(cookie) ||
        this.lastIdentifyIsOutdated(cookie, 1000 * 60 * 60) ||
        this.profileHasChanged(cookie, profile)) {
      console.log('initiate identify request')
      return this.identifyRequest(profile, options);
    }
    else {
      console.log('return the same profile')
      console.log(this.profile)
    }
    return new Promise(r => r({
      data: {
        profile: this.profile
      }
    }));
  }

  trackActivity(activity) {
    return axios({
      method: 'post',
      url: `${HTTP_PROTOCOL}${Config.API_URL}/tracker/${this.trackerKey}/activity`,
      data: {
        activity: [{
          original_id: activity.original_id,
          verb: activity.verb,
          profile: this.profile.id,
        }],
      },
    });
  }

  // private
  noCookieEbProfile(cookie) {
    return isEqual(cookie, this.defaultProfile);
  }

  lastIdentifyIsOutdated(cookie, duration) {
    if (!cookie || !cookie.lastIdentify) {
      return true;
    }
    return new Date().getTime() - cookie.lastIdentify > duration;
  }

  profileHasChanged(cookie, profile) {
    const hashProfile = Hashcode.encode(profile);
    return !isEqual(cookie.hash, hashProfile);
  }

  identifyRequest(profile, options) {
    let cookieDuration = options.cookieDuration;
    return axios({
      method: 'post',
      url: `${HTTP_PROTOCOL}${Config.API_URL}/tracker/${this.trackerKey}/identify`,
      data: profile,
    })
    .then((response) => {
      const newProfile = {
        ...response.data.profile,
        lastIdentify: new Date().getTime(),
        hash: Hashcode.encode(profile),
      };
      if (response.cookie &&
        response.cookie.domain &&
        document.location.hostname.indexOf(response.cookie.domain) >= 0) {
        newProfile.cookie = response.cookie;
        cookieDuration = response.cookie.expires || cookieDuration;
      }
      Cookies.setCookie('eb-profile', JSON.stringify(newProfile), cookieDuration);
      this.profile = newProfile;
      return response;
    })
    .catch((err) => {
    });
  }

  getRecommendations(widgetId, options) {
    console.log('get recos')
    if (!this.profile) {
      return new Promise((r, j) => j('no profile'));
    }
    return axios({
      method: 'GET',
      url: `${HTTP_PROTOCOL}${Config.API_URL}/widget/${widgetId}/recommendations/${this.profile.id}`,
    })
  }
}

module.exports = Eb;
