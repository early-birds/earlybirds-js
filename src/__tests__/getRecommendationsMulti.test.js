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

describe('Get multi recos', () => {

  it('should return a promise that reject with the\
    value "Earlybirds error: Not identified" \
    if not identified yet', done => {

    expect.assertions(1)
    const eb = new Eb().getInstance()
    eb
      .getRecommendationsMulti('FAKE_WIDGET_IDS')
      .catch(err => {
        expect(err.message).toBe('Earlybirds error: Not identified')
        done()
      })
  })

  it('should return a promise that reject to \
  "WidgetIds are mandatory" if no widgetIds \
  is provided', done => {

    expect.assertions(1)
    const eb = new Eb().getInstance()
    eb.profile = 'FAKE_PROFILE'
    eb
      .getRecommendationsMulti()
      .catch(err => {
        expect(err.message).toBe('WidgetIds are mandatory')
        done()
      })
  })

  it('should make a http call (happy path)', () => {
    expect.assertions(1)
    const eb = new Eb().getInstance('fakeTrackerKey')
    eb.profile = { id : 'fakeProfile' }
    const widgetIds = 'id1;id2;id3'
    const res = eb.getRecommendationsMulti('fakeWidgetIds')
    const expected =
      `${Config.HTTP_PROTOCOL}${Config.API_URL}\/\
widget/multi/fakeWidgetIds/recommendations/\
fakeProfile?rescorerParams={}&variables={}`

    expect(fetch).toHaveBeenCalledWith(expected)
  })
})
