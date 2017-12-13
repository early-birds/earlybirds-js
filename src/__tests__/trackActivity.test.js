import Eb from '../eb'
import Mock from '../../tests/mock'
import Cookies from '../utils/Cookies'
import Config from '../../config'
import { Encode } from '../utils/Utils'

beforeEach(() => {
  new Eb().reset()
  Mock.start()
})

afterEach(() => {
  Mock.restore()
})

describe('Track Activity', () => {

  it('should return a promise that reject to "no activities provided" if not activities is provided', done => {
    expect.assertions(1)
    const eb = new Eb().getInstance()
    eb
      .trackActivity()
      .catch(err => {
        expect(err.message).toBe('no activities provided')
        done()
      })

  })

  it('should return a promise that reject to "empty field originalId in one activity" if originalId is missing in activity object', done => {
    expect.assertions(1)
    const eb = new Eb().getInstance()
    const fakeInputs = [
      {
        profile: 'FAKE_PROFILE',
        verb: 'FAKE_VERB'
      }
    ]
    eb
      .trackActivity(fakeInputs)
      .catch(err => {
        expect(err.message).toBe('empty field originalId in one activity')
        done()
      })
  })

  it('should make a http request if inputs are ok then set the eb-lastactivity-hash cookie (happy path)', done => {
    expect.assertions(2)
    const eb = new Eb().getInstance('fakeTrackerKey')
    eb.profile = { id: 'FAKE_ID' }
    const fakeInputs = [
      {
        profile: 'FAKE_ID',
        originalId: 'FAKE_ID',
        verb: 'FAKE_VERB'
      }
    ]
    const hash = Encode(JSON.stringify(fakeInputs))
    eb
      .trackActivity(fakeInputs)
      .then(() => {
        expect(Cookies.setCookie).toBeCalledWith('eb-lastactivity-hash', hash)
        done()
      })
    const url = `${Config.HTTP_PROTOCOL}${Config.API_URL}/tracker/fakeTrackerKey/activity`
    expect(fetch).toBeCalledWith(
      url,
      {
        method: 'post',
        body: JSON.stringify({
          activity: fakeInputs
        })
      }
    )
  })

  it('should not make an http request if eb-lastactivity-hash cookie is not new', () => {
    expect.assertions(1)
    const fakeInputs = [
      {
        profile: 'FAKE_PROFILE',
        originalId: 'FAKE_ID',
        verb: 'FAKE_VERB'
      }
    ]
    const fakeHash = Encode(JSON.stringify(fakeInputs))
    Cookies.getCookie = jest.fn(() => fakeHash)

    const eb = new Eb().getInstance()
    eb.trackActivity(fakeInputs)
    expect(fetch).not.toBeCalled()
  })

  it('should return an object with activities property', done => {
    expect.assertions(1)
    const fakeResponse = {}
    fakeResponse.json = () => (
      new Promise(r =>
        r({
          activities: [],
        })
      )
    )
    const fakeInputs = [
      {
        profile: 'FAKE_PROFILE',
        originalId: 'FAKE_ID',
        verb: 'FAKE_VERB'
      }
    ]
    fetch = jest.fn(() => (
      new Promise(r => r(fakeResponse))
    ))
    const eb = new Eb().getInstance()
    eb.profile = { id: 'FAKE_ID' }
    eb
      .trackActivity(fakeInputs)
      .then(response => {
        expect(response.activities).toBeDefined()
        done()
      })
  })

  it('should catch errors', () => {
    expect.assertions(1)
    const fakeInputs = [
      {
        profile: 'FAKE_PROFILE',
        originalId: 'FAKE_ID',
        verb: 'FAKE_VERB'
      }
    ]
    fetch = jest.fn(() => {
      return new Promise((resolve, reject) => reject('FAKE_ERROR'))
    })
    const eb = new Eb().getInstance()
    eb.profile = { id: 'FAKE_ID' }
    eb
      .trackActivity(fakeInputs)
      .catch(err => {
        expect(err).toBe('FAKE_ERROR')
      })
  })
})
