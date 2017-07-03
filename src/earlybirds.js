import $ from 'jquery';
import axios from 'axios';
import _ from 'lodash';
import { isEqual } from 'lodash/fp';

import Cookies from './utils/Cookies';
import Hashcode from './utils/Hashcode';

class Eb {

  constructor() {
    this.trackerKey = null;
    this.defaultProfile = {
      hash: null,
      lastIdentify: null
    };
  }

  // public

  init(trackerKey) {
    this.trackerKey = trackerKey;
  }

  identify(profile) {

    let cookieEbProfile = JSON.parse(Cookies.getCookie('eb-profile')) || this.defaultProfile;

    if (noCookie.apply(this) || lastIdentifyOutdated() || profileHasChanged()) {
      console.log('identify');
      return this._identify(profile);
    }
    else {
      console.log('do nothing');
      return new Promise(r => r());
    }

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
      let hashProfile = Hashcode.encode(profile);
      return !isEqual(cookieEbProfile.hash, hashProfile);
    }
  }

  trackActivity(activity) {

    return axios({
      method: 'post',
      url: `http://api.early-birds.fr/tracker/${this.trackerKey}/activity`,
      data: {
        activity: [{
          original_id: activity.original_id,
          verb: activity.verb,
          profile: this.profile.id
        }],
      }
    });
  }

  // private

  _identify(profile) {
    return axios({
      method: 'post',
      url: `http://api.early-birds.fr/tracker/${this.trackerKey}/identify`,
      data: {
        profile: profile
      }
    })
    .then((response) => {
      let _profile = {
        ...response.data.profile,
        lastIdentify: new Date().getTime(),
        hash: Hashcode.encode(profile)
      }
      if (response.cookie &&
        response.cookie.domain &&
        document.location.hostname.indexOf(result.cookie.domain) >= 0) {
        _profile.cookie = response.cookie;
      }
      Cookies.setCookie('eb-profile', JSON.stringify(_profile));
    })
  }
}

module.exports = Eb;
