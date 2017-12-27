import Eb from '../eb'
import Mock from '../../tests/mock'
import Config from '../../config'

beforeEach(() => {
  new Eb().reset()
  Mock.start()
})

afterEach(() => {
  Mock.restore()
})

describe('Get Activities', () => {

  it('should return a promise that reject with the\
    value "Earlybirds error: Not identified" \
    if not identified yet', done => {

    expect.assertions(1)
    const eb = new Eb().getInstance()
    eb
      .getActivities()
      .catch(err => {
        expect(err.message)
          .toBe('Earlybirds error: Not identified')

        done()
      })
  })

  it('should return a promise that reject to \
  "WidgetId is mandatory" if no widgetId \
  is provided', done => {

    expect.assertions(1)
    const eb = new Eb().getInstance()
    eb.profile = 'FAKE_PROFILE'
    eb
      .getActivities()
      .catch(err => {
        console.warn(err)
        expect(err.message).toBe('WidgetId is mandatory')
        done()
      })
  })

  it('should return a promise that reject with the\
    value "Earlybirds error: Verb not provided" \
    if the verb not provided', done => {

    expect.assertions(1)
    const eb = new Eb().getInstance()
    eb.profile = 'FAKE_PROFILE'
    eb
      .getActivities('FAKE_WIDGET_ID')
      .catch(err => {
        expect(err.message)
          .toBe('Earlybirds error: Verb not provided')

        done()
      })
  })

  it('should make a http call (happy path)', () => {
    expect.assertions(1)
    const eb = new Eb().getInstance('fakeTrackerKey')
    eb.profile = { id : 'fakeProfile' }
    const res = eb.getActivities('fakeWidgetId', 'fakeVerb')
    const expected =
      `${Config.HTTP_PROTOCOL}${Config.API_URL}\/\
widget/fakeWidgetId/products-by-verb/\
fakeProfile/fakeVerb`

    expect(fetch).toHaveBeenCalledWith(expected, { method: 'get' })
  })
})
