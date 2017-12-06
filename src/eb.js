import makeSingleton from './utils/singleton'
import Cookies from './utils/Cookies'
import Config from '../config'
import { Encode } from './utils/Utils'
import {
  cookieDomainMatchGivenHost,
  shouldInitiateIdentifyRequest } from './checks/profileValidationCheck'

import { checkActivitiesInputs } from './checks/trackActivityCheck'

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

  identify(newProfile = { profile: {} }, options = {
    cookieDuration: 90
  }) {
    if (!this.trackerKey) return null;
    if (shouldInitiateIdentifyRequest(newProfile, this.profile)) {
      console.log('start identify')
      return this.identifyRequest(newProfile)
        .then(response => {
          console.log('ok')
          console.log(response)
          const profile = {
            ...response.profile,
            lastIdentify: new Date().getTime(),
            hash: Encode(newProfile)
          }
          const cookieConfig =
            cookieDomainMatchGivenHost(response.cookie, this.hostname) ?
            response.cookie : this.defaultCookieConfig

          Cookies.setCookie(
            'eb-profile',
            JSON.stringify(profile),
            cookieConfig
          );

          this.profile = profile
          return response;
        })
    }
    return new Promise(r => r(this.profile));
  }

  identifyRequest(profile) {
    const url = `\
${Config.HTTP_PROTOCOL}\
${Config.API_URL}\
/tracker/${this.trackerKey}/identify`;
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

  getRecommendations(widgetId, { rescorerParams = {} } = {}) {
    if (!widgetId) return Promise.reject();
    if (!this.profile) {
      return new Promise((r, j) => j('Earlybirds error: Not identified'));
    }
    const url = `\
${Config.HTTP_PROTOCOL}\
${Config.API_URL}\
/widget/${widgetId}\
/recommendations/${this.profile.id}`
    return fetch(`${url}?rescorerParams=${JSON.stringify(rescorerParams)}`)
    .then(x => x.json())
    .catch(err => {
      console.error(err);
      throw err
    })
  }

  trackActivity(activities) {

    const checkActivityInputsErr = checkActivitiesInputs(activities)
    if (checkActivityInputsErr !== true) {
      return false
    }

    const hash = Encode(JSON.stringify(activities))
    if (hash === Cookies.getCookie('eb-lastactivity-hash')) {
      console.log('Earlybirds : can\'t track the same activity twice')
      return false
    }

    const url = `\
${Config.HTTP_PROTOCOL}\
${Config.API_URL}\
/tracker/${this.trackerKey}\
/activity`
    return fetch(url, {
      method: 'post',
      body: JSON.stringify({
        activity: activities.map(x => ({...x, profile: this.profile.id}))
      })
    })
    .then(x => x.json())
    .then(response => {
      Cookies.setCookie('eb-lastactivity-hash', hash)
      return response
    })
    .catch(err => {
      console.log('Earlybirds error : trackActivity', err)
      throw err
    })
  }
}

export default makeSingleton(Eb)
