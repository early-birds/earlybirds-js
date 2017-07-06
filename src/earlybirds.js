import axios from 'axios';
import { isEqual } from 'lodash/fp';
import Config from '../config';

import Cookies from './utils/Cookies';
import Hashcode from './utils/Hashcode';

const HTTP_PROTOCOL     = (document.location.protocol == 'https:' ? 'https://' : 'http://');

class Eb {

  constructor() {

    this.trackerKey = null;
    this.defaultProfile = {
      hash: null,
      lastIdentify: null,
    };
    const cookieContent = Cookies.getCookie('eb-profile');
    this.profile = cookieContent ? JSON.parse(cookieContent) : null;
  }

  // public

  init(trackerKey) {
    this.trackerKey = trackerKey;
    return this;
  }

  identify(profile, options = {
    cookieDuration: 90  // default to 3 months
  }) {
    const cookieContent = Cookies.getCookie('eb-profile');
    const cookie = cookieContent ? JSON.parse(cookieContent) : this.defaultProfile;

    /*
    if (this.noCookie(cookie) || this.lastIdentifyOutdated(cookie, 1000 * 60 * 60) || this.profileHasChanged(cookie)) {
      console.log('identify');
      return this.identifyRequest(profile, options);
    }
    else {
      console.log('do nothing');
    }
    */
    return new Promise(r => r());
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
    console.log(cookie);
    return isEqual(cookie, this.defaultProfile);
  }

  lastIdentifyIsOutdated(cookie, duration) {
    if (!cookie || !cookie.lastIdentify) {
      return true;
    }
    return new Date().getTime() - cookie.lastIdentify > duration;
  }

  profileHasChanged(cookie) {
    const hashProfile = Hashcode.encode(profile);
    return !isEqual(cookie.hash, hashProfile);
  }

  identifyRequest(profile, options) {
    let cookieDuration = options.cookieDuration;
    return axios({
      method: 'post',
      url: `${HTTP_PROTOCOL}${Config.API_URL}/tracker/${this.trackerKey}/identify`,
      data: { profile },
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
    })
    .catch((err) => {
     // console.log(err);
    });
  }

  getRecommendations(widgetId, options) {
    
    return axios({
      method: 'GET',
      url: `${HTTP_PROTOCOL}${Config.API_URL}/widget/${widgetId}/recommendations/${this.profile.id}`,
    })
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
     // console.log(err);
    });
  }
}

module.exports = Eb;
