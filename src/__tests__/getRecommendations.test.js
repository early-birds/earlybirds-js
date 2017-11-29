import Eb from '../eb'
import Mock from '../../tests/mock'
import Cookies from '../utils/Cookies'
import { Encode } from '../utils/Utils'

beforeEach(() => {
  new Eb().reset()
  Mock.start()
})

afterEach(() => {
  Mock.restore()
})

describe('Recommendations', () => {
  it('should return a promise that reject with the\
    value "Earlybirds error: Not identified" if not identified yet', () => {
      const eb = new Eb().getInstance()
      eb
        .getRecommendations('fakeWidgetId')
        .catch(err => {
          expect(err).toBe('Earlybirds error: Not identified')
        })
    })
  it('should be falsy if no widgetId is provided', () => {
    const eb = new Eb().getInstance()
    const res = eb.getRecommendations()
    expect(res).toBe(false)
  })
  it('should make a http call (happy path)', () => {
    const eb = new Eb().getInstance('fakeTrackerKey')
    eb.profile = {}
    const res = eb.getRecommendations('fakeWidgetId')
    expect(fetch).toBeCalled()
  })
  it('should return an object with recommendations and widget', done => {
    expect.assertions(2)
    const fakeResponse = {}
    fakeResponse.json = () => (
      new Promise(r =>
        r({
          recommendations: {},
          widget: {}
        })
      )
    )
    fetch = jest.fn(() => (
      new Promise(r => r(fakeResponse))
    ))
    const eb = new Eb().getInstance()
    eb.profile = {}
    eb
      .getRecommendations('fakeWidgetId')
      .then(response => {
        expect(response.recommendations).toBeDefined()
        expect(response.widget).toBeDefined()
        done()
      })
  })
  it('should catch errors', () => {
    expect.assertions(1)
    fetch = jest.fn(() => {
      return new Promise((resolve, reject) => reject('FAKE_ERROR_RECOS'))
    })
    const eb = new Eb().getInstance()
    eb.profile = {}
    eb
      .getRecommendations('fakeWidgetId')
      .catch(err => {
        expect(err).toBe('FAKE_ERROR_RECOS')
      })
  })
})
