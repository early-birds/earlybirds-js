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
  }

  // public

  init(trackerKey) {
    this.trackerKey = trackerKey;
  }

  identify(profile, options = {
    cookieDuration: 90  // default to 3 months
  }) {
    const cookieEbProfile = JSON.parse(Cookies.getCookie('eb-profile')) || this.defaultProfile;
    function noCookie() {
      return isEqual(cookieEbProfile, this.defaultProfile);
    }

    function lastIdentifyOutdated() {
      if (!cookieEbProfile || !cookieEbProfile.lastIdentify) {
        return true;
      }
      return new Date().getTime() - cookieEbProfile.lastIdentify > 1000 * 60 * 60;
    }

    function profileHasChanged() {
      const hashProfile = Hashcode.encode(profile);
      return !isEqual(cookieEbProfile.hash, hashProfile);
    }

    if (noCookie.apply(this) || lastIdentifyOutdated() || profileHasChanged()) {
      console.log('identify');
      return this.identifyRequest(profile, options);
    }
    else {
      console.log('do nothing');
    }
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
        console.log('reset cookie');
        cookieDuration = response.cookie.expires || cookieDuration;
      }
      Cookies.setCookie('eb-profile', JSON.stringify(newProfile), cookieDuration);
    })
    .catch((err) => {
     // console.log(err);
    });
  }
}

module.exports = Eb;
