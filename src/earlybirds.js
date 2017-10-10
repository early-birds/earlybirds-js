const Config = require('../config');
const Encode = require('./utils/Encode');
const Cookies = require('./utils/Cookies');
const IsEqual = require('./utils/IsEqual');
//const axios = require('axios');
//import 'whatwg-fetch'

const HTTP_PROTOCOL     = (document.location.protocol == 'https:' ? 'https://' : 'http://');
var instance = null;
function Eb(options) {
  if (instance) {
    return instance; 
  }
  instance = this;
  this.defaultProfile = {
    hash: null,
    lastIdentify: null,
  };
  console.log(Cookies)
  this.profile = Cookies.getCookie('eb-profile');
  console.log(options);
  if (options && options.trackerKey) {
    this.init(options.trackerKey)
  }
}
Eb.prototype.init = function(trackerKey) {
  this.trackerKey = trackerKey;
  return this;
}
Eb.prototype.identify = function(profile, options = {
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

Eb.prototype.trackActivity = function(activity) {
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
Eb.prototype.noCookieEbProfile = function(cookie) {
  return IsEqual(cookie, this.defaultProfile);
}

Eb.prototype.lastIdentifyIsOutdated = function(cookie, duration) {
  if (!cookie || !cookie.lastIdentify) {
    return true;
  }
  return new Date().getTime() - cookie.lastIdentify > duration;
}

Eb.prototype.profileHasChanged = function(cookie, profile) {
  const hashProfile = Encode(profile);
  return !IsEqual(cookie.hash, hashProfile);
}

Eb.prototype.identifyRequest = function(profile, options) {
  let cookieDuration = options.cookieDuration;
  return fetch(`${HTTP_PROTOCOL}${Config.API_URL}/tracker/${this.trackerKey}/identify`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profile)
  })
  .then(x => x.json())
  .then((response) => {
    const newProfile = {
      ...response.profile,
      lastIdentify: new Date().getTime(),
      hash: Encode(profile),
    };
    if (
      response.cookie &&
      response.cookie.domain &&
      document.location.hostname.indexOf(response.cookie.domain) >= 0
    ) {
      newProfile.cookie = response.cookie;
      cookieDuration = response.cookie.expires || cookieDuration;
    }
    Cookies.setCookie('eb-profile', JSON.stringify(newProfile), cookieDuration);
    this.profile = newProfile;
    return response;
  })
  .catch((err) => {
    return err;
  });
}

Eb.prototype.getRecommendations = function(widgetId, options) {
  console.log('get recos')
  if (!this.profile) {
    return new Promise((r, j) => j('no profile'));
  }
  return fetch(`${HTTP_PROTOCOL}${Config.API_URL}/widget/${widgetId}/recommendations/${this.profile.id}`)
}

module.exports = Eb;
