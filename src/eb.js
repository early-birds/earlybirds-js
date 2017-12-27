import makeSingleton from './utils/singleton'
import Cookies from './utils/Cookies'
import Config from '../config'
import { Encode } from './utils/Utils'
import {
  cookieDomainMatchGivenHost,
  shouldInitiateIdentifyRequest
} from './checks/profileValidationCheck'

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

          Cookies.setCookie(
            'eb-profile',
            JSON.stringify(profile),
            cookieConfig
          );

          this.profile = profile
          return response;
        })
        .catch(err => {
          throw err;
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
      .then(x => x.json());
  }

  getRecommendations(widgetId, { rescorerParams = {}, variables = {} } = {}) {
    if (!widgetId) return Promise.reject(new Error('WidgetId is mandatory'));
    if (!this.profile) {
      return new Promise((r, j) => j('Earlybirds error: Not identified'));
    }
    const url = `\
${Config.HTTP_PROTOCOL}\
${Config.API_URL}\
/widget/${widgetId}\
/recommendations/${this.profile.id}`
    return fetch(`${url}?rescorerParams=${JSON.stringify(rescorerParams)}&variables=${JSON.stringify(variables)}`)
      .then(x => x.json())
      .catch(err => {
        throw err;
      });
  }

  getRecosForCluster(widgetId, clusterId, { rescorerParams = {}, variables = {} } = {}) {
    if (!widgetId) return Promise.reject(new Error('WidgetId is mandatory'));
    if (!clusterId) return Promise.reject(new Error('Earlybirds error: ClusterId not provided'));
    if (!this.profile) {
      return new Promise((r, j) => j('Earlybirds error: Not identified'));
    }
    const url = `\
${Config.HTTP_PROTOCOL}\
${Config.API_URL}\
/widget/${widgetId}\
/recommendations/cluster/${clusterId}`
    return fetch(`${url}?rescorerParams=${JSON.stringify(rescorerParams)}&variables=${JSON.stringify(variables)}`)
      .then(x => x.json())
      .catch(err => {
        throw err;
      });
  }

  trackActivity(activities) {

    if (!activities) {
      return Promise.reject(new Error('no activities provided'))
    }

    if (!Array.isArray(activities)) {
      activities = [activities];
    }

    const checkActivityInputsErr = checkActivitiesInputs(activities)
    if (checkActivityInputsErr !== true) {
      return Promise.reject(new Error(checkActivityInputsErr));
    }

    const hash = Encode(JSON.stringify(activities))
    if (hash === Cookies.getCookie('eb-lastactivity-hash')) {
      return Promise.resolve();
    }

    const url = `${Config.HTTP_PROTOCOL}${Config.API_URL}/tracker/${this.trackerKey}/activity`;

    return fetch(url, {
      method: 'post',
      body: JSON.stringify({
        activity: activities.map(x => ({ ...x, profile: this.profile.id }))
      }),
    })
      .then(x => x.json())
      .then((response) => {
        if (response.statusCode >= 300 || response.statusCode < 200) {
          throw new Error(response);
        }
        Cookies.setCookie('eb-lastactivity-hash', hash);
        return response;
      })
      .catch((err) => {
        console.log('Earlybirds error : trackActivity', err)
        throw err;
      });
  }

  trackClickOnReco({ _id: { original_id }, id, url }) {
    this.trackActivity({
      verb: 'click-on-reco',
      originalId: id || original_id,
    }).then(() => document.location.href = url)
      .catch((err) => {
        console.error(err);
        document.location.href = url;
      });
  }

  getActivities(widgetId, verb) {
    if (!this.profile) {
      return new Promise((resolve, reject) => {
        reject({
          message: 'Earlybirds error: Not identified'
        })
      })
    }
    if (!widgetId) {
      return new Promise((resolve, reject) => {
        reject({
          message: 'WidgetId is mandatory'
        })
      })
    }
    if (!verb) {
      return new Promise((resolve, reject) => {
        reject({
          message: 'Earlybirds error: Verb not provided'
        })
      })
    }
    const url =
      `${Config.HTTP_PROTOCOL}\
${Config.API_URL}/widget/\
${widgetId}/products-by-verb/\
${this.profile.id}/${verb}`;

    return fetch(url, {
      method: 'get'
    })
      .then(x => x.json())
      .catch(err => {
        console.log('Earlybirds js : ', err.message)
        throw err
      })

    console.log(url)
  }
}

export default makeSingleton(Eb)
