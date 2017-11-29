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

  it('should return false if not activities is provided', () => {
    expect.assertions(1)
    const eb = new Eb().getInstance()
    expect(eb.trackActivity()).toEqual(false);
  })

  it('should return false if originalId is missing in activity object', () => {
    expect.assertions(1)
    const eb = new Eb().getInstance()
    const fakeInputs = [
      {
        profile: 'FAKE_PROFILE',
        verb: 'FAKE_VERB'
      }
    ]
    expect(eb.trackActivity(fakeInputs)).toEqual(false);
  })

  it('should make a http request if inputs are ok then set the eb-lastactivity-hash cookie (happy path)', done => {
    expect.assertions(2)
    const eb = new Eb().getInstance('fakeTrackerKey')
    const fakeInputs = [
      {
        profile: 'FAKE_PROFILE',
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
    eb
      .trackActivity(fakeInputs)
      .catch(err => {
        expect(err).toBe('FAKE_ERROR')
      })
  })
})
